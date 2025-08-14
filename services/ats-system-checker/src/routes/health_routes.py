"""
Health Routes for ATS System
Health check and system status endpoints
"""

from fastapi import APIRouter, Depends
from typing import Dict, Any

from src.controllers import HealthController
from src.utils.dependencies import get_health_controller
from src.models.evaluation_models import APIResponse

router = APIRouter(tags=["health"])


@router.get("", summary="Health Check")
async def health_check(
    controller: HealthController = Depends(get_health_controller)
) -> APIResponse:
    """
    Health check endpoint - Returns system health status
    
    Returns:
    - Database connectivity status
    - AI services availability
    - Email service configuration
    - Overall system health
    """
    return await controller.health_check()


@router.get("/simple", summary="Simple Health Check")
async def simple_health_check() -> Dict[str, str]:
    """
    Simple health check endpoint
    
    Returns basic system status without dependencies.
    """
    return {
        "status": "healthy",
        "message": "ATS System is operational",
        "version": "2.0.0"
    }


@router.get("/test", summary="Test Health Check")
async def test_health_check() -> Dict[str, str]:
    """
    Test health check endpoint
    
    Returns test system status.
    """
    return {
        "status": "test",
        "message": "ATS System test endpoint",
        "version": "2.0.0"
    } 