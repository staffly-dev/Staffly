"""
S3 Service for ATS System
Handles AWS S3 file uploads and management
"""

import os
import uuid
from datetime import datetime
from typing import Optional
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from fastapi import HTTPException, UploadFile

from src.utils.logging_config import get_logger
from src.config.settings import get_settings

logger = get_logger(__name__)
settings = get_settings()


class S3Service:
    """Service for handling AWS S3 operations"""
    
    def __init__(self):
        """Initialize S3 service with AWS credentials"""
        self.s3_client = None
        self.bucket_name = settings.AWS_S3_BUCKET
        self.region = settings.AWS_REGION
        
        # Validate required settings
        if not settings.AWS_ACCESS_KEY_ID:
            logger.warning("AWS_ACCESS_KEY_ID not configured")
        if not settings.AWS_SECRET_ACCESS_KEY:
            logger.warning("AWS_SECRET_ACCESS_KEY not configured")
        if not self.bucket_name:
            logger.warning("AWS_S3_BUCKET not configured")
        
        self._initialize_s3_client()
    
    def _initialize_s3_client(self):
        """Initialize S3 client with credentials"""
        try:
            if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
                self.s3_client = boto3.client(
                    's3',
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                    region_name=settings.AWS_REGION
                )
                logger.info(f"S3 client initialized for region: {settings.AWS_REGION}")
            else:
                # Try to use default credentials (IAM roles, etc.)
                self.s3_client = boto3.client('s3', region_name=settings.AWS_REGION)
                logger.info("S3 client initialized with default credentials")
                
        except NoCredentialsError:
            logger.error("AWS credentials not found")
            self.s3_client = None
        except Exception as e:
            logger.error(f"Failed to initialize S3 client: {e}")
            self.s3_client = None
    
    def _generate_unique_filename(self, original_filename: str) -> str:
        """
        Generate a unique filename for S3 upload
        
        Args:
            original_filename: Original file name
            
        Returns:
            str: Unique filename with timestamp and UUID
        """
        # Get file extension
        file_extension = os.path.splitext(original_filename)[1].lower()
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        
        return f"cv_uploads/{timestamp}_{unique_id}{file_extension}"
    
    def _validate_file(self, file: UploadFile) -> None:
        """
        Validate uploaded file
        
        Args:
            file: Uploaded file
            
        Raises:
            HTTPException: If file is invalid
        """
        if not file or not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Check file extension
        file_extension = os.path.splitext(file.filename)[1].lower()
        if file_extension not in ['.pdf', '.docx']:
            raise HTTPException(
                status_code=400, 
                detail="Only PDF and DOCX files are allowed"
            )
        
        # Check file size (16MB limit)
        if hasattr(file, 'size') and file.size and file.size > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds maximum limit of {settings.MAX_FILE_SIZE / (1024*1024)}MB"
            )
    
    async def upload_file(self, file: UploadFile) -> dict:
        """
        Upload file to S3 bucket
        
        Args:
            file: Uploaded file
            
        Returns:
            dict: Upload result with file URL and metadata
            
        Raises:
            HTTPException: If upload fails
        """
        try:
            # Validate file
            self._validate_file(file)
            
            # Check if S3 client is available
            if not self.s3_client:
                raise HTTPException(
                    status_code=500,
                    detail="S3 service not configured. Please check AWS credentials."
                )
            
            # Check if bucket exists
            try:
                self.s3_client.head_bucket(Bucket=self.bucket_name)
            except ClientError as e:
                error_code = e.response['Error']['Code']
                if error_code == '404':
                    raise HTTPException(
                        status_code=500,
                        detail=f"S3 bucket '{self.bucket_name}' not found"
                    )
                elif error_code == '403':
                    raise HTTPException(
                        status_code=500,
                        detail=f"Access denied to S3 bucket '{self.bucket_name}'. Check permissions."
                    )
                else:
                    raise HTTPException(
                        status_code=500,
                        detail=f"S3 bucket error: {str(e)}"
                    )
            
            # Generate unique filename
            s3_key = self._generate_unique_filename(file.filename)
            
            # Read file content
            file_content = await file.read()
            
            # Upload to S3
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=s3_key,
                Body=file_content,
                ContentType=file.content_type,
                ACL='public-read',  # Make file publicly accessible
                Metadata={
                    'original_filename': file.filename,
                    'uploaded_at': datetime.now().isoformat(),
                    'file_size': str(len(file_content))
                }
            )
            
            # Generate public URL
            file_url = f"{settings.s3_bucket_url}/{s3_key}"
            
            logger.info(f"Successfully uploaded {file.filename} to S3: {s3_key}")
            
            return {
                "success": True,
                "file_url": file_url,
                "s3_key": s3_key,
                "original_filename": file.filename,
                "file_size": len(file_content),
                "content_type": file.content_type,
                "uploaded_at": datetime.now().isoformat()
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to upload file to S3: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to upload file: {str(e)}"
            )
    
    async def delete_file(self, s3_key: str) -> bool:
        """
        Delete file from S3 bucket
        
        Args:
            s3_key: S3 object key
            
        Returns:
            bool: True if deleted successfully, False otherwise
        """
        try:
            if not self.s3_client:
                logger.error("S3 client not initialized")
                return False
            
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=s3_key)
            logger.info(f"Successfully deleted file from S3: {s3_key}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete file from S3: {e}")
            return False
    
    async def get_file_url(self, s3_key: str) -> Optional[str]:
        """
        Get public URL for a file in S3
        
        Args:
            s3_key: S3 object key
            
        Returns:
            Optional[str]: Public URL if file exists, None otherwise
        """
        try:
            if not self.s3_client:
                return None
            
            # Check if file exists
            self.s3_client.head_object(Bucket=self.bucket_name, Key=s3_key)
            
            # Return public URL
            return f"{settings.s3_bucket_url}/{s3_key}"
            
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                logger.warning(f"File not found in S3: {s3_key}")
                return None
            else:
                logger.error(f"Error checking file in S3: {e}")
                return None
        except Exception as e:
            logger.error(f"Failed to get file URL: {e}")
            return None
    
    def is_configured(self) -> bool:
        """
        Check if S3 service is properly configured
        
        Returns:
            bool: True if configured, False otherwise
        """
        return (
            self.s3_client is not None and
            self.bucket_name and
            settings.AWS_ACCESS_KEY_ID and
            settings.AWS_SECRET_ACCESS_KEY
        ) 