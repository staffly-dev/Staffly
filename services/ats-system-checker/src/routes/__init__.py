"""
Route Registration for ATS System
"""

from fastapi import APIRouter
from src.routes.jobs_routes import router as jobs_router
from src.routes.quiz_routes import router as quiz_router
from src.routes.statistics_routes import router as statistics_router
from src.routes.applications_routes import router as applications_router

# Create main API router
api_router = APIRouter()

# Include only the routers that should have /api prefix
# health_router and upload_router are included separately in main.py
api_router.include_router(jobs_router, tags=["jobs"])
api_router.include_router(quiz_router, tags=["quiz"])
api_router.include_router(statistics_router, tags=["statistics"])
api_router.include_router(applications_router, tags=["applications"])

__all__ = ["api_router"] 