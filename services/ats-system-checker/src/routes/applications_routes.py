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
    - **user_name**: Candidate's name (extracted from CV)
    - **email_address**: Candidate's email address
    - **application_status**: Current status (SUBMITTED, ACCEPTED, REJECTED, etc.)
    - **cv_file**: CV filename (not the full content)
    - **cv_evaluation_score**: CV evaluation score (0-100)
    - **quiz_score**: Quiz score (0-10) if quiz was completed
    
    This endpoint provides a comprehensive overview of all candidates who have applied for jobs in the system.
    """
    return await controller.get_all_applications() 