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
        logger.info("Initializing S3 service...")
        self.s3_client = None
        self.bucket_name = settings.AWS_S3_BUCKET
        self.region = settings.AWS_REGION
        
        logger.info(f"S3 bucket name: {self.bucket_name}")
        logger.info(f"S3 region: {self.region}")
        logger.info(f"AWS_ACCESS_KEY_ID configured: {bool(settings.AWS_ACCESS_KEY_ID)}")
        logger.info(f"AWS_SECRET_ACCESS_KEY configured: {bool(settings.AWS_SECRET_ACCESS_KEY)}")
        
        # Validate required settings
        if not settings.AWS_ACCESS_KEY_ID:
            logger.warning("AWS_ACCESS_KEY_ID not configured")
        if not settings.AWS_SECRET_ACCESS_KEY:
            logger.warning("AWS_SECRET_ACCESS_KEY not configured")
        if not self.bucket_name:
            logger.warning("AWS_S3_BUCKET not configured")
        
        self._initialize_s3_client()
        logger.info(f"S3 service initialization complete. Client ready: {self.s3_client is not None}")
    
    def _initialize_s3_client(self):
        """Initialize S3 client with credentials"""
        try:
            logger.info("Attempting to initialize S3 client...")
            if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
                logger.info("Using explicit AWS credentials")
                self.s3_client = boto3.client(
                    's3',
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                    region_name=settings.AWS_REGION
                )
                logger.info(f"S3 client initialized for region: {settings.AWS_REGION}")
            else:
                # Try to use default credentials (IAM roles, etc.)
                logger.info("No explicit credentials, trying default credentials")
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
            logger.info(f"Starting S3 upload for file: {file.filename}")
            logger.info(f"File size: {file.size if hasattr(file, 'size') else 'Unknown'}")
            logger.info(f"File content type: {file.content_type}")
            
            # Validate file
            self._validate_file(file)
            logger.info("File validation passed")
            
            # Check if S3 client is available
            if not self.s3_client:
                logger.error("S3 client is not available")
                raise HTTPException(
                    status_code=500,
                    detail="S3 service not configured. Please check AWS credentials."
                )
            
            logger.info(f"S3 client is available, checking bucket: {self.bucket_name}")
            logger.info(f"Current working directory: {os.getcwd()}")
            
            # Check if bucket exists
            try:
                logger.info(f"Attempting to check bucket access: {self.bucket_name}")
                self.s3_client.head_bucket(Bucket=self.bucket_name)
                logger.info(f"S3 bucket '{self.bucket_name}' is accessible")
            except ClientError as e:
                error_code = e.response['Error']['Code']
                logger.error(f"S3 bucket check failed with error code: {error_code}")
                logger.error(f"Full error response: {e.response}")
                if error_code == '404':
                    logger.error(f"S3 bucket '{self.bucket_name}' not found")
                    raise HTTPException(
                        status_code=500,
                        detail=f"S3 bucket '{self.bucket_name}' not found. Please check the bucket name and region."
                    )
                elif error_code == '403':
                    logger.error(f"Access denied to S3 bucket '{self.bucket_name}'")
                    raise HTTPException(
                        status_code=500,
                        detail=f"Access denied to S3 bucket '{self.bucket_name}'. Check IAM permissions."
                    )
                else:
                    logger.error(f"S3 bucket error: {str(e)}")
                    raise HTTPException(
                        status_code=500,
                        detail=f"S3 bucket error: {str(e)}"
                    )
            except Exception as e:
                logger.error(f"Unexpected error checking bucket: {str(e)}")
                logger.error(f"Error type: {type(e)}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Unexpected error checking bucket: {str(e)}"
                )
            
            # Generate unique filename
            s3_key = self._generate_unique_filename(file.filename)
            logger.info(f"Generated S3 key: {s3_key}")
            
            # Read file content
            logger.info("Reading file content...")
            file_content = await file.read()
            logger.info(f"Read file content: {len(file_content)} bytes")
            
            # Upload to S3
            logger.info(f"Uploading to S3 bucket: {self.bucket_name}, key: {s3_key}")
            try:
                self.s3_client.put_object(
                    Bucket=self.bucket_name,
                    Key=s3_key,
                    Body=file_content,
                    ContentType=file.content_type,
                    Metadata={
                        'original_filename': file.filename,
                        'uploaded_at': datetime.now().isoformat(),
                        'file_size': str(len(file_content))
                    }
                )
                logger.info("S3 put_object call completed successfully")
            except Exception as put_error:
                logger.error(f"S3 put_object failed: {str(put_error)}")
                logger.error(f"Put error type: {type(put_error)}")
                raise put_error
            
            # Verify the upload was successful
            try:
                logger.info("Verifying S3 upload...")
                self.s3_client.head_object(Bucket=self.bucket_name, Key=s3_key)
                logger.info(f"Upload verification successful - file exists in S3")
            except Exception as verify_error:
                logger.error(f"Upload verification failed: {verify_error}")
                raise HTTPException(
                    status_code=500,
                    detail=f"S3 upload verification failed: {str(verify_error)}"
                )
            
            # Build URLs
            # - Backend URL (preferred, hides AWS details)
            backend_base_url = settings.get_backend_url()
            file_url = f"{backend_base_url}/ats-checker/s3/file/{s3_key}"
            # - Raw S3 object URL (for internal/debugging)
            s3_object_url = f"{settings.s3_bucket_url}/{s3_key}"

            # Generate a presigned URL to access the private object
            presigned_url = None
            try:
                presigned_url = self.s3_client.generate_presigned_url(
                    'get_object',
                    Params={'Bucket': self.bucket_name, 'Key': s3_key},
                    ExpiresIn=3600
                )
                logger.info("Generated presigned URL for uploaded object")
            except Exception as e:
                logger.warning(f"Failed to generate presigned URL: {e}")
            
            logger.info(f"Successfully uploaded {file.filename} to S3: {s3_key}")
            logger.info(f"Backend file URL: {file_url}")
            logger.info(f"S3 object URL: {s3_object_url}")
            
            return {
                "success": True,
                "file_url": file_url,
                "presigned_url": presigned_url,
                "s3_object_url": s3_object_url,
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
            logger.error(f"Error type: {type(e)}")
            logger.error(f"Full error details: {str(e)}")
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
    
    

    async def generate_presigned_url(self, s3_key: str, expires_in: int = 3600) -> Optional[str]:
        """
        Generate a presigned URL for a private S3 object
        
        Args:
            s3_key: S3 object key
            expires_in: Expiration time in seconds
        
        Returns:
            Optional[str]: Presigned URL if generation succeeds, None otherwise
        """
        try:
            if not self.s3_client:
                return None
            return self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': s3_key},
                ExpiresIn=expires_in
            )
        except Exception as e:
            logger.error(f"Failed to generate presigned URL: {e}")
            return None
    
    def is_configured(self) -> bool:
        """
        Check if S3 service is properly configured
        
        Returns:
            bool: True if configured, False otherwise
        """
        # Check if we have all required AWS configuration
        has_credentials = (
            settings.AWS_ACCESS_KEY_ID and 
            settings.AWS_SECRET_ACCESS_KEY and 
            self.bucket_name
        )
        
        # Check if S3 client is initialized
        client_ready = self.s3_client is not None
        
        # Log configuration status
        if not has_credentials:
            logger.warning("S3 not configured: Missing AWS credentials or bucket name")
        elif not client_ready:
            logger.warning("S3 not configured: S3 client initialization failed")
        else:
            logger.info("S3 service is properly configured")
        
        return has_credentials and client_ready 

    async def get_file_bytes(self, s3_key: str) -> Optional[tuple]:
        """
        Fetch an object from S3 and return its bytes and metadata.
        Returns a tuple: (data: bytes, content_type: str, content_length: int, original_filename: str)
        """
        try:
            if not self.s3_client:
                logger.error("S3 client not initialized")
                return None

            logger.info(f"Fetching object bytes from S3: {s3_key}")
            response = self.s3_client.get_object(Bucket=self.bucket_name, Key=s3_key)
            body = response.get('Body')
            data = body.read() if body else b''
            content_type = response.get('ContentType', 'application/octet-stream')
            content_length = response.get('ContentLength', len(data))
            original_filename = response.get('Metadata', {}).get('original_filename', s3_key.split('/')[-1])

            return data, content_type, content_length, original_filename
        except ClientError as e:
            if e.response['Error']['Code'] == 'NoSuchKey':
                logger.warning(f"S3 object not found: {s3_key}")
                return None
            logger.error(f"ClientError fetching S3 object: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error fetching S3 object: {e}")
            return None