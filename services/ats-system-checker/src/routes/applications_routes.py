"""
Applications Routes for ATS System
Application management endpoints
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Header

from src.controllers import ApplicationController
from src.utils.dependencies import get_application_controller
from src.models.api_models import ApplicationsListResponse, SingleApplicationResponse, AuthenticatedRequest
from src.utils.jwt_utils import jwt_utils
from src.utils.gateway_client import verify_user_exists_and_token_valid

router = APIRouter(tags=["applications"])


@router.post("/applications", response_model=ApplicationsListResponse, summary="Get All Applications")
async def get_all_applications(
    request: Optional[AuthenticatedRequest] = None,
    authorization: Optional[str] = None,
    x_user_id: Optional[str] = Header(default=None, alias="X-User-Id"),
    controller: ApplicationController = Depends(get_application_controller) # type: ignore
):
    """
    Get all job applications across all job postings.
    
    This endpoint requires:
    - user_id: User ID from API Gateway
    - created_by: User who created the records
    - access_token: Valid access token from API Gateway
    
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
    try:
        token_candidate = request.access_token if request else None
        if not token_candidate and authorization and authorization.lower().startswith("bearer "):
            token_candidate = authorization.split(" ", 1)[1]
        if not token_candidate:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing access token")

        # Normalize and validate token; do not derive user from token
        token_candidate = token_candidate.strip().strip('"').strip("'")
        if token_candidate.lower().startswith("bearer "):
            token_candidate = token_candidate.split(" ", 1)[1].strip()
        # Enforce normalization and validation
        token_candidate = token_candidate.strip().strip('"').strip("'")
        if token_candidate.lower().startswith("bearer "):
            token_candidate = token_candidate.split(" ", 1)[1].strip()
        
        effective_user_id = (request.user_id if request else None) or x_user_id
        if effective_user_id:
            if len(effective_user_id) != 24 or any(c not in '0123456789abcdef' for c in effective_user_id.lower()):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user_id format")
            # Verify user exists in API Gateway database and token is valid
            await verify_user_exists_and_token_valid(effective_user_id, token_candidate)

        return await controller.get_all_applications()
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve applications: {str(e)}"
        )


@router.post("/applications/{application_id}", response_model=SingleApplicationResponse, summary="Get Application by ID")
async def get_application_by_id(
    application_id: str,
    request: Optional[AuthenticatedRequest] = None,
    authorization: Optional[str] = None,
    x_user_id: Optional[str] = Header(default=None, alias="X-User-Id"),
    controller: ApplicationController = Depends(get_application_controller) # type: ignore
):
    """
    Get a single job application by its ID.
    
    This endpoint requires:
    - user_id: User ID from API Gateway
    - created_by: User who created the records
    - access_token: Valid access token from API Gateway
    
    Returns a single application with the following information:
    - **application_id**: Unique application identifier
    - **candidate_email**: Candidate's email address
    - **candidate_name**: Candidate's name
    - **cv_score**: CV evaluation score (0-100)
    - **cv_filename**: CV file URL
    - **decision**: CV evaluation decision (ACCEPTED, REJECTED, PENDING)
    - **job_id**: Associated job ID
    - **quiz_score**: Quiz score (0-10) if quiz was completed
    - **status**: Application status
    
    This endpoint provides detailed information about a specific application.
    """
    try:
        token_candidate = request.access_token if request else None
        if not token_candidate and authorization and authorization.lower().startswith("bearer "):
            token_candidate = authorization.split(" ", 1)[1]
        if not token_candidate:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing access token")

        # Normalize and validate token; do not derive user from token
        token_candidate = token_candidate.strip().strip('"').strip("'")
        if token_candidate.lower().startswith("bearer "):
            token_candidate = token_candidate.split(" ", 1)[1].strip()
        
        effective_user_id = (request.user_id if request else None) or x_user_id
        if effective_user_id:
            if len(effective_user_id) != 24 or any(c not in '0123456789abcdef' for c in effective_user_id.lower()):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user_id format")
            # Verify user exists in API Gateway database and token is valid
            await verify_user_exists_and_token_valid(effective_user_id, token_candidate)

        return await controller.get_application_by_id(application_id)
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve application: {str(e)}"
        )


@router.delete("/applications/{application_id}", summary="Delete Application")
async def delete_application(
    application_id: str,
    request: Optional[AuthenticatedRequest] = None,
    authorization: Optional[str] = None,
    x_user_id: Optional[str] = Header(default=None, alias="X-User-Id"),
    controller: ApplicationController = Depends(get_application_controller)  # type: ignore
):
    """
    Delete a specific job application.
    
    Authentication required via API Gateway JWT in request body.
    
    - **application_id**: Unique identifier of the application to delete
    - **user_id / access_token**: Must be provided and must match
    
    This will permanently delete the application and all associated data.
    Use with caution as this action cannot be undone.
    """
    try:
        # Validate token presence and authenticity (do not derive user id from token)
        token_candidate = request.access_token if request else None
        if not token_candidate and authorization and authorization.lower().startswith("bearer "):
            token_candidate = authorization.split(" ", 1)[1]
        if not token_candidate:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing access token")
        token_candidate = token_candidate.strip().strip('"').strip("'")
        if token_candidate.lower().startswith("bearer "):
            token_candidate = token_candidate.split(" ", 1)[1].strip()
        
        # Use API Gateway provided user id (from body or header)
        effective_user_id = (request.user_id if request else None) or x_user_id
        if not effective_user_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="user_id is required (body or X-User-Id header)")
        if len(effective_user_id) != 24 or any(c not in '0123456789abcdef' for c in effective_user_id.lower()):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user_id format")
        # Verify user exists in API Gateway database and token is valid
        await verify_user_exists_and_token_valid(effective_user_id, token_candidate)

        # Proceed with deletion
        return await controller.delete_application(application_id)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete application: {str(e)}"
        )

 