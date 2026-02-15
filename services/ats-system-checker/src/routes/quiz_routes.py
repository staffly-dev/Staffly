"""
Quiz Routes for ATS System
Quiz evaluation endpoints
"""

from typing import Optional
from fastapi import APIRouter, Depends, Form, Path, HTTPException, status, Header
from fastapi.responses import JSONResponse

from src.controllers import QuizController
from src.utils.dependencies import get_quiz_controller
from src.models.api_models import AllQuizUsersResponse, QuizDisplayResponse, AuthenticatedRequest
from src.models.evaluation_models import APIResponse
from src.utils.jwt_utils import jwt_utils
from src.utils.gateway_client import verify_user_exists_and_token_valid

router = APIRouter(tags=["quiz"])


@router.post("/quiz/submit", response_model=APIResponse, summary="Submit Quiz")
async def submit_quiz(
    answers: str = Form(..., description="Quiz answers as JSON string"),
    quiz_session_id: str = Form(..., description="Quiz session ID (required)"),
    email: str = Form(..., description="Candidate email address (required for security validation)"),
    controller: QuizController = Depends(get_quiz_controller) # type: ignore
):
    """
    Submit quiz answers for evaluation.
    
    - **answers**: Quiz answers as JSON string
    - **quiz_session_id**: Quiz session ID (required for validation and security)
    - **email**: Candidate email address (required for security validation - must match original application email)
    
    Returns quiz results including score and pass/fail status.
    Quiz can only be submitted once per session.
    Email must match the email used in the original job application.
    Quiz questions are automatically retrieved from the database using the quiz_session_id.
    """
    return await controller.evaluate_quiz(
        answers=answers,
        quiz_session_id=quiz_session_id,
        email=email
    )


@router.post("/quiz/users", response_model=APIResponse, summary="Get All Quiz Users")
async def get_all_quiz_users(
    request: Optional[AuthenticatedRequest] = None,
    authorization: Optional[str] = None,
    x_user_id: Optional[str] = Header(default=None, alias="X-User-Id"),
    controller: QuizController = Depends(get_quiz_controller) # type: ignore
):
    """
    Get all quiz information for users from the database.
    
    This endpoint requires:
    - user_id: User ID from API Gateway
    - created_by: User who created the records
    - access_token: Valid access token from API Gateway
    
    Returns comprehensive information about all quiz sessions including:
    - Quiz session details
    - Candidate email addresses
    - Quiz links that were sent to users
    - Associated job information
    - Quiz completion status and scores
    - Timestamps for creation, start, and completion
    
    This endpoint is useful for administrators to track all quiz activities
    and monitor the quiz links that have been sent to candidates.
    """
    try:
        # Extract token from body or Authorization header
        token_candidate = request.access_token if request else None
        if not token_candidate and authorization and authorization.lower().startswith("bearer "):
            token_candidate = authorization.split(" ", 1)[1]
        if not token_candidate:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing access token")

        # Normalize and validate token; do not derive user from token
        token_candidate = token_candidate.strip().strip('"').strip("'")
        if token_candidate.lower().startswith("bearer "):
            token_candidate = token_candidate.split(" ", 1)[1].strip()
        info = jwt_utils.decode_token(token_candidate)
        # Determine effective user id from body or API Gateway header
        effective_user_id = (request.user_id if request else None) or x_user_id
        if effective_user_id:
            if len(effective_user_id) != 24 or any(c not in '0123456789abcdef' for c in effective_user_id.lower()):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user_id format")
            # Verify user exists in API Gateway database and token is valid
            await verify_user_exists_and_token_valid(effective_user_id, token_candidate)
        # For this admin-style listing we won't enforce user scoping here; controller can implement scoping if needed

        return await controller.get_all_quiz_users()
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve quiz users: {str(e)}"
        )


@router.get("/quiz/{quiz_session_id}", response_model=APIResponse, summary="Get Quiz for Display")
async def get_quiz_for_display(
    quiz_session_id: str = Path(..., description="Quiz session ID"),
    controller: QuizController = Depends(get_quiz_controller) # type: ignore
):
    """
    Get quiz data for frontend display based on quiz session ID.
    
    This endpoint serves the quiz questions and metadata to the frontend
    so users can take the quiz. The quiz session ID comes from the links
    sent to candidates via email.
    
    - **quiz_session_id**: Unique quiz session identifier
    
    Returns:
    - Quiz questions with answer options
    - Time limit and pass threshold
    - Associated job information
    - Quiz session status and metadata
    
    The quiz status will be automatically updated to "IN_PROGRESS" when
    accessed for the first time.
    """
    return await controller.get_quiz_for_display(quiz_session_id) 