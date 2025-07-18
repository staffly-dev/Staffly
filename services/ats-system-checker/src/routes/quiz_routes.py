"""
Quiz Routes for ATS System
Quiz evaluation endpoints
"""

from typing import Optional
from fastapi import APIRouter, Depends, Form, Path
from fastapi.responses import JSONResponse

from src.controllers import QuizController
from src.utils.dependencies import get_quiz_controller
from src.models.api_models import AllQuizUsersResponse, QuizDisplayResponse
from src.models.evaluation_models import APIResponse

router = APIRouter(prefix="/api/quiz", tags=["quiz"])


@router.post("/submit", response_model=APIResponse, summary="Submit Quiz")
async def submit_quiz(
    answers: str = Form(..., description="Quiz answers as JSON string"),
    quiz_data: str = Form(..., description="Quiz questions data as JSON string"),
    email: Optional[str] = Form(None, description="Candidate email address"),
    application_id: Optional[str] = Form(None, description="Application ID"),
    controller: QuizController = Depends(get_quiz_controller) # type: ignore
):
    """
    Submit quiz answers for evaluation.
    
    - **answers**: Quiz answers as JSON string
    - **quiz_data**: Quiz questions data as JSON string
    - **email**: Candidate email address
    - **application_id**: Application ID for linking quiz result
    
    Returns quiz results including score and pass/fail status.
    """
    return await controller.evaluate_quiz(
        answers=answers,
        quiz_data=quiz_data,
        email=email,
        application_id=application_id
    )


@router.get("/users", response_model=APIResponse, summary="Get All Quiz Users")
async def get_all_quiz_users(
    controller: QuizController = Depends(get_quiz_controller) # type: ignore
):
    """
    Get all quiz information for users from the database.
    
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
    return await controller.get_all_quiz_users()


@router.get("/{quiz_session_id}", response_model=APIResponse, summary="Get Quiz for Display")
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