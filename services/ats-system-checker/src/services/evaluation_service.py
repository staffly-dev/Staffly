"""
Evaluation Service for ATS System
Orchestrates CV processing, AI evaluation, and quiz functionality
"""

import json
import logging
import asyncio
from typing import List, Dict, Any, Optional
from werkzeug.utils import secure_filename

from ai.services.cohere_service import CohereService
from ai.services.document_service import DocumentProcessingService
from src.models.evaluation_models import (
    EvaluationDecision
)
from typing import NamedTuple
from datetime import datetime

class CVEvaluationResult(NamedTuple):
    """Simple result class for CV evaluation"""
    filename: str
    decision: EvaluationDecision
    score: int
    evaluation_text: str
    text_length: int
    email: Optional[str]
    candidate_name: Optional[str]
from src.services.email_service import EmailService
from src.services.database_service import DatabaseService

logger = logging.getLogger(__name__)


class EvaluationService:
    """Main service for handling CV evaluations and quiz generation"""
    
    def __init__(
        self,
        cohere_service: CohereService,
        document_service: DocumentProcessingService,
        email_service: EmailService,
        database_service: DatabaseService
    ):
        """
        Initialize evaluation service with required dependencies
        
        Args:
            cohere_service: AI service for evaluations and quiz generation
            document_service: Service for document processing
            email_service: Service for sending email notifications
            database_service: Service for database operations
        """
        self.cohere_service = cohere_service
        self.document_service = document_service
        self.email_service = email_service
        self.database_service = database_service
    async def generate_quiz(self, job_description: str) -> Optional[Dict[str, Any]]:
        """
        Generate a quiz based on job description for job applications
        
        Args:
            job_description: Job description for quiz generation
            
        Returns:
            Optional[Dict]: Generated quiz data with questions or None if failed
        """
        try:
            logger.info(f"Generating quiz for job application")
            
            # Generate quiz using AI with retry mechanism
            quiz_questions = None
            max_retries = 3
            
            for attempt in range(max_retries):
                logger.info(f"Quiz generation attempt {attempt + 1}/{max_retries}")
                quiz_questions = self.cohere_service.generate_quiz(job_description)
                
                if quiz_questions:
                    logger.info(f" Successfully generated quiz on attempt {attempt + 1}")
                    break
                else:
                    logger.warning(f" Quiz generation attempt {attempt + 1} failed")
                    if attempt < max_retries - 1:
                        logger.info("Retrying quiz generation...")
            
            if not quiz_questions:
                logger.error("Failed to generate quiz questions after all attempts")
                return None
            
            # Return quiz data as simple dictionary
            result = {
                "questions": quiz_questions,
                "job_description": job_description,
                "num_questions": len(quiz_questions)
            }
            
            logger.info(f"Successfully generated quiz with {len(quiz_questions)} questions")
            return result
            
        except Exception as e:
            logger.error(f"Error generating quiz: {e}")
            return None

    

    

    
    async def evaluate_cv_for_job(
        self,
        cv_text: str,
        job_posting,
        application_id: str,
        candidate_email: Optional[str] = None,
        candidate_name: Optional[str] = None
    ) -> Optional[CVEvaluationResult]:
        """
        Evaluate CV specifically for a job posting and handle the complete workflow
        
        Args:
            cv_text: Extracted CV text
            job_posting: JobPosting database object
            application_id: Application ID for tracking
            candidate_email: Candidate email address
            
        Returns:
            Optional[CVEvaluationResult]: Evaluation result
        """
        try:
            logger.info(f"Evaluating CV for job: {job_posting.title}")
            
            # Extract candidate name from CV text
            greeting_name = candidate_name
            if not greeting_name:
                greeting_name = self.document_service.extract_name_from_text(cv_text)
            logger.info(f"Extracted candidate name: {greeting_name}")
            
            # Generate evaluation using AI
            evaluation_result = self.cohere_service.evaluate_cv(cv_text, job_posting.description)
            
            if not evaluation_result:
                logger.error("Failed to generate AI evaluation")
                await self.database_service.update_application_status(
                    application_id, "EVALUATION_FAILED"
                )
                return None
            
            # Parse evaluation result
            decision, score = self.cohere_service.parse_evaluation_result(evaluation_result)
            
            # Determine if candidate meets threshold
            meets_threshold = score >= job_posting.evaluation_threshold
            final_decision = "ACCEPTED" if meets_threshold else "REJECTED"
            
            # Update application status
            await self.database_service.update_application_status(
                application_id=application_id,
                status=final_decision,
                cv_score=score,
                cv_evaluation_text=evaluation_result,
                decision=EvaluationDecision(final_decision)
            )
            
            # Send appropriate email based on decision
            if candidate_email and self.email_service:
                if meets_threshold:
                    # Send acceptance email
                    if job_posting.quiz_required:
                        # Generate quiz and send quiz invitation
                        quiz_result = await self.generate_quiz(job_posting.description)
                        if quiz_result:
                            # Create quiz session for this specific application
                            quiz_session = await self.database_service.save_quiz_session(
                                job_description=job_posting.description,
                                questions=quiz_result["questions"],
                                candidate_email=candidate_email,
                                associated_cv_filename=f"application_{application_id}"
                            )
                            
                            await self.email_service.send_acceptance_email_with_quiz(
                                to_email=candidate_email,
                                job_title=job_posting.title,
                                score=score,
                                quiz_questions=quiz_result["questions"],
                                application_id=application_id,
                                quiz_session_id=str(quiz_session.id),
                                candidate_name=greeting_name
                            )
                            await self.database_service.update_application_status(
                                application_id, "QUIZ_SENT"
                            )
                            await self.database_service.add_email_to_application(
                                application_id, "QUIZ_INVITATION"
                            )
                        else:
                            # Fallback to interview invitation if quiz generation fails
                            await self.email_service.send_interview_invitation(
                                to_email=candidate_email,
                                job_title=job_posting.title,
                                hr_contact=job_posting.hr_name or "HR Team",
                                candidate_name=greeting_name
                            )
                            await self.database_service.update_application_status(
                                application_id, "INTERVIEW_SCHEDULED"
                            )
                            await self.database_service.add_email_to_application(
                                application_id, "INTERVIEW_INVITATION"
                            )
                    else:
                        # Send direct interview invitation
                        await self.email_service.send_interview_invitation(
                            to_email=candidate_email,
                            job_title=job_posting.title,
                            hr_contact=job_posting.hr_name or "HR Team",
                            candidate_name=greeting_name
                        )
                        await self.database_service.update_application_status(
                            application_id, "INTERVIEW_SCHEDULED"
                        )
                        await self.database_service.add_email_to_application(
                            application_id, "INTERVIEW_INVITATION"
                        )
                else:
                    # Send rejection email
                    await self.email_service.send_rejection_email(
                        to_email=candidate_email,
                        job_title=job_posting.title,
                        score=score,
                        threshold=job_posting.evaluation_threshold,
                        candidate_name=greeting_name
                    )
                    await self.database_service.add_email_to_application(
                        application_id, "REJECTION"
                    )
            
            # Create result object
            result = CVEvaluationResult(
                filename=f"application_{application_id}",
                decision=EvaluationDecision(final_decision),
                score=score,
                evaluation_text=evaluation_result,
                text_length=len(cv_text),
                email=candidate_email,
                candidate_name=greeting_name
            )
            
            logger.info(f"CV evaluation complete: {final_decision}, Score: {score}/{job_posting.evaluation_threshold}")
            return result
            
        except Exception as e:
            logger.error(f"Error in CV evaluation workflow: {e}")
            # Update application status to failed
            try:
                await self.database_service.update_application_status(
                    application_id, "EVALUATION_FAILED"
                )
            except:
                pass
            return None
    
    async def evaluate_application(
        self,
        cv_file_path: str,
        job_requirements: List[str],
        applicant_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Evaluate application for test compatibility
        
        Args:
            cv_file_path: Path to CV file
            job_requirements: List of job requirements
            applicant_data: Applicant data dictionary
            
        Returns:
            Dict[str, Any]: Evaluation result as dictionary
        """
        try:
            # Extract text from CV file
            cv_text = self.document_service.extract_text_from_file(cv_file_path)
            
            # Create job description from requirements
            job_description = "Job Requirements:\n" + "\n".join(f"- {req}" for req in job_requirements)
            
            # Get AI evaluation
            evaluation_result = self.cohere_service.evaluate_cv_match(cv_text, job_requirements)
            
            if not evaluation_result:
                return {
                    "decision": "UNKNOWN",
                    "score": 0,
                    "reasoning": "Failed to evaluate CV",
                    "extracted_skills": [],
                    "experience_years": 0
                }
            
            # Return result as dictionary for test compatibility
            return {
                "decision": evaluation_result.decision.value,
                "score": evaluation_result.score,
                "reasoning": evaluation_result.reasoning,
                "extracted_skills": evaluation_result.extracted_skills,
                "experience_years": evaluation_result.experience_years
            }
            
        except Exception as e:
            logger.error(f"Error in evaluate_application: {e}")
            return {
                "decision": "ERROR",
                "score": 0,
                "reasoning": f"Evaluation error: {str(e)}",
                "extracted_skills": [],
                "experience_years": 0
            }

    async def evaluate_quiz_submission(
        self,
        answers: str,
        quiz_data: str,
        email: Optional[str] = None,
        application_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Evaluate quiz submission and determine pass/fail status
        
        Args:
            answers: Quiz answers as JSON string
            quiz_data: Quiz questions data as JSON string
            email: Candidate email address
            application_id: Application ID for linking quiz result
            
        Returns:
            Dict[str, Any]: Quiz evaluation results with score and status
        """
        import json
        from datetime import datetime, timedelta
        
        try:
            logger.info(f"🧮 Evaluating quiz submission for application: {application_id}, email: {email}")
            
            # Parse the submitted data
            try:
                logger.info(f" Parsing quiz data - answers: {answers[:100]}...")
                logger.info(f" Parsing quiz data - quiz_data: {quiz_data[:100]}...")
                
                answers_list = json.loads(answers)
                questions_list = json.loads(quiz_data)
                
                logger.info(f" Successfully parsed - answers: {len(answers_list)} items, questions: {len(questions_list)} items")
                
            except json.JSONDecodeError as e:
                logger.error(f" Invalid JSON data: {e}")
                raise ValueError(f"Invalid quiz data format: {str(e)}")
            
            # Calculate score using business logic
            score = 0
            total_questions = len(questions_list)
            
            for i, question_data in enumerate(questions_list):
                # Get the submitted answer for this question
                submitted_answer = answers_list[i] if i < len(answers_list) and answers_list[i] is not None else None
                
                if submitted_answer is not None:
                    # Find the correct answer from question data
                    correct_answer = question_data.get('correct_answer', 0)
                    
                    if submitted_answer == correct_answer:
                        score += 1
                        logger.debug(f" Question {i+1}: Correct")
                    else:
                        logger.debug(f" Question {i+1}: Wrong (submitted: {submitted_answer}, correct: {correct_answer})")
                else:
                    logger.debug(f" Question {i+1}: No answer provided")
            
            # Determine pass/fail status (business rule)
            pass_threshold = 7  # This could be made configurable
            status = "PASSED" if score >= pass_threshold else "FAILED"
            percentage = round((score / total_questions) * 100, 1)
            
            logger.info(f" Quiz evaluation complete: {score}/{total_questions} ({status}) - {percentage}%")
            
            # Save quiz result to database
            quiz_result = await self.database_service.save_quiz_result(
                quiz_session_id="",  # Empty string instead of None
                answers=answers_list,
                score=score,
                total_questions=total_questions,
                percentage=percentage,
                status=status,
                candidate_email=email,
                associated_cv_filename=f"application_{application_id}" if application_id else None
            )
            
            # Update application status if we have an application_id
            if application_id:
                await self.database_service.update_application_status(
                    application_id=application_id,
                    status="QUIZ_COMPLETED",
                    quiz_score=score,
                    quiz_passed=(status == "PASSED")
                )
                logger.info(f" Updated application {application_id} with quiz results")
            
            # If passed, schedule interview
            if status == "PASSED" and email:
                await self.schedule_interview(email, score, total_questions)
                
                # Also update application status to indicate interview scheduled
                if application_id:
                    await self.database_service.update_application_status(
                        application_id=application_id,
                        status="INTERVIEW_SCHEDULED"
                    )
            
            # Send email notification
            if email:
                try:
                    await self.email_service.send_quiz_result_email(
                        to_email=email,
                        score=score,
                        total=total_questions,
                        status=status,
                        quiz_result_id=str(quiz_result.id) if quiz_result else None,
                        candidate_name=None  # We don't have candidate name in quiz evaluation context
                    )
                    logger.info(f" Quiz result email sent to: {email}")
                except Exception as e:
                    logger.error(f" Failed to send quiz result email: {e}")
            
            # Return structured result
            return {
                "score": score,
                "total_questions": total_questions,
                "status": status,
                "percentage": percentage,
                "quiz_result_id": str(quiz_result.id) if quiz_result else None,
                "message": "Quiz completed successfully!",
                "next_steps": (
                    "Congratulations! You passed the quiz. An interview invitation will be sent to your email shortly."
                    if status == "PASSED"
                    else "Thank you for taking the quiz. While you didn't pass this time, we appreciate your interest."
                )
            }
            
        except ValueError as e:
            # Re-raise validation errors for controller to handle as 400
            raise e
        except Exception as e:
            logger.error(f" Error evaluating quiz: {e}")
            raise Exception(f"Failed to evaluate quiz: {str(e)}")

    async def schedule_interview(self, email: str, quiz_score: int, total_questions: int) -> Dict[str, Any]:
        """
        Schedule an interview for a candidate who passed the quiz
        
        Args:
            email: Candidate email
            quiz_score: Quiz score achieved
            total_questions: Total number of questions
            
        Returns:
            Dict[str, Any]: Interview scheduling result
        """
        try:
            from datetime import datetime, timedelta
            
            logger.info(f" Scheduling interview for {email} (score: {quiz_score}/{total_questions})")
            
            # Calculate interview date (business logic: 3-5 business days from now)
            today = datetime.now()
            days_to_add = 3
            interview_date = today + timedelta(days=days_to_add)
            
            # Adjust for weekends (business rule)
            while interview_date.weekday() >= 5:  # 5 = Saturday, 6 = Sunday
                interview_date += timedelta(days=1)
            
            interview_time = interview_date.replace(hour=10, minute=0, second=0, microsecond=0)  # 10 AM
            
            # Create interview record in database
            interview_record = await self.database_service.create_interview_record(
                candidate_email=email,
                quiz_score=quiz_score,
                total_questions=total_questions,
                scheduled_date=interview_time,
                status="SCHEDULED"
            )
            
            # Send interview invitation email
            await self.email_service.send_interview_invitation_email(
                to_email=email,
                interview_date=interview_time,
                quiz_score=quiz_score,
                total_questions=total_questions,
                candidate_name=None  # We don't have candidate name in quiz result context
            )
            
            logger.info(f" Interview scheduled for {email} on {interview_time.strftime('%Y-%m-%d %H:%M')}")
            
            return {
                "scheduled_date": interview_time,
                "status": "SCHEDULED",
                "message": f"Interview scheduled for {interview_time.strftime('%Y-%m-%d at %H:%M')}"
            }
            
        except Exception as e:
            logger.error(f" Failed to schedule interview for {email}: {e}")
            # Don't raise the error, as the quiz evaluation should still succeed
            return {
                "status": "FAILED",
                "message": f"Failed to schedule interview: {str(e)}"
            }
 