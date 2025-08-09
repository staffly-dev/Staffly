"""
Upload Controller for ATS System
Handles file upload operations to AWS S3
"""

from fastapi import HTTPException, UploadFile
from fastapi.responses import JSONResponse

from src.services.s3_service import S3Service
from src.utils.logging_config import get_logger
from src.config.settings import get_settings

logger = get_logger(__name__)
settings = get_settings()


class UploadController:
    """Controller for file upload operations"""
    
    def __init__(self):
        """Initialize upload controller with S3 service"""
        self.s3_service = S3Service()
    
    async def upload_file(self, file: UploadFile) -> dict:
        """
        Upload a file to AWS S3 bucket
        
        Args:
            file: Uploaded file
            
        Returns:
            dict: Upload result with file URL and metadata
            
        Raises:
            HTTPException: If upload fails
        """
        try:
            logger.info(f"Processing file upload: {file.filename}")
            
            # Upload file to S3
            result = await self.s3_service.upload_file(file)
            
            logger.info(f"File uploaded successfully: {result['file_url']}")
            
            return result
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Unexpected error during file upload: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Internal server error: {str(e)}"
            )
    
    async def check_s3_status(self) -> dict:
        """
        Check the status of the S3 service configuration
        
        Returns:
            dict: S3 service status information
        """
        try:
            status = {
                "configured": self.s3_service.is_configured(),
                "bucket_name": settings.AWS_S3_BUCKET,
                "region": settings.AWS_REGION,
                "bucket_url": settings.s3_bucket_url,
                "credentials_configured": bool(
                    settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY
                )
            }
            
            return status
            
        except Exception as e:
            logger.error(f"Error checking S3 status: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Error checking S3 status: {str(e)}"
            )
    
    async def delete_file(self, s3_key: str) -> dict:
        """
        Delete a file from S3 bucket
        
        Args:
            s3_key: S3 object key of the file to delete
            
        Returns:
            dict: Deletion confirmation
        """
        try:
            logger.info(f"Attempting to delete file from S3: {s3_key}")
            
            success = await self.s3_service.delete_file(s3_key)
            
            if success:
                return {
                    "success": True,
                    "message": f"File {s3_key} deleted successfully",
                    "deleted_at": "2024-01-01T00:00:00Z"  # You can add actual timestamp
                }
            else:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to delete file from S3"
                )
                
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting file from S3: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Error deleting file: {str(e)}"
            )
    
    async def get_file_url(self, s3_key: str) -> dict:
        """
        Get the public URL for a file in S3
        
        Args:
            s3_key: S3 object key of the file
            
        Returns:
            dict: File URL information
        """
        try:
            logger.info(f"Getting URL for file: {s3_key}")
            
            file_url = await self.s3_service.get_file_url(s3_key)
            
            if file_url:
                return {
                    "success": True,
                    "file_url": file_url,
                    "s3_key": s3_key
                }
            else:
                raise HTTPException(
                    status_code=404,
                    detail=f"File not found: {s3_key}"
                )
                
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting file URL: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Error getting file URL: {str(e)}"
            ) 