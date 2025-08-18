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
        Extract S3 key from CV filename/URL
        
        Args:
            cv_filename: CV filename or URL
            
        Returns:
            str: S3 key (e.g., "file/cv_uploads/20250818_081330_3bf84580.pdf")
        """
        if not cv_filename:
            return ""
        
        # If it's a full URL, extract the s3 key part
        if cv_filename.startswith('http'):
            # Extract s3 key from different URL patterns
            if '/s3/file/' in cv_filename:
                # Format: http://localhost:4002/ats-checker/s3/file/cv_uploads/filename.pdf
                # Extract everything after /s3/file/
                return cv_filename.split('/s3/file/')[-1]
            elif '/s3/' in cv_filename:
                # Format: http://localhost:4002/ats-checker/s3/file/cv_uploads/filename.pdf
                # Extract everything after /s3/
                s3_part = cv_filename.split('/s3/')[-1]
                # If it doesn't start with 'file/', add it
                if not s3_part.startswith('file/'):
                    return f"file/{s3_part}"
                return s3_part
            elif '/uploads/' in cv_filename:
                # Format: http://localhost:4002/uploads/filename.pdf -> file/cv_uploads/filename.pdf
                filename = cv_filename.split('/uploads/')[-1]
                return f"file/cv_uploads/{filename}"
            else:
                # For other URL formats, assume it's just the filename and add the path
                filename = cv_filename.split('/')[-1]
                return f"file/cv_uploads/{filename}"
        
        # If it's just a filename, add the S3 path structure
        return f"file/cv_uploads/{cv_filename}"

    def _fix_cv_filename_url(self, cv_filename: str) -> str:
        """
        Fix CV filename URL to use the s3 endpoint format
        
        Args:
            cv_filename: Original CV filename or URL
            
        Returns:
            str: Corrected CV filename URL in format: http://localhost:4002/ats-checker/s3/file/{s3_key}
        """
        if not cv_filename:
            return ""
        
        # Extract the s3_key from the filename/URL
        s3_key = self._extract_s3_key(cv_filename)
        
        # Always return the URL in the s3 endpoint format
        base_url = settings.get_backend_url()
        return f"{base_url}/ats-checker/s3/file/{s3_key}"
    
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