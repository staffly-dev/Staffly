"""
API Request and Response Models for ATS System
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, constr
from datetime import datetime

from src.models.evaluation_models import EvaluationDecision

# Email pattern validation
EmailStr = constr(pattern=r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")

class JobPostingRequest(BaseModel):
    """Request model for creating a job posting"""
    title: str = Field(..., description="Job title", example="Senior Python Developer")
    description: str = Field(..., description="Job description", example="We are looking for an experienced Python developer...")
    required_skills: str = Field(..., description="Required skills (comma-separated)", example="Python, FastAPI, MongoDB")
    additional_details: Optional[str] = Field(None, description="Additional job details", example="Remote work available")
    hr_email: Optional[str] = Field(None, description="HR contact email", example="hr@company.com", pattern=r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
    hr_name: Optional[str] = Field(None, description="HR contact name", example="John Smith")
    evaluation_threshold: int = Field(70, description="Minimum CV score for acceptance (0-100)", ge=0, le=100)
    quiz_required: bool = Field(True, description="Whether quiz is required")
    quiz_pass_threshold: int = Field(7, description="Minimum quiz score to pass (0-10)", ge=0, le=10)

class JobPostingResponse(BaseModel):
    """Response model for job posting operations"""
    job_id: str = Field(..., description="Unique job identifier")
    title: str = Field(..., description="Job title")
    description: str = Field(..., description="Job description")
    required_skills: List[str] = Field(..., description="Required skills")
    shareable_link: str = Field(..., description="Link for job application")
    created_at: datetime = Field(..., description="Creation timestamp")
    is_active: bool = Field(..., description="Whether job posting is active")

class ApplicationRequest(BaseModel):
    """Request model for submitting a job application"""
    candidate_email: str = Field(..., description="Candidate email address", pattern=r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
    candidate_name: Optional[str] = Field(None, description="Candidate full name (optional, will be extracted from CV if not provided)")
    cv_file: bytes = Field(..., description="CV file (PDF or DOCX)")

class ApplicationResponse(BaseModel):
    """Response model for application submission"""
    application_id: str = Field(..., description="Unique application identifier")
    job_id: str = Field(..., description="Associated job ID")
    status: str = Field(..., description="Application status")
    evaluation_decision: Optional[EvaluationDecision] = Field(None, description="CV evaluation decision")
    evaluation_score: Optional[int] = Field(None, description="CV evaluation score")
    quiz_required: Optional[bool] = Field(None, description="Whether quiz is required")
    quiz_link: Optional[str] = Field(None, description="Quiz link if required")

class QuizSubmissionRequest(BaseModel):
    """Request model for quiz submission"""
    answers: Dict[str, Any] = Field(..., description="Quiz answers")
    time_taken_seconds: Optional[int] = Field(None, description="Time taken to complete quiz")

class QuizSubmissionResponse(BaseModel):
    """Response model for quiz submission"""
    quiz_id: str = Field(..., description="Quiz session ID")
    score: int = Field(..., description="Quiz score")
    total_questions: int = Field(..., description="Total number of questions")
    percentage: float = Field(..., description="Score percentage")
    passed: bool = Field(..., description="Whether quiz was passed")
    feedback: Optional[str] = Field(None, description="Quiz feedback")

class QuizUserInfoResponse(BaseModel):
    """Response model for quiz user information"""
    application_id: Optional[str] = Field(None, description="Associated application ID")
    quiz_session_id: str = Field(..., description="Quiz session ID")
    candidate_email: Optional[str] = Field(None, description="Candidate email address")
    quiz_link: Optional[str] = Field(None, description="Quiz link sent to email")
    job_title: Optional[str] = Field(None, description="Associated job title")
    job_id: Optional[str] = Field(None, description="Associated job ID")
    quiz_status: str = Field(..., description="Quiz session status")
    created_at: datetime = Field(..., description="Quiz creation timestamp")
    started_at: Optional[datetime] = Field(None, description="Quiz start timestamp")
    completed_at: Optional[datetime] = Field(None, description="Quiz completion timestamp")
    score: Optional[int] = Field(None, description="Quiz score if completed")
    total_questions: Optional[int] = Field(None, description="Total number of questions")
    percentage: Optional[float] = Field(None, description="Score percentage if completed")
    passed: Optional[bool] = Field(None, description="Whether quiz was passed")

class AllQuizUsersResponse(BaseModel):
    """Response model for all quiz users endpoint"""
    total_quizzes: int = Field(..., description="Total number of quiz sessions")
    quiz_users: List[QuizUserInfoResponse] = Field(..., description="List of quiz user information")

class QuizDisplayResponse(BaseModel):
    """Response model for displaying quiz to frontend"""
    quiz_session_id: str = Field(..., description="Quiz session ID")
    application_id: Optional[str] = Field(None, description="Associated application ID")
    questions: List[Dict[str, Any]] = Field(..., description="Quiz questions with options")
    total_questions: int = Field(..., description="Total number of questions")
    time_limit_seconds: int = Field(..., description="Time limit in seconds")
    pass_threshold: int = Field(..., description="Minimum score to pass")
    job_title: Optional[str] = Field(None, description="Associated job title")
    job_description: Optional[str] = Field(None, description="Job description")
    candidate_email: Optional[str] = Field(None, description="Candidate email")
    status: str = Field(..., description="Quiz session status")
    created_at: datetime = Field(..., description="Quiz creation timestamp")
    started_at: Optional[datetime] = Field(None, description="Quiz start timestamp")

class StatisticsResponse(BaseModel):
    """Response model for statistics endpoints"""
    total_applications: int = Field(..., description="Total applications received")
    total_evaluations: int = Field(..., description="Total CVs evaluated")
    acceptance_rate: float = Field(..., description="CV acceptance rate")
    average_score: float = Field(..., description="Average CV score")
    quiz_pass_rate: Optional[float] = Field(None, description="Quiz pass rate")
    daily_stats: Dict[str, Any] = Field(..., description="Daily statistics")

class ApplicationListResponse(BaseModel):
    """Response model for individual application in the applications list - HR Review Format"""
    application_id: str = Field(..., description="Unique application identifier", example="96b51684-67df-4fec-877e-918969f92729")
    candidate_email: Optional[str] = Field(None, description="Candidate email address", example="john.smith@email.com")
    candidate_name: Optional[str] = Field(None, description="Candidate name", example="John Smith")
    cv_score: Optional[int] = Field(None, description="CV evaluation score (0-100)", example=85)
    cv_filename: str = Field(..., description="CV filename", example="john_smith_resume.pdf")
    decision: Optional[str] = Field(None, description="CV evaluation decision", example="ACCEPTED")
    job_id: str = Field(..., description="Associated job ID", example="8e25e637")
    quiz_score: Optional[int] = Field(None, description="Quiz score (0-10)", example=8)
    status: str = Field(..., description="Application status", example="INTERVIEW_SCHEDULED")

class ApplicationsListResponse(BaseModel):
    """Response model for the applications endpoint"""
    total_applications: int = Field(..., description="Total number of applications", example=150)
    applications: List[ApplicationListResponse] = Field(..., description="List of applications") 

class SingleApplicationResponse(BaseModel):
    """Response model for single application endpoint - matches exact user requirements"""
    application_id: str = Field(..., description="Unique application identifier", example="415c79ce-a154-4fa4-becb-f2cd6caf5383")
    candidate_email: str = Field(..., description="Candidate email address", example="mohamedaboelyazeed920@gmail.com")
    candidate_name: str = Field(..., description="Candidate name", example="Mohamed Aboelyazeed")
    cv_score: int = Field(..., description="CV evaluation score (0-100)", example=55)
    cv_filename: str = Field(..., description="CV file URL", example="https://stafflyhr.tech/uploads/cv_20250812_180436_ba61fca9.pdf")
    decision: str = Field(..., description="CV evaluation decision", example="REJECTED")
    job_id: str = Field(..., description="Associated job ID", example="840b87f9")
    quiz_score: Optional[int] = Field(None, description="Quiz score (0-10)", example=8)
    status: str = Field(..., description="Application status", example="REJECTED") 