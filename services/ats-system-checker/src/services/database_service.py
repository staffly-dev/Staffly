"""
Database Service for ATS System
Handles MongoDB connections and database operations using Beanie ODM
"""

import logging
import hashlib
from datetime import datetime, date
from typing import List, Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from src.models.database_models import (
    CVEvaluation,
    QuizSession,
    QuizResult,
    JobPosting,
    Application,
    SystemMetrics,
    EmailNotification
)
from src.models.evaluation_models import EvaluationDecision

logger = logging.getLogger(__name__)


class DatabaseService:
    """Service for handling MongoDB database operations"""
    
    def __init__(self, mongodb_url: str, database_name: str):
        """
        Initialize database service
        
        Args:
            mongodb_url: MongoDB connection URL
            database_name: Database name to use
        """
        self.mongodb_url = mongodb_url
        self.database_name = database_name
        self.client: Optional[AsyncIOMotorClient] = None
        self.database = None
    
    async def connect(self):
        """Connect to MongoDB and initialize Beanie"""
        try:
            # Create MongoDB client
            self.client = AsyncIOMotorClient(self.mongodb_url)
            self.database = self.client[self.database_name]
            
            # Initialize Beanie with document models
            await init_beanie(
                database=self.database,
                document_models=[
                    CVEvaluation,
                    QuizSession,
                    QuizResult,
                    JobPosting,
                    Application,
                    SystemMetrics,
                    EmailNotification
                ]
            )
            
        except Exception as e:
            logger.error(f" Failed to connect to MongoDB: {e}")
            raise
    
    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
            logger.info(" Disconnected from MongoDB")
    
    async def health_check(self) -> bool:
        """Check database connectivity"""
        try:
            if not self.client:
                return False
            
            # Ping the database
            await self.client.admin.command('ping')
            return True
            
        except Exception as e:
            logger.error(f" Database health check failed: {e}")
            return False
    
    def _generate_hash(self, text: str) -> str:
        """Generate hash for job description to group related evaluations"""
        return hashlib.md5(text.encode()).hexdigest()
    
    async def save_cv_evaluation(
        self,
        filename: str,
        job_description: str,
        decision: EvaluationDecision,
        score: int,
        evaluation_text: str,
        cv_text_length: int,
        email: Optional[str] = None,
        processing_time_ms: Optional[int] = None
    ) -> CVEvaluation:
        """
        Save CV evaluation to database
        
        Args:
            filename: CV filename
            job_description: Job description used for evaluation
            decision: Evaluation decision
            score: Evaluation score
            evaluation_text: Full evaluation text
            cv_text_length: Length of CV text
            email: Extracted email
            processing_time_ms: Processing time in milliseconds
            
        Returns:
            CVEvaluation: Saved evaluation document
        """
        try:
            job_description_hash = self._generate_hash(job_description)
            
            evaluation = CVEvaluation(
                filename=filename,
                job_description=job_description,
                job_description_hash=job_description_hash,
                decision=decision,
                score=score,
                evaluation_text=evaluation_text,
                cv_text_length=cv_text_length,
                email=email,
                processing_time_ms=processing_time_ms
            )
            
            await evaluation.save()
            logger.info(f" Saved CV evaluation for {filename} with score {score}")
            return evaluation
            
        except Exception as e:
            logger.error(f" Failed to save CV evaluation: {e}")
            raise
    
    async def save_quiz_session(
        self,
        job_description: str,
        questions: List[Dict[str, Any]],
        associated_cv_filename: Optional[str] = None,
        candidate_email: Optional[str] = None,
        time_limit_seconds: int = 300,
        pass_threshold: int = 7
    ) -> QuizSession:
        """
        Save quiz session to database
        
        Args:
            job_description: Job description used for quiz
            questions: Quiz questions and options
            associated_cv_filename: Associated CV filename
            candidate_email: Candidate email
            time_limit_seconds: Time limit for quiz
            pass_threshold: Minimum score to pass
            
        Returns:
            QuizSession: Saved quiz session document
        """
        try:
            job_description_hash = self._generate_hash(job_description)
            
            quiz_session = QuizSession(
                job_description=job_description,
                job_description_hash=job_description_hash,
                questions=questions,
                total_questions=len(questions),
                associated_cv_filename=associated_cv_filename,
                candidate_email=candidate_email,
                time_limit_seconds=time_limit_seconds,
                pass_threshold=pass_threshold
            )
            
            await quiz_session.save()
            logger.info(f" Saved quiz session with {len(questions)} questions")
            return quiz_session
            
        except Exception as e:
            logger.error(f" Failed to save quiz session: {e}")
            raise
    
    async def get_quiz_session_by_id(self, quiz_id: str) -> Optional[QuizSession]:
        """
        Get quiz session by ID
        
        Args:
            quiz_id: Quiz session ID (ObjectId format)
            
        Returns:
            Optional[QuizSession]: Quiz session if found
        """
        try:
            # Only try ObjectId lookup if it's the right format (24 hex characters)
            if len(quiz_id) == 24 and all(c in '0123456789abcdefABCDEF' for c in quiz_id):
                try:
                    quiz_session = await QuizSession.get(quiz_id)
                    return quiz_session
                except:
                    # If ObjectId lookup fails, return None
                    pass
            
            # For non-ObjectId formats, return None
            # The calling code should handle job ID lookups differently
            return None
            
        except Exception as e:
            logger.error(f" Failed to get quiz session by ID {quiz_id}: {e}")
            return None
    
    async def get_quiz_session_for_job(self, job_id: str) -> Optional[QuizSession]:
        """
        Get the most recent quiz session for a specific job
        
        Args:
            job_id: Job posting ID
            
        Returns:
            Optional[QuizSession]: Most recent quiz session for this job
        """
        try:
            # Find job posting first
            job_posting = await self.get_job_posting_by_id(job_id)
            if not job_posting:
                return None
            
            # Find most recent quiz session for this job's description
            job_description_hash = self._generate_hash(job_posting.description)
            quiz_session = await QuizSession.find_one(
                QuizSession.job_description_hash == job_description_hash,
                sort=[("created_at", -1)]  # Most recent first
            )
            
            return quiz_session
            
        except Exception as e:
            logger.error(f" Failed to get quiz session for job {job_id}: {e}")
            return None
    
    async def save_quiz_result(
        self,
        quiz_session_id: str,
        answers: List[int],
        score: int,
        total_questions: int,
        percentage: float,
        status: str,
        candidate_email: Optional[str] = None,
        associated_cv_filename: Optional[str] = None,
        time_taken_seconds: Optional[int] = None
    ) -> QuizResult:
        """
        Save quiz result to database
        
        Args:
            quiz_session_id: Reference to quiz session
            answers: Selected answers
            score: Number of correct answers
            total_questions: Total questions
            percentage: Percentage score
            status: PASSED or FAILED
            candidate_email: Candidate email
            associated_cv_filename: Associated CV filename
            time_taken_seconds: Time taken to complete
            
        Returns:
            QuizResult: Saved quiz result document
        """
        try:
            quiz_result = QuizResult(
                quiz_session_id=quiz_session_id,
                answers=answers,
                score=score,
                total_questions=total_questions,
                percentage=percentage,
                status=status,
                candidate_email=candidate_email,
                associated_cv_filename=associated_cv_filename,
                time_taken_seconds=time_taken_seconds
            )
            
            await quiz_result.save()
            logger.info(f" Saved quiz result: {score}/{total_questions} - {status}")
            return quiz_result
            
        except Exception as e:
            logger.error(f" Failed to save quiz result: {e}")
            raise
    
    async def get_evaluation_statistics(self) -> Dict[str, Any]:
        """
        Get evaluation statistics from database
        
        Returns:
            Dict[str, Any]: Statistics dictionary
        """
        try:
            # Get basic counts
            total_evaluations = await CVEvaluation.count()
            total_accepted = await CVEvaluation.find(
                CVEvaluation.decision == EvaluationDecision.ACCEPTED
            ).count()
            total_rejected = await CVEvaluation.find(
                CVEvaluation.decision == EvaluationDecision.REJECTED
            ).count()
            
            # Calculate acceptance rate
            acceptance_rate = (total_accepted / total_evaluations * 100) if total_evaluations > 0 else 0
            
            # Get average score
            pipeline = [
                {"$group": {"_id": None, "avg_score": {"$avg": "$score"}}}
            ]
            avg_result = await CVEvaluation.aggregate(pipeline).to_list(1)
            average_score = avg_result[0]["avg_score"] if avg_result else 0
            
            # Get score distribution
            score_distribution = {
                "0-20": await CVEvaluation.find(CVEvaluation.score <= 20).count(),
                "21-40": await CVEvaluation.find(CVEvaluation.score > 20, CVEvaluation.score <= 40).count(),
                "41-60": await CVEvaluation.find(CVEvaluation.score > 40, CVEvaluation.score <= 60).count(),
                "61-80": await CVEvaluation.find(CVEvaluation.score > 60, CVEvaluation.score <= 80).count(),
                "81-100": await CVEvaluation.find(CVEvaluation.score > 80).count(),
            }
            
            # Get daily counts for last 30 days
            thirty_days_ago = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            recent_evaluations = await CVEvaluation.find(
                CVEvaluation.created_at >= thirty_days_ago
            ).to_list()
            
            daily_counts = {}
            for evaluation in recent_evaluations:
                date_str = evaluation.created_at.strftime("%Y%m%d")
                daily_counts[date_str] = daily_counts.get(date_str, 0) + 1
            
            return {
                "total_evaluations": total_evaluations,
                "total_accepted": total_accepted,
                "total_rejected": total_rejected,
                "acceptance_rate": round(acceptance_rate, 2),
                "average_score": round(average_score, 2),
                "score_distribution": score_distribution,
                "daily_counts": daily_counts
            }
            
        except Exception as e:
            logger.error(f" Failed to get evaluation statistics: {e}")
            return {}
    
    async def get_quiz_statistics(self) -> Dict[str, Any]:
        """
        Get quiz statistics from database
        
        Returns:
            Dict[str, Any]: Quiz statistics dictionary
        """
        try:
            total_quizzes_generated = await QuizSession.count()
            total_quizzes_completed = await QuizResult.count()
            total_quizzes_passed = await QuizResult.find(QuizResult.status == "PASSED").count()
            
            pass_rate = (total_quizzes_passed / total_quizzes_completed * 100) if total_quizzes_completed > 0 else 0
            
            # Get average quiz score
            pipeline = [
                {"$group": {"_id": None, "avg_score": {"$avg": "$score"}}}
            ]
            avg_result = await QuizResult.aggregate(pipeline).to_list(1)
            average_quiz_score = avg_result[0]["avg_score"] if avg_result else 0
            
            return {
                "total_quizzes_generated": total_quizzes_generated,
                "total_quizzes_completed": total_quizzes_completed,
                "total_quizzes_passed": total_quizzes_passed,
                "quiz_pass_rate": round(pass_rate, 2),
                "average_quiz_score": round(average_quiz_score, 2)
            }
            
        except Exception as e:
            logger.error(f" Failed to get quiz statistics: {e}")
            return {}
    
    async def update_daily_metrics(
        self,
        evaluations_count: int = 0,
        quizzes_generated: int = 0,
        quizzes_completed: int = 0,
        files_processed: int = 0,
        api_calls: int = 0
    ):
        """
        Update daily metrics in database
        
        Args:
            evaluations_count: Number of evaluations processed
            quizzes_generated: Number of quizzes generated
            quizzes_completed: Number of quizzes completed
            files_processed: Number of files processed
            api_calls: Number of API calls
        """
        try:
            today = date.today().strftime("%Y-%m-%d")
            
            # Find or create today's metrics
            metrics = await SystemMetrics.find_one(SystemMetrics.date == today)
            
            if not metrics:
                metrics = SystemMetrics(date=today)
            
            # Update metrics
            metrics.evaluations_count += evaluations_count
            metrics.quizzes_generated += quizzes_generated
            metrics.quizzes_completed += quizzes_completed
            metrics.files_processed += files_processed
            metrics.api_calls += api_calls
            metrics.updated_at = datetime.now()
            
            await metrics.save()
            
        except Exception as e:
            logger.error(f" Failed to update daily metrics: {e}")
    
    async def save_email_notification(
        self,
        recipient_email: str,
        notification_type: str,
        subject: str,
        body: str,
        cv_evaluation_id: Optional[str] = None,
        quiz_result_id: Optional[str] = None
    ) -> EmailNotification:
        """
        Save email notification to database
        
        Args:
            recipient_email: Recipient email address
            notification_type: Type of notification (CV_RESULT, QUIZ_RESULT, SYSTEM)
            subject: Email subject
            body: Email body
            cv_evaluation_id: Reference to CV evaluation
            quiz_result_id: Reference to quiz result
            
        Returns:
            EmailNotification: Saved notification document
        """
        try:
            notification = EmailNotification(
                recipient_email=recipient_email,
                notification_type=notification_type,
                subject=subject,
                body=body,
                cv_evaluation_id=cv_evaluation_id,
                quiz_result_id=quiz_result_id
            )
            
            await notification.save()
            logger.info(f" Saved email notification to {recipient_email}")
            return notification
            
        except Exception as e:
            logger.error(f" Failed to save email notification: {e}")
            raise
    
    async def update_email_notification_status(
        self,
        notification_id: str,
        status: str,
        error_message: Optional[str] = None
    ):
        """
        Update email notification status
        
        Args:
            notification_id: Notification ID
            status: New status (SENT, FAILED)
            error_message: Error message if failed
        """
        try:
            notification = await EmailNotification.get(notification_id)
            if notification:
                notification.status = status
                if status == "SENT":
                    notification.sent_at = datetime.now()
                if error_message:
                    notification.error_message = error_message
                    notification.retry_count += 1
                
                await notification.save()
                logger.info(f" Updated email notification status: {status}")
            
        except Exception as e:
            logger.error(f" Failed to update email notification status: {e}")
    
    async def save_or_update_job_posting(
        self,
        title: str,
        description: str,
        required_skills: List[str] = None,
        preferred_skills: List[str] = None,
        experience_level: Optional[str] = None,
        education_requirements: Optional[str] = None
    ) -> JobPosting:
        """
        Save or update job posting based on description
        
        Args:
            title: Job title
            description: Job description
            required_skills: Required skills
            preferred_skills: Preferred skills
            experience_level: Experience level
            education_requirements: Education requirements
            
        Returns:
            JobPosting: Saved or updated job posting
        """
        try:
            description_hash = self._generate_hash(description)
            
            # Try to find existing job posting
            existing_job = await JobPosting.find_one(
                JobPosting.description_hash == description_hash
            )
            
            if existing_job:
                # Update existing job posting stats
                existing_job.total_applications += 1
                existing_job.updated_at = datetime.now()
                await existing_job.save()
                logger.info(f" Updated existing job posting: {existing_job.title}")
                return existing_job
            else:
                # Create new job posting
                job_posting = JobPosting(
                    title=title,
                    description=description,
                    description_hash=description_hash,
                    required_skills=required_skills or [],
                    preferred_skills=preferred_skills or [],
                    experience_level=experience_level,
                    education_requirements=education_requirements,
                    total_applications=1
                )
                
                await job_posting.save()
                logger.info(f" Created new job posting: {title}")
                return job_posting
            
        except Exception as e:
            logger.error(f" Failed to save job posting: {e}")
            raise
    
    async def update_job_posting_stats(
        self,
        job_description: str,
        decision: EvaluationDecision,
        score: int
    ):
        """
        Update job posting statistics based on evaluation results
        
        Args:
            job_description: Job description
            decision: Evaluation decision
            score: Evaluation score
        """
        try:
            description_hash = self._generate_hash(job_description)
            job_posting = await JobPosting.find_one(
                JobPosting.description_hash == description_hash
            )
            
            if job_posting:
                if decision == EvaluationDecision.ACCEPTED:
                    job_posting.total_accepted += 1
                elif decision == EvaluationDecision.REJECTED:
                    job_posting.total_rejected += 1
                
                # Update average score
                total_with_scores = job_posting.total_accepted + job_posting.total_rejected
                if total_with_scores > 0:
                    current_total_score = job_posting.average_score * (total_with_scores - 1)
                    job_posting.average_score = (current_total_score + score) / total_with_scores
                
                job_posting.updated_at = datetime.now()
                await job_posting.save()
                
                logger.info(f" Updated job posting stats for {job_posting.title}")
            
        except Exception as e:
            logger.error(f" Failed to update job posting stats: {e}")
    
    async def record_system_metrics(
        self,
        evaluations_count: int = 0,
        quizzes_generated: int = 0,
        quizzes_completed: int = 0,
        files_processed: int = 0,
        pdf_files: int = 0,
        docx_files: int = 0,
        processing_errors: int = 0,
        api_calls: int = 0,
        api_errors: int = 0,
        avg_evaluation_time_ms: float = 0.0,
        avg_quiz_generation_time_ms: float = 0.0
    ):
        """
        Record system metrics for today
        
        Args:
            evaluations_count: Number of evaluations processed
            quizzes_generated: Number of quizzes generated
            quizzes_completed: Number of quizzes completed
            files_processed: Number of files processed
            pdf_files: Number of PDF files
            docx_files: Number of DOCX files
            processing_errors: Number of processing errors
            api_calls: Number of API calls
            api_errors: Number of API errors
            avg_evaluation_time_ms: Average evaluation time
            avg_quiz_generation_time_ms: Average quiz generation time
        """
        try:
            today = date.today().strftime("%Y-%m-%d")
            
            # Find or create today's metrics
            metrics = await SystemMetrics.find_one(SystemMetrics.date == today)
            
            if not metrics:
                metrics = SystemMetrics(date=today)
            
            # Update metrics
            metrics.evaluations_count += evaluations_count
            metrics.quizzes_generated += quizzes_generated
            metrics.quizzes_completed += quizzes_completed
            metrics.files_processed += files_processed
            metrics.pdf_files += pdf_files
            metrics.docx_files += docx_files
            metrics.processing_errors += processing_errors
            metrics.api_calls += api_calls
            metrics.api_errors += api_errors
            
            # Update averages (weighted by count)
            if avg_evaluation_time_ms > 0:
                total_evals = metrics.evaluations_count
                if total_evals > 1:
                    metrics.avg_evaluation_time_ms = (
                        (metrics.avg_evaluation_time_ms * (total_evals - 1)) + avg_evaluation_time_ms
                    ) / total_evals
                else:
                    metrics.avg_evaluation_time_ms = avg_evaluation_time_ms
            
            if avg_quiz_generation_time_ms > 0:
                total_quizzes = metrics.quizzes_generated
                if total_quizzes > 1:
                    metrics.avg_quiz_generation_time_ms = (
                        (metrics.avg_quiz_generation_time_ms * (total_quizzes - 1)) + avg_quiz_generation_time_ms
                    ) / total_quizzes
                else:
                    metrics.avg_quiz_generation_time_ms = avg_quiz_generation_time_ms
            
            # Calculate rates
            if metrics.evaluations_count > 0:
                metrics.acceptance_rate = (await CVEvaluation.find(
                    CVEvaluation.decision == EvaluationDecision.ACCEPTED,
                    CVEvaluation.created_at >= datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
                ).count()) / metrics.evaluations_count * 100
            
            if metrics.quizzes_completed > 0:
                metrics.quiz_pass_rate = (await QuizResult.find(
                    QuizResult.status == "PASSED",
                    QuizResult.submitted_at >= datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
                ).count()) / metrics.quizzes_completed * 100
            
            metrics.updated_at = datetime.now()
            await metrics.save()
            
            logger.info(f" Updated system metrics for {today}")
            
        except Exception as e:
            logger.error(f" Failed to record system metrics: {e}")
    
    async def cleanup_old_data(self, days_to_keep: int = 90):
        """
        Cleanup old data from database
        
        Args:
            days_to_keep: Number of days to keep data
        """
        try:
            cutoff_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            cutoff_date = cutoff_date.replace(day=cutoff_date.day - days_to_keep)
            
            # Clean up old evaluations
            old_evaluations = await CVEvaluation.find(
                CVEvaluation.created_at < cutoff_date
            ).delete()
            
            # Clean up old quiz sessions
            old_quiz_sessions = await QuizSession.find(
                QuizSession.created_at < cutoff_date
            ).delete()
            
            # Clean up old email notifications
            old_emails = await EmailNotification.find(
                EmailNotification.created_at < cutoff_date
            ).delete()
            
            # Clean up old metrics (keep longer)
            metrics_cutoff = cutoff_date.replace(day=cutoff_date.day - 365)  # Keep 1 year
            old_metrics = await SystemMetrics.find(
                SystemMetrics.created_at < metrics_cutoff
            ).delete()
            
            logger.info(f"🧹 Cleaned up old data: {old_evaluations.deleted_count} evaluations, "
                       f"{old_quiz_sessions.deleted_count} quiz sessions, "
                       f"{old_emails.deleted_count} emails, "
                       f"{old_metrics.deleted_count} metrics")
            
        except Exception as e:
            logger.error(f" Failed to cleanup old data: {e}")
    
    # New methods for job posting and application workflow
    
    async def create_job_posting(
        self,
        title: str,
        description: str,
        required_skills: List[str],
        additional_details: Optional[str] = None,
        hr_email: Optional[str] = None,
        hr_name: Optional[str] = None,
        evaluation_threshold: int = 70,
        quiz_required: bool = True,
        quiz_pass_threshold: int = 7
    ) -> JobPosting:
        """
        Create a new job posting with a unique job ID
        
        Args:
            title: Job title
            description: Job description
            required_skills: List of required skills
            additional_details: Additional job details
            hr_email: HR contact email
            hr_name: HR contact name
            evaluation_threshold: Minimum CV score for acceptance
            quiz_required: Whether quiz is required
            quiz_pass_threshold: Minimum quiz score to pass
            
        Returns:
            JobPosting: Created job posting with unique ID
        """
        try:
            import uuid
            
            # Generate unique job ID
            job_id = str(uuid.uuid4())[:8]  # Short unique ID
            description_hash = self._generate_hash(description)
            
            job_posting = JobPosting(
                job_id=job_id,
                title=title,
                description=description,
                description_hash=description_hash,
                required_skills=required_skills,
                additional_details=additional_details,
                hr_email=hr_email,
                hr_name=hr_name,
                evaluation_threshold=evaluation_threshold,
                quiz_required=quiz_required,
                quiz_pass_threshold=quiz_pass_threshold
            )
            
            await job_posting.save()
            logger.info(f" Created job posting: {title} with ID: {job_id}")
            return job_posting
            
        except Exception as e:
            logger.error(f" Failed to create job posting: {e}")
            raise
    
    async def get_job_posting_by_id(self, job_id: str) -> Optional[JobPosting]:
        """
        Get job posting by job ID
        
        Args:
            job_id: Job posting ID
            
        Returns:
            JobPosting: Job posting if found, None otherwise
        """
        try:
            job_posting = await JobPosting.find_one(JobPosting.job_id == job_id)
            return job_posting
        except Exception as e:
            logger.error(f" Failed to get job posting: {e}")
            return None
    
    async def get_all_job_postings(self, include_inactive: bool = False) -> List[JobPosting]:
        """
        Get all job postings
        
        Args:
            include_inactive: Whether to include inactive job postings
            
        Returns:
            List[JobPosting]: List of all job postings
        """
        try:
            if include_inactive:
                # Get all job postings regardless of status
                job_postings = await JobPosting.find_all().to_list()
            else:
                # Get only active job postings
                job_postings = await JobPosting.find(JobPosting.is_active == True).to_list()
            
            logger.info(f" Retrieved {len(job_postings)} job postings")
            return job_postings
        except Exception as e:
            logger.error(f" Failed to get all job postings: {e}")
            return []
    
    async def create_application(
        self,
        job_id: str,
        cv_filename: str,
        candidate_email: Optional[str] = None,
        candidate_name: Optional[str] = None
    ) -> Application:
        """
        Create a new job application
        
        Args:
            job_id: Associated job posting ID
            cv_filename: CV filename
            candidate_email: Candidate email
            candidate_name: Candidate name
            
        Returns:
            Application: Created application
        """
        try:
            import uuid
            
            application_id = str(uuid.uuid4())
            
            application = Application(
                application_id=application_id,
                job_id=job_id,
                cv_filename=cv_filename,
                candidate_email=candidate_email,
                candidate_name=candidate_name
            )
            
            await application.save()
            
            # Update job posting statistics
            job_posting = await self.get_job_posting_by_id(job_id)
            if job_posting:
                job_posting.total_applications += 1
                job_posting.updated_at = datetime.now()
                await job_posting.save()
            
            logger.info(f" Created application: {application_id} for job: {job_id}")
            return application
            
        except Exception as e:
            logger.error(f" Failed to create application: {e}")
            raise
    
    async def update_application_status(
        self,
        application_id: str,
        status: str,
        cv_score: Optional[int] = None,
        decision: Optional[str] = None,
        quiz_score: Optional[int] = None
    ) -> Optional[Application]:
        """
        Update application status and evaluation results
        
        Args:
            application_id: Application ID
            status: New status
            cv_score: CV evaluation score
            decision: Evaluation decision (ACCEPTED/REJECTED)
            quiz_score: Quiz score
            
        Returns:
            Application: Updated application if found
        """
        try:
            application = await Application.find_one(Application.application_id == application_id)
            if not application:
                logger.warning(f"Application not found: {application_id}")
                return None
            
            # Update fields
            application.status = status
            
            if cv_score is not None:
                application.cv_score = cv_score
            
            if decision:
                application.decision = decision
            
            if quiz_score is not None:
                application.quiz_score = quiz_score
            
            await application.save()
            
            # Update job posting statistics
            job_posting = await self.get_job_posting_by_id(application.job_id)
            if job_posting and decision:
                if decision == "ACCEPTED":
                    job_posting.total_accepted += 1
                elif decision == "REJECTED":
                    job_posting.total_rejected += 1
                
                # Update average score
                if cv_score is not None:
                    total_with_scores = job_posting.total_accepted + job_posting.total_rejected
                    if total_with_scores > 0:
                        current_total = job_posting.average_score * (total_with_scores - 1)
                        job_posting.average_score = (current_total + cv_score) / total_with_scores
                
                job_posting.updated_at = datetime.now()
                await job_posting.save()
            
            logger.info(f" Updated application status: {application_id} -> {status}")
            return application
            
        except Exception as e:
            logger.error(f" Failed to update application status: {e}")
            return None
    
    async def update_application_cv_filename(
        self,
        application_id: str,
        cv_filename: str
    ) -> bool:
        """
        Update application CV filename
        
        Args:
            application_id: Application ID
            cv_filename: New CV filename
            
        Returns:
            bool: True if updated successfully, False otherwise
        """
        try:
            application = await Application.find_one(Application.application_id == application_id)
            if not application:
                logger.warning(f"Application not found: {application_id}")
                return False
            
            # Update CV filename
            application.cv_filename = cv_filename
            await application.save()
            
            logger.info(f" Updated application CV filename: {application_id} -> {cv_filename}")
            return True
            
        except Exception as e:
            logger.error(f" Failed to update application CV filename: {e}")
            return False
    
    async def get_applications_for_job(self, job_id: str) -> List[Application]:
        """
        Get all applications for a specific job
        
        Args:
            job_id: Job posting ID
            
        Returns:
            List[Application]: List of applications
        """
        try:
            applications = await Application.find(
                Application.job_id == job_id
            ).sort(-Application.submitted_at).to_list()
            
            logger.info(f" Retrieved {len(applications)} applications for job {job_id}")
            return applications
            
        except Exception as e:
            logger.error(f" Error retrieving applications for job {job_id}: {e}")
            return []
    
    async def get_all_applications(self) -> List[Application]:
        """
        Get all applications across all jobs
        
        Returns:
            List[Application]: List of all applications
        """
        try:
            # Use pymongo directly to get applications and map to our simplified model
            import pymongo
            client = pymongo.MongoClient(self.mongodb_url)
            db = client[self.database_name]
            collection = db['applications']
            
            # Get all documents from the collection
            documents = list(collection.find({}))
            
            applications = []
            for doc in documents:
                # Create Application object with only the fields we need
                app = Application(
                    application_id=doc.get('application_id'),
                    job_id=doc.get('job_id'),
                    candidate_email=doc.get('candidate_email'),
                    candidate_name=doc.get('candidate_name'),
                    cv_filename=doc.get('cv_filename'),
                    cv_score=doc.get('cv_score'),
                    decision=doc.get('decision'),
                    quiz_score=doc.get('quiz_score'),
                    status=doc.get('status')
                )
                applications.append(app)
            
            client.close()
            
            logger.info(f" Retrieved {len(applications)} total applications")
            return applications
            
        except Exception as e:
            logger.error(f" Error retrieving all applications: {e}")
            return []
    
    # Alias methods for test compatibility
    async def get_job_by_id(self, job_id: str) -> Optional[Dict[str, Any]]:
        """
        Get job by ID (alias for get_job_posting_by_id for test compatibility)
        
        Args:
            job_id: Job ID
            
        Returns:
            Optional[Dict]: Job data as dict or None if not found
        """
        job_posting = await self.get_job_posting_by_id(job_id)
        if job_posting:
            return {
                "id": str(job_posting.id),
                "title": job_posting.title,
                "description": job_posting.description,
                "requirements": job_posting.required_skills,
                "status": job_posting.status
            }
        return None
    
    async def save_application(self, application_data: Dict[str, Any]) -> str:
        """
        Save application (alias for create_application for test compatibility)
        
        Args:
            application_data: Application data dict
            
        Returns:
            str: Application ID
        """
        job_id = application_data.get("job_id")
        applicant_data = application_data.get("applicant_data", {})
        cv_file_path = application_data.get("cv_file_path")
        
        application = await self.create_application(
            job_id=job_id,
            cv_filename=cv_file_path,
            cv_text_length=len(application_data.get("cv_text", "")),
            candidate_email=applicant_data.get("email"),
            candidate_name=applicant_data.get("name")
        )
        
        return str(application.id)
    
    async def save_evaluation(self, evaluation_data: Dict[str, Any]) -> str:
        """
        Save evaluation (alias for save_cv_evaluation for test compatibility)
        
        Args:
            evaluation_data: Evaluation data dict
            
        Returns:
            str: Evaluation ID
        """
        evaluation = await self.save_cv_evaluation(
            filename=evaluation_data.get("filename", ""),
            job_description=evaluation_data.get("job_description", ""),
            decision=evaluation_data.get("decision", EvaluationDecision.UNKNOWN),
            score=evaluation_data.get("score", 0),
            evaluation_text=evaluation_data.get("evaluation_text", ""),
            cv_text_length=evaluation_data.get("cv_text_length", 0),
            email=evaluation_data.get("email")
        )
        
        return str(evaluation.id)
    
    async def get_application_by_id(self, application_id: str) -> Optional["Application"]:
        """
        Get application by application ID
        
        Args:
            application_id: Application ID
            
        Returns:
            Optional[Application]: Application if found, None otherwise
        """
        try:
            application = await Application.find_one(Application.application_id == application_id)
            return application
        except Exception as e:
            logger.error(f" Failed to get application by ID {application_id}: {e}")
            return None
    
    async def check_duplicate_email_application(self, email: str, job_id: str) -> Optional["Application"]:
        """
        Check if an email has already applied for a specific job
        
        Args:
            email: Candidate email address
            job_id: Job posting ID
            
        Returns:
            Optional[Application]: Existing application if found, None otherwise
        """
        try:
            existing_application = await Application.find_one(
                Application.candidate_email == email,
                Application.job_id == job_id
            )
            return existing_application
        except Exception as e:
            logger.error(f" Failed to check duplicate email application for {email} and job {job_id}: {e}")
            return None
    
    async def get_application_by_email_and_job(self, email: str, job_id: str) -> Optional["Application"]:
        """
        Get application by email and job ID
        
        Args:
            email: Candidate email address
            job_id: Job posting ID
            
        Returns:
            Optional[Application]: Application if found, None otherwise
        """
        try:
            application = await Application.find_one(
                Application.candidate_email == email,
                Application.job_id == job_id
            )
            return application
        except Exception as e:
            logger.error(f" Failed to get application by email {email} and job {job_id}: {e}")
            return None
    
    async def get_application_email_by_session_id(self, quiz_session_id: str) -> Optional[str]:
        """
        Get the original application email from quiz session ID
        
        Args:
            quiz_session_id: Quiz session ID
            
        Returns:
            Optional[str]: Original application email if found, None otherwise
        """
        try:
            quiz_session = await self.get_quiz_session_by_id(quiz_session_id)
            if not quiz_session:
                return None
            
            return quiz_session.candidate_email
        except Exception as e:
            logger.error(f" Failed to get application email for quiz session {quiz_session_id}: {e}")
            return None
    
    async def get_quiz_session_for_application(self, application_id: str) -> Optional[QuizSession]:
        """
        Get quiz session for a specific application
        
        Args:
            application_id: Application ID
            
        Returns:
            Optional[QuizSession]: Quiz session if found, None otherwise
        """
        try:
            # Look for quiz session with associated CV filename matching the application
            quiz_session = await QuizSession.find_one(
                QuizSession.associated_cv_filename == f"application_{application_id}",
                sort=[("created_at", -1)]  # Most recent first
            )
            return quiz_session
        except Exception as e:
            logger.error(f" Failed to get quiz session for application {application_id}: {e}")
            return None
    
    async def get_quiz_result_by_session_id(self, quiz_session_id: str) -> Optional[QuizResult]:
        """
        Get quiz result by quiz session ID
        
        Args:
            quiz_session_id: Quiz session ID
            
        Returns:
            Optional[QuizResult]: Quiz result if found, None otherwise
        """
        try:
            quiz_result = await QuizResult.find_one(
                QuizResult.quiz_session_id == quiz_session_id
            )
            return quiz_result
        except Exception as e:
            logger.error(f" Failed to get quiz result for session {quiz_session_id}: {e}")
            return None
    
    async def update_quiz_session_status(
        self,
        quiz_session_id: str,
        status: str,
        completed_at: Optional[datetime] = None
    ) -> Optional[QuizSession]:
        """
        Update quiz session status
        
        Args:
            quiz_session_id: Quiz session ID
            status: New status
            completed_at: Completion timestamp (if completed)
            
        Returns:
            Optional[QuizSession]: Updated quiz session if found
        """
        try:
            quiz_session = await self.get_quiz_session_by_id(quiz_session_id)
            if not quiz_session:
                return None
            
            quiz_session.status = status
            if completed_at:
                quiz_session.completed_at = completed_at
            
            await quiz_session.save()
            logger.info(f" Updated quiz session {quiz_session_id} status to {status}")
            return quiz_session
            
        except Exception as e:
            logger.error(f" Failed to update quiz session status: {e}")
            return None
    
    async def create_interview_record(
        self,
        candidate_email: str,
        quiz_score: int,
        total_questions: int,
        scheduled_date: datetime,
        status: str = "SCHEDULED"
    ):
        """
        Create an interview record for a candidate who passed the quiz
        
        Args:
            candidate_email: Candidate email address
            quiz_score: Quiz score achieved
            total_questions: Total number of quiz questions
            scheduled_date: Scheduled interview date and time
            status: Interview status (SCHEDULED, COMPLETED, CANCELLED)
            
        Returns:
            EmailNotification: Created interview record (stored as special notification)
        """
        try:
            # For now, we'll store this as a special type of email notification
            # In a full system, you'd have a dedicated InterviewRecord model
            interview_record = EmailNotification(
                recipient_email=candidate_email,
                notification_type="INTERVIEW_SCHEDULED",
                subject=f"Interview Scheduled - Quiz Score: {quiz_score}/{total_questions}",
                body=f"Interview scheduled for {scheduled_date.strftime('%Y-%m-%d %H:%M')}. Status: {status}",
                created_at=datetime.now(),
                sent_at=None,
                status="PENDING"
            )
            
            await interview_record.save()
            logger.info(f" Created interview record for {candidate_email} on {scheduled_date}")
            return interview_record
            
        except Exception as e:
            logger.error(f" Failed to create interview record: {e}")
            raise

    async def get_all_quiz_users_info(self) -> List[Dict[str, Any]]:
        """
        Get comprehensive quiz information for all users
        
        Returns:
            List[Dict[str, Any]]: List of quiz user information with links and details
        """
        try:
            quiz_users_info = []
            
            # Get all quiz sessions
            quiz_sessions = await QuizSession.find_all().to_list()
            
            for quiz_session in quiz_sessions:
                # Get corresponding quiz result if it exists
                quiz_result = None
                if quiz_session.candidate_email:
                    quiz_result = await QuizResult.find_one(
                        QuizResult.quiz_session_id == str(quiz_session.id)
                    )
                
                # Find associated job posting by matching job description hash
                job_posting = None
                job_title = None
                job_id = None
                try:
                    job_posting = await JobPosting.find_one(
                        JobPosting.description_hash == quiz_session.job_description_hash
                    )
                    if job_posting:
                        job_title = job_posting.title
                        job_id = job_posting.job_id
                except:
                    pass
                
                # Generate quiz link (similar to how it's generated in evaluation service)
                quiz_link = None
                if quiz_session.candidate_email:
                    from src.config.settings import get_settings
                    settings = get_settings()
                    base_url = settings.FRONTEND_URL or "http://localhost:8000"
                    quiz_link = f"{base_url}/api/quiz/{str(quiz_session.id)}"
                
                # Extract application_id from associated_cv_filename
                application_id = None
                if quiz_session.associated_cv_filename and quiz_session.associated_cv_filename.startswith("application_"):
                    application_id = quiz_session.associated_cv_filename.replace("application_", "")
                
                # Prepare quiz user info
                quiz_info = {
                    "application_id": application_id,
                    "quiz_session_id": str(quiz_session.id),
                    "candidate_email": quiz_session.candidate_email,
                    "quiz_link": quiz_link,
                    "job_title": job_title,
                    "job_id": job_id,
                    "quiz_status": quiz_session.status,
                    "created_at": quiz_session.created_at,
                    "started_at": quiz_session.started_at,
                    "completed_at": quiz_session.completed_at,
                    "score": quiz_result.score if quiz_result else None,
                    "total_questions": quiz_session.total_questions,
                    "percentage": quiz_result.percentage if quiz_result else None,
                    "passed": (quiz_result.status == "PASSED") if quiz_result else None
                }
                
                quiz_users_info.append(quiz_info)
            
            # Sort by creation date (most recent first)
            quiz_users_info.sort(key=lambda x: x["created_at"], reverse=True)
            
            return quiz_users_info
            
        except Exception as e:
            logger.error(f" Failed to get all quiz users info: {e}")
            return []

    async def get_quiz_for_display(self, quiz_session_id: str) -> Optional[Dict[str, Any]]:
        """
        Get quiz session data for frontend display
        
        Args:
            quiz_session_id: Quiz session ID
            
        Returns:
            Optional[Dict[str, Any]]: Quiz data for frontend display
        """
        try:
            # Get quiz session by ID
            quiz_session = await self.get_quiz_session_by_id(quiz_session_id)
            if not quiz_session:
                return None
            
            # Check if quiz is accessible (not expired, etc.)
            if quiz_session.status == "EXPIRED":
                return None
            
            # Find associated job posting by matching job description hash
            job_posting = None
            job_title = None
            try:
                job_posting = await JobPosting.find_one(
                    JobPosting.description_hash == quiz_session.job_description_hash
                )
                if job_posting:
                    job_title = job_posting.title
            except:
                pass
            
            # Update quiz status to IN_PROGRESS if it was GENERATED and being accessed
            if quiz_session.status == "GENERATED":
                quiz_session.status = "IN_PROGRESS"
                quiz_session.started_at = datetime.now()
                await quiz_session.save()
            
            # Extract application_id from associated_cv_filename
            application_id = None
            if quiz_session.associated_cv_filename and quiz_session.associated_cv_filename.startswith("application_"):
                application_id = quiz_session.associated_cv_filename.replace("application_", "")
            
            # Prepare quiz display data
            quiz_display_data = {
                "quiz_session_id": str(quiz_session.id),
                "application_id": application_id,
                "questions": quiz_session.questions,
                "total_questions": quiz_session.total_questions,
                "time_limit_seconds": quiz_session.time_limit_seconds,
                "pass_threshold": quiz_session.pass_threshold,
                "job_title": job_title,
                "job_description": quiz_session.job_description,
                "candidate_email": quiz_session.candidate_email,
                "status": quiz_session.status,
                "created_at": quiz_session.created_at,
                "started_at": quiz_session.started_at
            }
            
            return quiz_display_data
            
        except Exception as e:
            logger.error(f" Failed to get quiz for display {quiz_session_id}: {e}")
            return None
    
    async def delete_job_posting(self, job_id: str) -> bool:
        """
        Delete a job posting and all its associated applications
        
        Args:
            job_id: Job posting ID to delete
            
        Returns:
            bool: True if deleted successfully, False otherwise
        """
        try:
            # First, delete all applications associated with this job
            applications_deleted = await Application.find(
                Application.job_id == job_id
            ).delete()
            
            logger.info(f" Deleted {applications_deleted} applications for job {job_id}")
            
            # Then delete the job posting
            job_deleted = await JobPosting.find_one(JobPosting.job_id == job_id)
            if job_deleted:
                await job_deleted.delete()
                logger.info(f" Successfully deleted job posting: {job_id}")
                return True
            else:
                logger.warning(f" Job posting not found: {job_id}")
                return False
                
        except Exception as e:
            logger.error(f" Failed to delete job posting {job_id}: {e}")
            return False
    
    async def delete_application(self, application_id: str) -> bool:
        """
        Delete a specific application
        
        Args:
            application_id: Application ID to delete
            
        Returns:
            bool: True if deleted successfully, False otherwise
        """
        try:
            application = await Application.find_one(Application.application_id == application_id)
            if application:
                await application.delete()
                logger.info(f" Successfully deleted application: {application_id}")
                return True
            else:
                logger.warning(f" Application not found: {application_id}")
                return False
                
        except Exception as e:
            logger.error(f" Failed to delete application {application_id}: {e}")
            return False