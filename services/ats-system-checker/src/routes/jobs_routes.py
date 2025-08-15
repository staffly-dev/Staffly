"""
Job Routes for ATS System
Job posting management endpoints
"""

from typing import Optional
from fastapi import APIRouter, Depends, Form, File, UploadFile, HTTPException, Query
from fastapi.responses import JSONResponse

from src.controllers import JobController
from src.utils.dependencies import get_job_controller
from src.models.api_models import JobPostingResponse

router = APIRouter(tags=["jobs"])


@router.get("/jobs", response_model=list[JobPostingResponse], summary="Get All Job Postings")
async def get_all_job_postings(
    include_inactive: bool = Query(False, description="Whether to include inactive job postings"),
    controller: JobController = Depends(get_job_controller)  # type: ignore
):
    """
    Get all job postings in the system.
    
    - **include_inactive**: Whether to include inactive job postings (default: False)
    
    Returns a list of all job postings with their details and shareable links.
    """
    return await controller.get_all_job_postings(include_inactive=include_inactive)


@router.post("/jobs", response_model=JobPostingResponse, summary="Create Job Posting")
async def create_job_posting(
    title: str = Form(..., description="Job title", example="Senior Python Developer"),
    description: str = Form(..., description="Job description", example="We are looking for an experienced Python developer..."),
    required_skills: str = Form(..., description="Required skills (comma-separated)", example="Python, FastAPI, MongoDB"),
    additional_details: Optional[str] = Form(None, description="Additional job details", example="Remote work available"),
    hr_email: Optional[str] = Form(None, description="HR contact email", example="hr@company.com"),
    hr_name: Optional[str] = Form(None, description="HR contact name", example="Mohamed Abolyazeed"),
    evaluation_threshold: int = Form(70, description="Minimum CV score for acceptance (0-100)", ge=0, le=100),
    quiz_required: bool = Form(True, description="Whether quiz is required"),
    quiz_pass_threshold: int = Form(7, description="Minimum quiz score to pass (0-10)", ge=0, le=10),
    controller: JobController = Depends(get_job_controller)  # type: ignore
):
    """
    Create a new job posting with evaluation criteria.
    
    - **title**: Job title (e.g., "Senior Python Developer")
    - **description**: Detailed job description
    - **required_skills**: Comma-separated list of required skills
    - **additional_details**: Optional additional information
    - **hr_email**: HR contact email
    - **hr_name**: HR contact name
    - **evaluation_threshold**: Minimum CV score (0-100)
    - **quiz_required**: Whether candidates need to take a quiz
    - **quiz_pass_threshold**: Minimum quiz score (0-10)
    
    Returns the created job posting with a shareable application link.
    """
    return await controller.create_job_posting(
        title=title,
        description=description,
        required_skills=required_skills,
        additional_details=additional_details,
        hr_email=hr_email,
        hr_name=hr_name,
        evaluation_threshold=evaluation_threshold,
        quiz_required=quiz_required,
        quiz_pass_threshold=quiz_pass_threshold
    )


@router.get("/jobs/{job_id}", response_model=JobPostingResponse, summary="Get Job Details")
async def get_job_posting(
    job_id: str,
    controller: JobController = Depends(get_job_controller)  # type: ignore
):
    """
    Get detailed information about a specific job posting.
    
    - **job_id**: Unique identifier of the job posting
    
    Returns the job posting details including requirements and application status.
    """
    return await controller.get_job_posting(job_id)


@router.post("/jobs/{job_id}/apply", summary="Submit Job Application")
async def submit_application(
    job_id: str,
    cv_file: UploadFile = File(..., description="CV file (PDF or DOCX)"),
    candidate_email: str = Form(..., description="Candidate email address (required)"),
    candidate_name: str = Form(..., description="Candidate full name (required)"),
    controller: JobController = Depends(get_job_controller)  # type: ignore
):
    """
    Submit a job application with CV.
    
    - **job_id**: ID of the job posting
    - **cv_file**: CV document in PDF or DOCX format (required)
    - **candidate_email**: Applicant's email address (required)
    - **candidate_name**: Applicant's full name (required)
    
    Returns application status and next steps (e.g., quiz link if required).
    This will trigger:
    1. CV text extraction
    2. AI-powered evaluation
    3. Email notification with results
    4. Quiz generation if accepted
    """
    if not cv_file.filename.lower().endswith(('.pdf', '.docx')):
        raise HTTPException(status_code=400, detail="CV must be in PDF or DOCX format")
    
    return await controller.submit_application(
        job_id=job_id,
        cv_file=cv_file,
        candidate_email=candidate_email,
        candidate_name=candidate_name
    )


@router.delete("/jobs/{job_id}", summary="Delete Job Posting")
async def delete_job_posting(
    job_id: str,
    controller: JobController = Depends(get_job_controller)  # type: ignore
):
    """
    Delete a job posting and all its associated applications.
    
    - **job_id**: Unique identifier of the job posting to delete
    
    This will permanently delete the job posting and all associated data.
    Use with caution as this action cannot be undone.
    """
    return await controller.delete_job_posting(job_id) 