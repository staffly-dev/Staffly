"""
Application Controller for ATS System
Handles job posting creation, retrieval, and management
"""

from typing import Optional, List
from datetime import datetime
from fastapi import HTTPException, UploadFile

from src.utils.logging_config import get_logger
from src.utils.responses import success_response
from src.models.api_models import JobPostingResponse, ApplicationsListResponse, ApplicationListResponse
from src.services.database_service import DatabaseService
from src.services.evaluation_service import EvaluationService
from src.config.settings import get_settings
   
   
logger = get_logger(__name__)
settings = get_settings()


class ApplicationController:
    """Controller for application operations"""
   
    def __init__(self, database_service: DatabaseService):
        """
        Initialize application controller
        
        Args:
            database_service: Database service instance
        """
        self.database_service = database_service
    
    async def get_all_applications(self) -> ApplicationsListResponse:
        """
        Get all applications across all jobs
        
        Returns:
            ApplicationsListResponse: List of all applications with required fields
        """
        try:
            logger.info(" Getting all applications")
            
            applications = await self.database_service.get_all_applications()
            
            application_responses = []
            for app in applications:
                app_response = ApplicationListResponse(
                    application_id=app.application_id,
                    candidate_email=app.candidate_email,
                    candidate_name=app.candidate_name,
                    cv_score=app.cv_score,
                    cv_filename=app.cv_filename,
                    decision=app.decision if app.decision else None,
                    job_id=app.job_id,
                    quiz_score=app.quiz_score,
                    status=app.status
                )
                application_responses.append(app_response)
            
            response = ApplicationsListResponse(
                total_applications=len(application_responses),
                applications=application_responses
            )
            
            logger.info(f" Successfully retrieved {len(application_responses)} applications")
            return response
            
        except Exception as e:
            logger.error(f" Failed to get applications: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to get applications: {str(e)}")
    
    async def delete_application(self, application_id: str):
        """
        Delete a specific application
        
        Args:
            application_id: Application ID to delete
            
        Returns:
            APIResponse: Deletion confirmation
        """
        try:
            logger.info(f" Deleting application: {application_id}")
            
            # Check if application exists
            application = await self.database_service.get_application_by_id(application_id)
            if not application:
                raise HTTPException(
                    status_code=404,
                    detail="Application not found"
                )
            
            # Delete application
            success = await self.database_service.delete_application(application_id)
            
            if not success:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to delete application"
                )
            
            logger.info(f" Successfully deleted application: {application_id}")
            
            return success_response(
                message="Application deleted successfully",
                data={
                    "application_id": application_id,
                    "candidate_email": application.candidate_email,
                    "candidate_name": application.candidate_name,
                    "deleted_at": datetime.now().isoformat()
                }
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f" Error deleting application: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to delete application: {str(e)}")