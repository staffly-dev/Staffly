"""
MongoDB Models for ATS System
Using Beanie ODM for async MongoDB operations
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from beanie import Document, Indexed
from pydantic import Field
from pymongo import IndexModel, ASCENDING, DESCENDING

from src.models.evaluation_models import EvaluationDecision


class CVEvaluation(Document):
    """MongoDB model for CV evaluation results"""
    
    # Basic information
    filename: Indexed(str) = Field(..., description="Original CV filename")
    job_description_hash: Indexed(str) = Field(..., description="Hash of job description for grouping")
    job_description: str = Field(..., description="Job description used for evaluation")
    
    # Evaluation results
    decision: EvaluationDecision = Field(..., description="Evaluation decision")
    score: int = Field(..., ge=0, le=100, description="Evaluation score out of 100")
    evaluation_text: str = Field(..., description="Full evaluation text from AI")
    
    # CV information
    cv_text_length: int = Field(..., description="Length of extracted CV text")
    email: Optional[str] = Field(None, description="Extracted email address")
    
    # Detailed scoring breakdown
    technical_skills_score: Optional[int] = Field(None, ge=0, le=25)
    experience_score: Optional[int] = Field(None, ge=0, le=25)
    education_score: Optional[int] = Field(None, ge=0, le=15)
    soft_skills_score: Optional[int] = Field(None, ge=0, le=15)
    career_growth_score: Optional[int] = Field(None, ge=0, le=10)
    achievements_score: Optional[int] = Field(None, ge=0, le=10)
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = Field(None)
    processing_time_ms: Optional[int] = Field(None, description="Processing time in milliseconds")
    
    class Settings:
        name = "cv_evaluations"
        indexes = [
            IndexModel([("filename", ASCENDING)]),
            IndexModel([("decision", ASCENDING)]),
            IndexModel([("score", DESCENDING)]),
            IndexModel([("created_at", DESCENDING)]),
            IndexModel([("job_description_hash", ASCENDING)]),
            IndexModel([("email", ASCENDING)]),
        ]


class QuizSession(Document):
    """MongoDB model for quiz sessions"""
    
    # Basic information
    job_description: str = Field(..., description="Job description used for quiz generation")
    job_description_hash: Indexed(str) = Field(..., description="Hash of job description")
    associated_cv_filename: Optional[str] = Field(None, description="Associated CV filename")
    candidate_email: Optional[str] = Field(None, description="Candidate email")
    
    # Quiz content
    questions: List[Dict[str, Any]] = Field(..., description="Quiz questions and options")
    total_questions: int = Field(..., description="Total number of questions")
    
    # Session settings
    time_limit_seconds: int = Field(default=300, description="Time limit in seconds")
    pass_threshold: int = Field(default=7, description="Minimum score to pass")
    
    # Session status
    status: str = Field(default="GENERATED", description="Session status")  # GENERATED, IN_PROGRESS, COMPLETED, EXPIRED
    started_at: Optional[datetime] = Field(None, description="When quiz was started")
    completed_at: Optional[datetime] = Field(None, description="When quiz was completed")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.now)
    
    class Settings:
        name = "quiz_sessions"
        indexes = [
            IndexModel([("job_description_hash", ASCENDING)]),
            IndexModel([("candidate_email", ASCENDING)]),
            IndexModel([("status", ASCENDING)]),
            IndexModel([("created_at", DESCENDING)]),
        ]


class QuizResult(Document):
    """MongoDB model for quiz results"""
    
    # References
    quiz_session_id: Indexed(str) = Field(..., description="Reference to quiz session")
    candidate_email: Optional[str] = Field(None, description="Candidate email")
    associated_cv_filename: Optional[str] = Field(None, description="Associated CV filename")
    
    # Results
    answers: List[int] = Field(..., description="Selected answer indices")
    score: int = Field(..., description="Number of correct answers")
    total_questions: int = Field(..., description="Total number of questions")
    percentage: float = Field(..., description="Percentage score")
    status: str = Field(..., description="PASSED or FAILED")
    
    # Timing
    time_taken_seconds: Optional[int] = Field(None, description="Time taken to complete quiz")
    submitted_at: datetime = Field(default_factory=datetime.now)
    
    # Analysis
    question_analysis: Optional[List[Dict[str, Any]]] = Field(None, description="Per-question analysis")
    
    class Settings:
        name = "quiz_results"
        indexes = [
            IndexModel([("quiz_session_id", ASCENDING)]),
            IndexModel([("candidate_email", ASCENDING)]),
            IndexModel([("status", ASCENDING)]),
            IndexModel([("score", DESCENDING)]),
            IndexModel([("submitted_at", DESCENDING)]),
        ]


class JobPosting(Document):
    """MongoDB model for job postings and their evaluation criteria"""
    
    # Job information
    title: Indexed(str) = Field(..., description="Job title")
    description: str = Field(..., description="Job description")
    required_skills: List[str] = Field(default_factory=list, description="Required skills")
    additional_details: Optional[str] = Field(None, description="Additional job details")
    
    # Unique identifiers
    job_id: Indexed(str) = Field(..., description="Unique job identifier for links")
    description_hash: Indexed(str) = Field(..., description="Hash of job description")
    
    # Application settings
    evaluation_threshold: int = Field(default=70, ge=0, le=100, description="Minimum score for acceptance")
    quiz_required: bool = Field(default=True, description="Whether quiz is required for accepted candidates")
    quiz_pass_threshold: int = Field(default=7, ge=0, le=10, description="Minimum quiz score to pass")
    
    # Evaluation criteria weights
    technical_skills_weight: int = Field(default=25, ge=0, le=100)
    experience_weight: int = Field(default=25, ge=0, le=100)
    education_weight: int = Field(default=15, ge=0, le=100)
    soft_skills_weight: int = Field(default=15, ge=0, le=100)
    career_growth_weight: int = Field(default=10, ge=0, le=100)
    achievements_weight: int = Field(default=10, ge=0, le=100)
    
    # HR Contact
    hr_email: Optional[str] = Field(None, description="HR contact email for this job")
    hr_name: Optional[str] = Field(None, description="HR contact name")
    
    # Statistics
    total_applications: int = Field(default=0, description="Total applications received")
    total_accepted: int = Field(default=0, description="Total applications accepted")
    total_rejected: int = Field(default=0, description="Total applications rejected")
    total_quiz_passed: int = Field(default=0, description="Total candidates who passed quiz")
    average_score: float = Field(default=0.0, description="Average evaluation score")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = Field(None)
    is_active: bool = Field(default=True, description="Whether job posting is active")
    
    class Settings:
        name = "job_postings"
        indexes = [
            IndexModel([("job_id", ASCENDING)], unique=True, sparse=True),
            IndexModel([("title", ASCENDING)]),
            IndexModel([("description_hash", ASCENDING)]),
            IndexModel([("is_active", ASCENDING)]),
            IndexModel([("created_at", DESCENDING)]),
        ]


class Application(Document):
    """MongoDB model for job applications"""
    
    # Application identifiers
    application_id: Indexed(str) = Field(..., description="Unique application identifier")
    job_id: Indexed(str) = Field(..., description="Associated job posting ID")
    
    # Candidate information
    candidate_email: Optional[str] = Field(None, description="Candidate email address")
    candidate_name: Optional[str] = Field(None, description="Candidate name (extracted from CV)")
    cv_filename: str = Field(..., description="Original CV filename")
    cv_text_length: int = Field(..., description="Length of extracted CV text")
    
    # Application status and workflow
    status: str = Field(default="SUBMITTED", description="Application status")
    # Status values: SUBMITTED, EVALUATING, ACCEPTED, REJECTED, QUIZ_SENT, QUIZ_COMPLETED, QUIZ_PASSED, QUIZ_FAILED, INTERVIEW_SCHEDULED
    
    # Evaluation results
    cv_score: Optional[int] = Field(None, ge=0, le=100, description="CV evaluation score")
    cv_evaluation_text: Optional[str] = Field(None, description="Detailed CV evaluation")
    decision: Optional[EvaluationDecision] = Field(None, description="CV evaluation decision")
    
    # Quiz information (if applicable)
    quiz_session_id: Optional[str] = Field(None, description="Associated quiz session ID")
    quiz_score: Optional[int] = Field(None, ge=0, le=10, description="Quiz score")
    quiz_passed: Optional[bool] = Field(None, description="Whether candidate passed quiz")
    
    # Email tracking
    emails_sent: List[str] = Field(default_factory=list, description="Types of emails sent to candidate")
    
    # Metadata
    submitted_at: datetime = Field(default_factory=datetime.now)
    evaluated_at: Optional[datetime] = Field(None)
    quiz_completed_at: Optional[datetime] = Field(None)
    updated_at: Optional[datetime] = Field(None)
    
    class Settings:
        name = "applications"
        indexes = [
            IndexModel([("application_id", ASCENDING)], unique=True, sparse=True),
            IndexModel([("job_id", ASCENDING)]),
            IndexModel([("candidate_email", ASCENDING)]),
            IndexModel([("status", ASCENDING)]),
            IndexModel([("submitted_at", DESCENDING)]),
            IndexModel([("cv_score", DESCENDING)]),
        ]


class SystemMetrics(Document):
    """MongoDB model for system metrics and statistics"""
    
    # Date tracking
    date: Indexed(str) = Field(..., description="Date in YYYY-MM-DD format")
    
    # Daily metrics
    evaluations_count: int = Field(default=0, description="Number of evaluations processed")
    quizzes_generated: int = Field(default=0, description="Number of quizzes generated")
    quizzes_completed: int = Field(default=0, description="Number of quizzes completed")
    
    # Performance metrics
    avg_evaluation_time_ms: float = Field(default=0.0, description="Average evaluation time")
    avg_quiz_generation_time_ms: float = Field(default=0.0, description="Average quiz generation time")
    
    # Success rates
    acceptance_rate: float = Field(default=0.0, description="CV acceptance rate")
    quiz_pass_rate: float = Field(default=0.0, description="Quiz pass rate")
    
    # File processing
    files_processed: int = Field(default=0, description="Number of files processed")
    pdf_files: int = Field(default=0, description="Number of PDF files processed")
    docx_files: int = Field(default=0, description="Number of DOCX files processed")
    processing_errors: int = Field(default=0, description="Number of processing errors")
    
    # API metrics
    api_calls: int = Field(default=0, description="Total API calls")
    api_errors: int = Field(default=0, description="API errors")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = Field(None)
    
    class Settings:
        name = "system_metrics"
        indexes = [
            IndexModel([("date", ASCENDING)], unique=True),
            IndexModel([("created_at", DESCENDING)]),
        ]


class EmailNotification(Document):
    """MongoDB model for email notification tracking"""
    
    # Recipient information
    recipient_email: Indexed(str) = Field(..., description="Recipient email address")
    notification_type: str = Field(..., description="Type of notification")  # CV_RESULT, QUIZ_RESULT, SYSTEM
    
    # Content
    subject: str = Field(..., description="Email subject")
    body: str = Field(..., description="Email body")
    
    # References
    cv_evaluation_id: Optional[str] = Field(None, description="Reference to CV evaluation")
    quiz_result_id: Optional[str] = Field(None, description="Reference to quiz result")
    
    # Status
    status: str = Field(default="PENDING", description="Email status")  # PENDING, SENT, FAILED
    sent_at: Optional[datetime] = Field(None, description="When email was sent")
    error_message: Optional[str] = Field(None, description="Error message if failed")
    retry_count: int = Field(default=0, description="Number of retry attempts")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.now)
    
    class Settings:
        name = "email_notifications"
        indexes = [
            IndexModel([("recipient_email", ASCENDING)]),
            IndexModel([("status", ASCENDING)]),
            IndexModel([("notification_type", ASCENDING)]),
            IndexModel([("created_at", DESCENDING)]),
        ] 