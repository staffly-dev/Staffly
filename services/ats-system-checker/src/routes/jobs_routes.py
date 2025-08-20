"""
Job Routes for ATS System
Job posting management endpoints
"""

from typing import Optional
from fastapi import APIRouter, Depends, Form, File, UploadFile, HTTPException, Query, Header, status
from fastapi.responses import JSONResponse

from src.controllers import JobController
from src.utils.dependencies import get_job_controller
from src.models.api_models import JobPostingResponse, AuthenticatedRequest, JobPostingsListResponse
from src.utils.jwt_utils import jwt_utils
from src.utils.gateway_client import verify_user_exists_and_token_valid

router = APIRouter(tags=["jobs"])


@router.get("/jobs", response_model=JobPostingsListResponse, summary="Get All Job Postings")
async def get_all_job_postings(
    include_inactive: bool = Query(False, description="Whether to include inactive job postings"),
    x_user_id: Optional[str] = Header(default=None, alias="X-User-Id"),
    x_created_by: Optional[str] = Header(default=None, alias="X-Created-By"),
    authorization: Optional[str] = Header(default=None, alias="Authorization"),
    controller: JobController = Depends(get_job_controller)  # type: ignore
):
    """
    Get all job postings in the system (JWT protected).
    
    Authentication:
    - Authorization: Bearer <access_token>
    - X-User-Id: user id from API Gateway (optional; if omitted, taken from token)
    - X-Created-By: creator id (optional; must match user id if provided)
    
    - **include_inactive**: Whether to include inactive job postings (default: False)
    
    Returns a list of all job postings created by the authenticated user.
    """
    # Validate token presence and authenticity (do not derive user id from token)
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid Authorization header")
    access_token = authorization.split(" ", 1)[1]
    # Normalize and decode token to read userId
    access_token = access_token.strip().strip('"').strip("'")
    if access_token.lower().startswith("bearer "):
        access_token = access_token.split(" ", 1)[1].strip()
    token_info = jwt_utils.decode_token(access_token)

    # Require API Gateway provided user id
    if not x_user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="X-User-Id header is required")

    # Validate user_id format (24-hex ObjectId style)
    if len(x_user_id) != 24 or any(c not in '0123456789abcdef' for c in x_user_id.lower()):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user_id format")

    # Verify user exists in API Gateway database and token is valid
    await verify_user_exists_and_token_valid(x_user_id, access_token)

    # Optional created_by must match
    if x_created_by and x_created_by != x_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="created_by must match user_id")

    return await controller.get_all_job_postings(include_inactive=include_inactive, owner_user_id=x_user_id)


@router.post("/jobs", response_model=JobPostingResponse, summary="Create Job Posting")
async def create_job_posting(
    # Support both form data and JSON for backward compatibility
    title: str = Form(..., description="Job title", example="Senior Python Developer"),
    description: str = Form(..., description="Job description", example="We are looking for an experienced Python developer..."),
    required_skills: str = Form(..., description="Required skills (comma-separated)", example="Python, FastAPI, MongoDB"),
    additional_details: Optional[str] = Form(None, description="Additional job details", example="Remote work available"),
    hr_email: Optional[str] = Form(None, description="HR contact email", example="hr@company.com"),
    hr_name: Optional[str] = Form(None, description="HR contact name", example="John Smith"),
    evaluation_threshold: int = Form(70, description="Minimum CV score for acceptance (0-100)", ge=0, le=100),
    quiz_required: bool = Form(True, description="Whether quiz is required"),
    quiz_pass_threshold: int = Form(7, description="Minimum quiz score to pass (0-10)", ge=0, le=10),
    # JWT Authentication fields (optional; will default to token user)
    user_id: Optional[str] = Form(None, description="User ID from API Gateway (optional; will use token's userId if omitted)", example="68a140ef2549fe9b5ea0b961"),
    created_by: Optional[str] = Form(None, description="User who created the records (optional; should match user_id if provided)", example="68a140ef2549fe9b5ea0b961"),
    owner_username: Optional[str] = Form(None, description="Username of the creator (optional; linked to API Gateway userId)"),
    access_token: Optional[str] = Form(None, description="Access token from API Gateway (raw token, without 'Bearer ')", example="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."),
    authorization: Optional[str] = Header(default=None, alias="Authorization"),
    x_user_id: Optional[str] = Header(default=None, alias="X-User-Id"),
    controller: JobController = Depends(get_job_controller)  # type: ignore
):
    """
    Create a new job posting with evaluation criteria.
    
    This endpoint requires:
    - user_id: User ID from API Gateway
    - created_by: User who created the records
    - access_token: Valid access token from API Gateway
    
    Job posting details:
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
    try:
        # Get token from form-data (required)
        token_candidate = access_token
        if not token_candidate:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="access_token is required in form-data")

        # Normalize possible formatting issues from clients
        token_candidate = token_candidate.strip().strip('"').strip("'")
        if token_candidate.lower().startswith("bearer "):
            token_candidate = token_candidate.split(" ", 1)[1].strip()

        # Get effective user id from form-data (required)
        effective_user_id = user_id
        if not effective_user_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="user_id is required in form-data")

        # Validate user_id format
        if len(effective_user_id) != 24 or any(c not in '0123456789abcdef' for c in effective_user_id.lower()):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user_id format")

        # Verify user exists in API Gateway database and token is valid
        await verify_user_exists_and_token_valid(effective_user_id, token_candidate)
        
        # Create job posting using the authenticated user's ID
        return await controller.create_job_posting(
            title=title,
            description=description,
            required_skills=required_skills,
            additional_details=additional_details,
            hr_email=hr_email,
            hr_name=hr_name,
            owner_user_id=effective_user_id,
            owner_username=owner_username,
            evaluation_threshold=evaluation_threshold,
            quiz_required=quiz_required,
            quiz_pass_threshold=quiz_pass_threshold
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create job posting: {str(e)}"
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
    request: Optional[AuthenticatedRequest] = None,
    authorization: Optional[str] = Header(default=None, alias="Authorization"),
    x_user_id: Optional[str] = Header(default=None, alias="X-User-Id"),
    controller: JobController = Depends(get_job_controller)  # type: ignore
):
    """
    Delete a job posting and all its associated applications.
    
    Authentication required via API Gateway JWT in request body.
    
    - **job_id**: Unique identifier of the job posting to delete
    - **user_id / access_token**: Must be provided and must match
    
    This will permanently delete the job posting and all associated data.
    Use with caution as this action cannot be undone.
    """
    try:
        # Validate token presence and authenticity (do not derive user id from token)
        token_candidate = request.access_token if request else None
        if not token_candidate and authorization and authorization.lower().startswith("bearer "):
            token_candidate = authorization.split(" ", 1)[1]
        if not token_candidate:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing access token")

        # Normalize possible formatting issues (quotes/Bearer prefix)
        token_candidate = token_candidate.strip().strip('"').strip("'")
        if token_candidate.lower().startswith("bearer "):
            token_candidate = token_candidate.split(" ", 1)[1].strip()

        jwt_utils.decode_token(token_candidate)

        # Use API Gateway provided user id (from body or header)
        effective_user_id = (request.user_id if request else None) or x_user_id
        if not effective_user_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="user_id is required (body or X-User-Id header)")

        # Validate user_id format
        if len(effective_user_id) != 24 or any(c not in '0123456789abcdef' for c in effective_user_id.lower()):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user_id format")

        # Verify user exists in API Gateway database and token is valid
        await verify_user_exists_and_token_valid(effective_user_id, token_candidate)

        # Proceed with deletion using the provided user's ID
        return await controller.delete_job_posting(job_id, owner_user_id=effective_user_id)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete job posting: {str(e)}"
        )