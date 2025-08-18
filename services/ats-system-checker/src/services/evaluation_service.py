"""
Evaluation Service for ATS System
Orchestrates CV processing, AI evaluation, and quiz functionality
"""

import json
import logging
import asyncio
from typing import List, Dict, Any, Optional
from werkzeug.utils import secure_filename

import httpx
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
    
    def __init__(self, ai_service_url: str, email_service: EmailService, database_service: DatabaseService):
        """
        Initialize evaluation service with required dependencies
        
        Args:
            ai_service_url: URL for the AI service (e.g., http://localhost:5000)
            email_service: Service for sending email notifications
            database_service: Service for database operations
        """
        self.ai_service_url = ai_service_url
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
            
            # Check if AI service is available
            if not self.ai_service_url or not self.ai_service_url.strip():
                logger.warning("AI service URL not configured, using fallback quiz generation")
                return self._generate_fallback_quiz(job_description)
            
            # Generate quiz using AI service with retry mechanism
            quiz_questions = None
            max_retries = 3
            
            for attempt in range(max_retries):
                logger.info(f"Quiz generation attempt {attempt + 1}/{max_retries}")
                
                try:
                    # Call AI service for quiz generation
                    async with httpx.AsyncClient() as client:
                        response = await client.post(
                            f"{self.ai_service_url}/generate-quiz",
                            json={
                                "job_description": job_description,
                                "num_questions": 10
                            },
                            timeout=60
                        )
                        response.raise_for_status()
                        ai_result = response.json()
                        quiz_questions = ai_result.get("questions", [])
                    
                    if quiz_questions:
                        logger.info(f" Successfully generated quiz on attempt {attempt + 1}")
                        break
                    else:
                        logger.warning(f" Quiz generation attempt {attempt + 1} failed")
                        if attempt < max_retries - 1:
                            logger.info("Retrying quiz generation...")
                            
                except Exception as ai_error:
                    logger.warning(f"AI service quiz generation failed on attempt {attempt + 1}: {ai_error}")
                    if attempt < max_retries - 1:
                        logger.info("Retrying quiz generation...")
                    else:
                        logger.warning("All AI service attempts failed, using fallback quiz generation")
                        return self._generate_fallback_quiz(job_description)
            
            if not quiz_questions:
                logger.error("Failed to generate quiz questions after all attempts")
                return self._generate_fallback_quiz(job_description)
            
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
            return self._generate_fallback_quiz(job_description)

    def _generate_fallback_quiz(self, job_description: str) -> Dict[str, Any]:
        """
        Generates a fallback quiz when the AI service is not available.
        This method provides a minimal set of questions to ensure the application
        process can continue, but it's not as robust as AI-generated quizzes.
        """
        logger.warning("Using fallback quiz generation due to unavailable AI service.")
        questions = [
            {
                "question": "What is the main purpose of this job?",
                "options": ["To earn money", "To gain experience", "To contribute to society"],
                "correct_answer": 2
            },
            {
                "question": "What are the key responsibilities of the role?",
                "options": ["Writing code", "Managing people", "Analyzing data"],
                "correct_answer": 1
            },
            {
                "question": "What are the required qualifications for this position?",
                "options": ["Bachelor's degree", "10 years of experience", "Both"],
                "correct_answer": 2
            },
            {
                "question": "What is the expected salary for this role?",
                "options": ["$50,000 - $70,000", "$100,000 - $150,000", "$200,000+"],
                "correct_answer": 0
            },
            {
                "question": "What is the work location for this job?",
                "options": ["On-site", "Remote", "Hybrid"],
                "correct_answer": 0
            }
        ]
        return {
            "questions": questions,
            "job_description": job_description,
            "num_questions": len(questions)
        }
    

    

    
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
            
            # Extract candidate name from CV text (optional: call AI for name extraction if needed)
            greeting_name = candidate_name
            if not greeting_name:
                # Optionally, call AI API for name extraction
                greeting_name = None
            # Call AI service for evaluation (with graceful fallback)
            ai_result = None
            decision = "UNKNOWN"
            score = 0
            evaluation_text = ""

            if self.ai_service_url and self.ai_service_url.strip():
                try:
                    # Resolve AI URL; prefer 127.0.0.1 to avoid IPv6/localhost issues
                    ai_url_base = self.ai_service_url.replace("localhost", "127.0.0.1")
                    async with httpx.AsyncClient() as client:
                        response = await client.post(
                            f"{ai_url_base}/evaluate",
                            json={
                                "cv_text": cv_text,
                                "job_description": job_posting.description,
                                "filename": f"application_{application_id}"
                            },
                            timeout=60
                        )
                        response.raise_for_status()
                        ai_result = response.json()
                    decision = ai_result.get("decision", "UNKNOWN")
                    score = ai_result.get("score", 0)
                    evaluation_text = ai_result.get("reasoning", "")
                    logger.info(f"AI evaluation successful: decision={decision}, score={score}")
                except Exception as ai_error:
                    logger.warning(f"AI evaluation failed, using heuristic fallback: {ai_error}")
                    # Fallback to heuristic evaluation
                    decision, score, evaluation_text = self._heuristic_evaluation(cv_text, job_posting)
            else:
                logger.warning("AI service URL not configured, using heuristic fallback")
                # Use heuristic evaluation when AI service is not available
                decision, score, evaluation_text = self._heuristic_evaluation(cv_text, job_posting)
            # AI service doesn't return email in the response, so use the provided candidate_email
            email = candidate_email
            # Determine if candidate meets threshold
            meets_threshold = score >= job_posting.evaluation_threshold
            final_decision = "ACCEPTED" if meets_threshold else "REJECTED"
            
            # Save CV evaluation to database (from AI or fallback)
            await self.database_service.save_cv_evaluation(
                filename=f"application_{application_id}",
                job_description=job_posting.description,
                decision=EvaluationDecision(final_decision),
                score=score,
                evaluation_text=evaluation_text,
                cv_text_length=len(cv_text),
                email=email,
                processing_time_ms=None  # Could be calculated if needed
            )
            
            # Update application status
            await self.database_service.update_application_status(
                application_id=application_id,
                status=final_decision,
                cv_score=score,
                decision=final_decision
            )
            
            # Send appropriate email based on decision
            if candidate_email and self.email_service:
                if meets_threshold:
                    # Send acceptance email with quiz invitation
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
                        else:
                            # If quiz generation fails, just send a simple acceptance email
                            await self.email_service.send_evaluation_notification(
                                to_email=candidate_email,
                                filename=f"application_{application_id}",
                                decision="ACCEPTED",
                                score=score,
                                evaluation_text=evaluation_text,
                                candidate_name=greeting_name
                            )
                            await self.database_service.update_application_status(
                                application_id, "ACCEPTED"
                            )
                    else:
                        # If quiz is not required, send direct interview invitation
                        await self.email_service.send_interview_invitation(
                            to_email=candidate_email,
                            job_title=job_posting.title,
                            hr_contact=job_posting.hr_name or "HR Team",
                            candidate_name=greeting_name
                        )
                        await self.database_service.update_application_status(
                            application_id, "INTERVIEW_SCHEDULED"
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

            
            # Create result object
            result = CVEvaluationResult(
                filename=f"application_{application_id}",
                decision=EvaluationDecision(final_decision),
                score=score,
                evaluation_text=evaluation_text,
                text_length=len(cv_text),
                email=email,
                candidate_name=greeting_name
            )
            
            logger.info(f"CV evaluation complete: {final_decision}, Score: {score}/{job_posting.evaluation_threshold}")
            return result
            
        except Exception as e:
            logger.error(f"Error in CV evaluation workflow: {e}")
            # As a last resort, ensure application reflects a failed but non-null score of 0
            try:
                await self.database_service.update_application_status(
                    application_id, "EVALUATION_FAILED", cv_score=0
                )
            except Exception:
                pass
            return None
    
    def _heuristic_evaluation(self, cv_text: str, job_posting) -> tuple[str, int, str]:
        """
        Provide fallback evaluation when AI service is not available
        
        Args:
            cv_text: CV text content
            job_posting: Job posting object
            
        Returns:
            tuple: (decision, score, evaluation_text)
        """
        import re
        
        # Heuristic fallback: score based on keyword coverage from required skills + job description
        job_desc = (job_posting.description or "")
        raw_tokens = re.split(r"[,\n\r;]+", job_desc)
        desc_skills = [t.strip().lower() for t in raw_tokens if t and len(t.strip()) > 1]
        desc_skills = [re.sub(r"[^a-z0-9+#\.\- ]", "", s) for s in desc_skills]
        desc_skills = [s for s in desc_skills if s]

        # Include explicit required skills from the job posting model
        required_skills_list = []
        try:
            if getattr(job_posting, "required_skills", None):
                required_skills_list = [str(s).strip().lower() for s in job_posting.required_skills if str(s).strip()]
        except Exception:
            required_skills_list = []

        # Combine and de-duplicate while preserving order
        combined: list[str] = []
        seen = set()
        for s in required_skills_list + desc_skills:
            if not s or s in seen:
                continue
            seen.add(s)
            combined.append(s)

        skills = combined
        
        cv_lower = (cv_text or "").lower()
        matched = [s for s in skills if s and s in cv_lower]
        coverage = (len(matched) / max(1, len(skills))) if skills else 0
        score = int(round(coverage * 100))
        
        decision = "ACCEPTED" if score >= job_posting.evaluation_threshold else "REJECTED"
        evaluation_text = (
            f"Heuristic evaluation using required skills + description keywords: "
            f"matched {len(matched)} of {len(skills)} ['" + ", ".join(matched[:10]) + ("..." if len(matched) > 10 else "") + "']. "
            f"Score: {score}/{job_posting.evaluation_threshold} required."
        )
        
        logger.info(f"Heuristic evaluation: score={score}, decision={decision}, matched_skills={matched}")
        
        return decision, score, evaluation_text

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
            # Create job description from requirements
            job_description = "Job Requirements:\n" + "\n".join(f"- {req}" for req in job_requirements)
            
            # For now, return a placeholder since this method is not used in the main workflow
            # and would require file processing capabilities that are not available in this service
            logger.warning("evaluate_application method is deprecated and not used in main workflow")
            
            return {
                "decision": "UNKNOWN",
                "score": 0,
                "reasoning": "This method is deprecated. Use evaluate_cv_for_job instead.",
                "extracted_skills": [],
                "experience_years": 0
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
        quiz_session_id: str,
        email: str
    ) -> Dict[str, Any]:
        """
        Evaluate quiz submission and determine pass/fail status
        
        Args:
            answers: Quiz answers as JSON string
            quiz_session_id: Quiz session ID (required for validation and security)
            email: Candidate email address (required for security validation)
            
        Returns:
            Dict[str, Any]: Quiz evaluation results with score and status
        """
        import json
        from datetime import datetime, timedelta
        
        try:
            logger.info(f"🧮 Evaluating quiz submission for quiz session: {quiz_session_id}, email: {email}")
            
            # Validate quiz session ID is provided
            if not quiz_session_id:
                raise ValueError("Quiz session ID is required for quiz submission")
            
            # Check if quiz has already been completed
            existing_result = await self.database_service.get_quiz_result_by_session_id(quiz_session_id)
            if existing_result:
                raise ValueError("Quiz has already been completed. You cannot submit answers multiple times.")
            
            # Get quiz session to validate it exists and is accessible
            quiz_session = await self.database_service.get_quiz_session_by_id(quiz_session_id)
            if not quiz_session:
                raise ValueError("Quiz session not found or invalid")
            
            if quiz_session.status == "COMPLETED":
                raise ValueError("Quiz has already been completed")
            
            if quiz_session.status == "EXPIRED":
                raise ValueError("Quiz session has expired")
            
            # SECURITY CHECK: Validate email matches the quiz session email
            if quiz_session.candidate_email and email.lower() != quiz_session.candidate_email.lower():
                raise ValueError(f"Email address '{email}' does not match the email used in the original application ('{quiz_session.candidate_email}'). Please use the same email address that was used when submitting your CV.")
            
            # Parse the submitted answers
            try:
                logger.info(f" Parsing quiz answers: {answers[:100]}...")
                answers_list = json.loads(answers)
                logger.info(f" Successfully parsed answers: {len(answers_list)} items")
                
            except json.JSONDecodeError as e:
                logger.error(f" Invalid JSON data for answers: {e}")
                raise ValueError(f"Invalid quiz answers format: {str(e)}")
            
            # Get quiz questions from the quiz session
            questions_list = quiz_session.questions
            if not questions_list:
                raise ValueError("Quiz questions not found in the database")
            
            logger.info(f" Retrieved {len(questions_list)} questions from database")
            
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
            pass_threshold = quiz_session.pass_threshold  # Use the threshold from the quiz session
            status = "PASSED" if score >= pass_threshold else "FAILED"
            percentage = round((score / total_questions) * 100, 1)
            
            logger.info(f" Quiz evaluation complete: {score}/{total_questions} ({status}) - {percentage}%")
            
            # Get application_id from quiz session
            application_id = None
            if quiz_session.associated_cv_filename:
                # Extract application_id from associated_cv_filename (format: "application_{application_id}")
                if quiz_session.associated_cv_filename.startswith("application_"):
                    application_id = quiz_session.associated_cv_filename.replace("application_", "")
                    logger.info(f" Extracted application_id: {application_id} from quiz session")
                else:
                    logger.warning(f" Quiz session associated_cv_filename format unexpected: {quiz_session.associated_cv_filename}")
            else:
                logger.warning(" Quiz session has no associated_cv_filename")
            
            # Save quiz result to database
            quiz_result = await self.database_service.save_quiz_result(
                quiz_session_id=quiz_session_id,
                answers=answers_list,
                score=score,
                total_questions=total_questions,
                percentage=percentage,
                status=status,
                candidate_email=email,
                associated_cv_filename=f"application_{application_id}" if application_id else None
            )
            
            # Update quiz session status to completed
            await self.database_service.update_quiz_session_status(
                quiz_session_id=quiz_session_id,
                status="COMPLETED",
                completed_at=datetime.now()
            )
            
            # Update application status if we have an application_id
            if application_id:
                await self.database_service.update_application_status(
                    application_id=application_id,
                    status="QUIZ_COMPLETED",
                    quiz_score=score
                )
                logger.info(f" Updated application {application_id} with quiz results")
            
            # If passed, send interview invitation
            if status == "PASSED" and email:
                # Get application details to send proper interview invitation
                application = None
                if application_id:
                    application = await self.database_service.get_application_by_id(application_id)
                
                # Get job posting details
                job_posting = None
                if application:
                    job_posting = await self.database_service.get_job_posting_by_id(application.get("job_id"))
                
                # Send interview invitation email
                if job_posting:
                    await self.email_service.send_interview_invitation(
                        to_email=email,
                        job_title=job_posting.title,
                        hr_contact=job_posting.hr_name or "HR Team",
                        candidate_name=application.get("candidate_name") if application else None
                    )
                else:
                    # Fallback if we can't get job details
                    await self.email_service.send_interview_invitation(
                        to_email=email,
                        job_title="the position",
                        hr_contact="HR Team",
                        candidate_name=None
                    )
                
                # Update application status to indicate interview scheduled
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


 