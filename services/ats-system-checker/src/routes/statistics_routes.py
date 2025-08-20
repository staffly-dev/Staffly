"""
Statistics Routes for ATS System
System analytics and metrics endpoints
"""

from fastapi import APIRouter, Depends, Header, HTTPException, status

from src.controllers import StatisticsController
from src.utils.dependencies import get_statistics_controller
from src.models.api_models import StatisticsResponse, UserStatisticsRequest, UserStatisticsResponse
from src.utils.jwt_utils import jwt_utils
from src.utils.gateway_client import verify_user_exists_and_token_valid

router = APIRouter(tags=["statistics"])

@router.get("/statistics", response_model=StatisticsResponse, summary="Get System Statistics")
async def get_statistics(
    controller: StatisticsController = Depends(get_statistics_controller)
):
    """
    Get comprehensive system statistics and analytics.
    
    Returns:
    - Total applications received
    - Total CVs evaluated
    - Acceptance rate
    - Average CV score
    - Quiz pass rate
    - Daily application statistics
    """
    return await controller.get_statistics()


@router.post("/user-statistics", response_model=UserStatisticsResponse, summary="Get User-Specific Statistics")
async def get_user_statistics(
    request: UserStatisticsRequest,
    controller: StatisticsController = Depends(get_statistics_controller)
):
    """
    Get comprehensive system statistics for a specific user.
    
    This endpoint requires:
    - user_id: User ID from API Gateway
    - created_by: User who created the records
    - access_token: Valid access token from API Gateway
    
    Returns:
    - User-specific application statistics
    - User-specific CV evaluation metrics
    - User-specific quiz performance
    - Daily activity statistics for the user
    - Last activity timestamp
    """
    try:
        # Validate user_id format
        if len(request.user_id) != 24 or any(c not in '0123456789abcdef' for c in request.user_id.lower()):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user_id format")
        
        # Verify user exists in API Gateway database and token is valid
        await verify_user_exists_and_token_valid(request.user_id, request.access_token)
        
        # Get user-specific statistics
        return await controller.get_user_statistics(request.user_id, request.created_by)
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve user statistics: {str(e)}"
        ) 