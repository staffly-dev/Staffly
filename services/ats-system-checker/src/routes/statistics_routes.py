"""
Statistics Routes for ATS System
System analytics and metrics endpoints
"""

from fastapi import APIRouter, Depends

from src.controllers import StatisticsController
from src.utils.dependencies import get_statistics_controller
from src.models.api_models import StatisticsResponse

router = APIRouter(prefix="/statistics", tags=["statistics"])

@router.get("", response_model=StatisticsResponse, summary="Get System Statistics")
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