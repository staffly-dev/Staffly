"""
Quiz Controller for ATS System
Handles quiz submissions and evaluations
"""

from typing import Optional
from fastapi import HTTPException

from src.utils.logging_config import get_logger
from src.utils.responses import success_response
from src.services.database_service import DatabaseService
from src.services.evaluation_service import EvaluationService

logger = get_logger(__name__)


class QuizController:
    """Controller for quiz submission and evaluation operations"""
    
    def __init__(
        self,
        database_service: DatabaseService,
        evaluation_service: EvaluationService
    ):
        """
        Initialize quiz controller
        
        Args:
            database_service: Database service instance
            evaluation_service: Evaluation service instance
        """
        self.database_service = database_service
        self.evaluation_service = evaluation_service
    

    
    async def evaluate_quiz(
        self,
        answers: str,
        quiz_data: str,
        email: Optional[str] = None,
        application_id: Optional[str] = None
    ):
        """
        Handle quiz evaluation HTTP request
        
        Args:
            answers: Quiz answers as JSON string
            quiz_data: Quiz questions data as JSON string
            email: Candidate email address
            application_id: Application ID for linking quiz result
            
        Returns:
            APIResponse: Quiz evaluation results with score and status
        """
        try:
            logger.info(f" Processing quiz evaluation request for application: {application_id}")
            
            # Call evaluation service to handle business logic
            result = await self.evaluation_service.evaluate_quiz_submission(
                answers=answers,
                quiz_data=quiz_data,
                email=email,
                application_id=application_id
            )
            
            # Return success response with service result
            return success_response(
                message=f"Quiz evaluation complete: {result['score']}/{result['total_questions']}",
                data=result
            )
            
        except ValueError as e:
            # Handle validation errors as 400 Bad Request
            logger.error(f" Quiz validation error: {e}")
            raise HTTPException(status_code=400, detail=str(e))
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f" Error evaluating quiz: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to evaluate quiz: {str(e)}")
    


    async def get_all_quiz_users(self):
        """
        Get all quiz information for users from the database
        
        Returns:
            APIResponse: All quiz users information with their quiz links
        """
        try:
            logger.info(" Retrieving all quiz users information")
            
            # Get quiz users info from database
            quiz_users_data = await self.database_service.get_all_quiz_users_info()
            
            # Convert to response format
            from src.models.api_models import QuizUserInfoResponse, AllQuizUsersResponse
            
            quiz_users_responses = []
            for quiz_data in quiz_users_data:
                quiz_user_response = QuizUserInfoResponse(
                    quiz_session_id=quiz_data["quiz_session_id"],
                    candidate_email=quiz_data["candidate_email"],
                    quiz_link=quiz_data["quiz_link"],
                    job_title=quiz_data["job_title"],
                    job_id=quiz_data["job_id"],
                    quiz_status=quiz_data["quiz_status"],
                    created_at=quiz_data["created_at"],
                    started_at=quiz_data["started_at"],
                    completed_at=quiz_data["completed_at"],
                    score=quiz_data["score"],
                    total_questions=quiz_data["total_questions"],
                    percentage=quiz_data["percentage"],
                    passed=quiz_data["passed"]
                )
                quiz_users_responses.append(quiz_user_response)
            
            # Create final response
            response_data = AllQuizUsersResponse(
                total_quizzes=len(quiz_users_responses),
                quiz_users=quiz_users_responses
            )
            
            logger.info(f" Retrieved {len(quiz_users_responses)} quiz users")
            
            return success_response(
                message=f"Retrieved {len(quiz_users_responses)} quiz users successfully",
                data=response_data.dict()
            )
            
        except Exception as e:
            logger.error(f" Error retrieving quiz users: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to retrieve quiz users: {str(e)}")

    async def get_quiz_for_display(self, quiz_session_id: str):
        """
        Get quiz data for frontend display
        
        Args:
            quiz_session_id: Quiz session ID
            
        Returns:
            APIResponse: Quiz data for frontend display
        """
        try:
            logger.info(f" Retrieving quiz for display: {quiz_session_id}")
            
            # Get quiz data from database
            quiz_data = await self.database_service.get_quiz_for_display(quiz_session_id)
            
            if not quiz_data:
                raise HTTPException(
                    status_code=404, 
                    detail="Quiz not found or no longer accessible"
                )
            
            # Convert to response format
            from src.models.api_models import QuizDisplayResponse
            
            quiz_response = QuizDisplayResponse(
                quiz_session_id=quiz_data["quiz_session_id"],
                questions=quiz_data["questions"],
                total_questions=quiz_data["total_questions"],
                time_limit_seconds=quiz_data["time_limit_seconds"],
                pass_threshold=quiz_data["pass_threshold"],
                job_title=quiz_data["job_title"],
                job_description=quiz_data["job_description"],
                candidate_email=quiz_data["candidate_email"],
                status=quiz_data["status"],
                created_at=quiz_data["created_at"],
                started_at=quiz_data["started_at"]
            )
            
            logger.info(f" Quiz display data retrieved for session: {quiz_session_id}")
            
            return success_response(
                message="Quiz retrieved successfully",
                data=quiz_response.dict()
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f" Error retrieving quiz for display: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to retrieve quiz: {str(e)}") 