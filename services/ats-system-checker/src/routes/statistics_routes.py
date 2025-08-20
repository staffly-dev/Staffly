"""
Statistics Routes for ATS System
System analytics and metrics endpoints
"""

from typing import Optional
from fastapi import APIRouter, Depends, Header, HTTPException, status

from src.controllers import StatisticsController
from src.utils.dependencies import get_statistics_controller
from src.models.api_models import StatisticsResponse, UserStatisticsRequest, UserStatisticsResponse
from src.utils.jwt_utils import jwt_utils
from src.utils.gateway_client import verify_user_exists_and_token_valid

router = APIRouter(tags=["statistics"])

@router.get("/statistics", response_model=StatisticsResponse, summary="Get System Statistics")
async def get_statistics(
    controller = Depends(get_statistics_controller)
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


@router.get("/user-statistics", response_model=UserStatisticsResponse, summary="Get User-Specific Statistics")
async def get_user_statistics(
    x_user_id: Optional[str] = Header(default=None, alias="X-User-Id"),
    x_created_by: Optional[str] = Header(default=None, alias="X-Created-By"),
    authorization: Optional[str] = Header(default=None, alias="Authorization"),
    controller = Depends(get_statistics_controller)
):
    """
    Get comprehensive system statistics for a specific user (JWT protected).
    
    Authentication:
    - Authorization: Bearer <access_token>
    - X-User-Id: user id from API Gateway (required)
    - X-Created-By: creator id (optional; must match user id if provided)
    
    Returns:
    - User-specific application statistics
    - User-specific CV evaluation metrics
    - User-specific quiz performance
    - Daily activity statistics for the user
    - Last activity timestamp
    """
    try:
        # Validate token presence and authenticity
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

        # Optional created_by must match user_id if provided
        if x_created_by and x_created_by != x_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="created_by must match user_id")

        # Use x_user_id as created_by if not provided
        created_by = x_created_by or x_user_id
        
        # Get user-specific statistics
        return await controller.get_user_statistics(x_user_id, created_by)
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve user statistics: {str(e)}"
        ) 