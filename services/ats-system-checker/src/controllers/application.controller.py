"""
Application Controller for ATS System
Handles job posting creation, retrieval, and management
"""

from typing import Optional, List
from datetime import datetime
from fastapi import HTTPException, UploadFile
import os

from src.utils.logging_config import get_logger
from src.utils.responses import success_response
from src.models.api_models import JobPostingResponse, ApplicationsListResponse, ApplicationListResponse, SingleApplicationResponse
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
                # Fix CV filename URL construction
                cv_filename = self._fix_cv_filename_url(app.cv_filename)
                s3_key = self._extract_s3_key(app.cv_filename)
                
                app_response = ApplicationListResponse(
                    application_id=app.application_id,
                    candidate_email=app.candidate_email,
                    candidate_name=app.candidate_name,
                    cv_score=app.cv_score,
                    cv_filename=cv_filename,
                    s3_key=s3_key,
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
    
    def _extract_s3_key(self, cv_filename: str) -> str:
        """
        Extract S3 key or local filename from CV filename/URL
        
        Args:
            cv_filename: CV filename or URL
            
        Returns:
            str: S3 key or local filename
        """
        if not cv_filename:
            return ""
        
        # If it's a full URL, extract just the filename
        if cv_filename.startswith('http'):
            # Extract filename from URL path
            if '/uploads/' in cv_filename:
                return cv_filename.split('/uploads/')[-1]
            elif '/s3/' in cv_filename:
                return cv_filename.split('/s3/')[-1]
            else:
                # For other URL formats, try to get the last part after the last slash
                return cv_filename.split('/')[-1]
        
        # If it's just a filename, return as is
        return cv_filename

    def _fix_cv_filename_url(self, cv_filename: str) -> str:
        """
        Fix CV filename URL to ensure proper file access
        
        Args:
            cv_filename: Original CV filename or URL
            
        Returns:
            str: Corrected CV filename URL
        """
        if not cv_filename:
            return ""
        
        # If it's already a full URL, return as is (including S3 URLs)
        if cv_filename.startswith('http'):
            # If it's a localhost URL, replace with production URL
            if 'localhost:' in cv_filename:
                return cv_filename.replace('http://localhost:4000', settings.get_uploads_url())
            # If it's already a production URL or S3 URL, return as is
            return cv_filename
        
        # If it's just a filename, construct the full URL
        # Check if the file exists locally first
        # Try multiple possible paths for the uploads directory
        uploads_paths = [
            os.path.join(os.path.dirname(__file__), "..", "..", settings.UPLOAD_FOLDER),  # Local development
            os.path.join("/app", settings.UPLOAD_FOLDER),  # Docker container path
            os.path.join(os.getcwd(), settings.UPLOAD_FOLDER),  # Current working directory
            settings.UPLOAD_FOLDER,  # Relative path
        ]
        
        file_found = False
        for uploads_dir in uploads_paths:
            local_file_path = os.path.join(uploads_dir, cv_filename)
            if os.path.exists(local_file_path):
                logger.info(f"File exists locally: {local_file_path}")
                file_found = True
                break
        
        if file_found:
            # File exists locally, serve from uploads endpoint
            return f"{settings.UPLOADS_BASE_URL}/uploads/{cv_filename}"
        else:
            # File doesn't exist locally, might be in S3
            # Try to construct S3 URL if S3 is configured
            if hasattr(settings, 'AWS_S3_BUCKET') and settings.AWS_S3_BUCKET:
                return f"{settings.s3_bucket_url}/{cv_filename}"
            else:
                # Fallback to uploads endpoint
                logger.warning(f"File not found locally in any of these paths: {uploads_paths}, but will try to serve from uploads endpoint")
                return f"{settings.UPLOADS_BASE_URL}/uploads/{cv_filename}"
    
    async def get_application_by_id(self, application_id: str) -> SingleApplicationResponse:
        """
        Get a single application by ID
        
        Args:
            application_id: Application ID to retrieve
            
        Returns:
            SingleApplicationResponse: Single application with required fields
        """
        try:
            logger.info(f" Getting application: {application_id}")
            
            application = await self.database_service.get_application_by_id(application_id)
            if not application:
                raise HTTPException(
                    status_code=404,
                    detail="Application not found"
                )
            
            # Fix CV filename URL construction
            cv_filename = self._fix_cv_filename_url(application.cv_filename)
            s3_key = self._extract_s3_key(application.cv_filename)
            
            app_response = SingleApplicationResponse(
                application_id=application.application_id,
                candidate_email=application.candidate_email,
                candidate_name=application.candidate_name,
                cv_score=application.cv_score if application.cv_score is not None else 0,
                cv_filename=cv_filename,
                s3_key=s3_key,
                decision=application.decision if application.decision else "PENDING",
                job_id=application.job_id,
                quiz_score=application.quiz_score,
                status=application.status
            )
            
            logger.info(f" Successfully retrieved application: {application_id}")
            return app_response
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f" Failed to get application {application_id}: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to get application: {str(e)}")

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