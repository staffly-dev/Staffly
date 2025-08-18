"""
Upload Controller for ATS System
Handles file upload operations to AWS S3
"""

from fastapi import HTTPException, UploadFile
from fastapi.responses import JSONResponse
from fastapi.responses import StreamingResponse

from src.services.s3_service import S3Service
from src.utils.logging_config import get_logger
from src.config.settings import get_settings

logger = get_logger(__name__)
settings = get_settings()


class AWS_S3Controller:
    """Controller for AWS S3 file operations"""
    
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

            # Normalize key: add folder prefix if only filename provided
            normalized_key = s3_key if "/" in s3_key else f"cv_uploads/{s3_key}"
            logger.info(f"Normalized S3 key for deletion: {normalized_key}")

            success = await self.s3_service.delete_file(normalized_key)
            
            if success:
                return {
                    "success": True,
                    "message": f"File {normalized_key} deleted successfully",
                    "deleted_at": __import__("datetime").datetime.utcnow().isoformat() + "Z"
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
    

    async def get_presigned_url(self, s3_key: str, expires_in: int = 3600) -> dict:
        """
        Get a presigned URL for a private S3 object
        """
        try:
            logger.info(f"Generating presigned URL for: {s3_key}")
            normalized_key = s3_key if "/" in s3_key else f"cv_uploads/{s3_key}"
            url = await self.s3_service.generate_presigned_url(normalized_key, expires_in)
            if not url:
                raise HTTPException(status_code=404, detail=f"File not found or presign failed: {normalized_key}")
            return {"success": True, "presigned_url": url, "s3_key": normalized_key, "expires_in": expires_in}
                
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error generating presigned URL: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Error generating presigned URL: {str(e)}"
            ) 

    async def download_file(self, s3_key: str):
        """Stream a file from S3 via the backend to hide AWS details."""
        try:
            normalized_key = s3_key if "/" in s3_key else f"cv_uploads/{s3_key}"
            result = await self.s3_service.get_file_bytes(normalized_key)
            if not result:
                raise HTTPException(status_code=404, detail="File not found")

            data, content_type, content_length, original_filename = result

            return StreamingResponse(
                iter([data]),
                media_type=content_type,
                headers={
                    "Content-Length": str(content_length),
                    "Content-Disposition": f"inline; filename=\"{original_filename}\""
                }
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error streaming file: {e}")
            raise HTTPException(status_code=500, detail="Failed to stream file")