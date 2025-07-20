"""
Applications Routes for ATS System
Application management endpoints
"""

from fastapi import APIRouter, Depends

from src.controllers import ApplicationController
from src.utils.dependencies import get_application_controller
from src.models.api_models import ApplicationsListResponse

router = APIRouter(tags=["applications"])


@router.get("/applications", response_model=ApplicationsListResponse, summary="Get All Applications")
async def get_all_applications(
    controller: ApplicationController = Depends(get_application_controller) # type: ignore
):
    """
    Get all job applications across all job postings.
    
    Returns a list of all applications with the following information:
    - **application_id**: Unique application identifier
    - **candidate_email**: Candidate's email address
    - **candidate_name**: Candidate's name (extracted from CV)
    - **cv_score**: CV evaluation score (0-100)
    - **cv_filename**: CV filename
    - **decision**: CV evaluation decision (ACCEPTED, REJECTED)
    - **job_id**: Associated job ID
    - **quiz_score**: Quiz score (0-10) if quiz was completed
    - **status**: Application status (SUBMITTED, ACCEPTED, REJECTED, INTERVIEW_SCHEDULED, etc.)
    
    This endpoint provides a comprehensive overview of all candidates who have applied for jobs in the system.
    """
    return await controller.get_all_applications()

 