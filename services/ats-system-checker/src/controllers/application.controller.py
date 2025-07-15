"""
Application Controller for ATS System
Handles job posting creation, retrieval, and management
"""

from typing import Optional, List
from fastapi import HTTPException, UploadFile

from src.utils.logging_config import get_logger
from src.utils.responses import success_response
from src.models.api_models import JobPostingResponse, ApplicationsListResponse, ApplicationListResponse
from src.services.database_service import DatabaseService
from src.services.evaluation_service import EvaluationService
from src.config.settings import get_settings
from ai.services.document_service import DocumentProcessingService
   
   
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
                    user_name=app.candidate_name,
                    email_address=app.candidate_email,
                    application_status=app.status,
                    cv_file=app.cv_filename,
                    cv_evaluation_score=app.cv_score,
                    quiz_score=app.quiz_score
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
    