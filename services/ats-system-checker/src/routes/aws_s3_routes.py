"""
Upload Routes for ATS System
File upload endpoints for S3 integration
"""

from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Request
from fastapi.responses import JSONResponse

from src.utils.dependencies import get_aws_s3_controller
from src.utils.logging_config import get_logger

logger = get_logger(__name__)
router = APIRouter(tags=["aws-s3"])


@router.post("/s3/upload", summary="Upload File to S3")
async def upload_file(
    file: UploadFile = File(..., description="File to upload (PDF or DOCX)"),
    controller = Depends(get_aws_s3_controller)
):
    """
    Upload a file to AWS S3 bucket.
    
    - **file**: PDF or DOCX file to upload (max 16MB)
    
    Returns a JSON response with:
    - **success**: Upload success status
    - **file_url**: Clean backend URL to stream the file (preferred)
    - **presigned_url**: Time-limited URL to access the uploaded file
    - **s3_object_url**: Direct S3 object URL (may not be publicly accessible)
    - **s3_key**: S3 object key for future reference
    - **original_filename**: Original filename
    - **file_size**: File size in bytes
    - **content_type**: MIME type of the file
    - **uploaded_at**: Upload timestamp
    
    Note: Objects are private by default. Use the returned presigned URL or generate one later via the presign endpoint.
    """
    result = await controller.upload_file(file)
    return JSONResponse(status_code=200, content=result)


@router.get("/s3/status", summary="Check S3 Service Status")
async def check_s3_status(
    controller = Depends(get_aws_s3_controller)
):
    """
    Check the status of the S3 service configuration.
    
    Returns information about:
    - **configured**: Whether S3 service is properly configured
    - **bucket_name**: S3 bucket name
    - **region**: AWS region
    - **bucket_url**: S3 bucket URL
    - **credentials_configured**: Whether AWS credentials are set
    """
    status = await controller.check_s3_status()
    return JSONResponse(status_code=200, content=status)


@router.get("/s3/debug", summary="Debug S3 Service")
async def debug_s3_service(
    controller = Depends(get_aws_s3_controller)
):
    """
    Debug S3 service configuration and status.
    
    Returns detailed debugging information about:
    - S3 service configuration
    - AWS credentials status
    - Bucket configuration
    - Service connectivity
    """
    debug_info = await controller.check_s3_status()
    return JSONResponse(status_code=200, content=debug_info)


@router.delete("/s3/{s3_key:path}", summary="Delete File from S3")
async def delete_file(
    s3_key: str,
    controller = Depends(get_aws_s3_controller)
):
    """
    Delete a file from S3 bucket.
    
    - **s3_key**: S3 object key of the file to delete. Accepts keys with folder prefixes; if a bare filename is provided, the service will attempt to resolve it.
    
    Returns confirmation of deletion.
    """
    result = await controller.delete_file(s3_key)
    return JSONResponse(status_code=200, content=result)



@router.get("/s3/presign/{s3_key:path}", summary="Generate Presigned URL for S3 Object")
async def get_presigned_url(
    s3_key: str,
    expires_in: int = 3600,
    controller = Depends(get_aws_s3_controller)
):
    """
    Generate a presigned URL for a private S3 object.
    
    - **s3_key**: S3 object key (accepts keys with slashes)
    - **expires_in**: Expiration time in seconds (default: 3600)
    """
    result = await controller.get_presigned_url(s3_key, expires_in)
    return JSONResponse(status_code=200, content=result)


@router.get("/s3/file/{s3_key:path}", summary="Stream S3 file via backend")
async def stream_file(
    s3_key: str,
    controller = Depends(get_aws_s3_controller)
):
    """
    Stream a file through the backend without exposing AWS query params.
    """
    return await controller.download_file(s3_key)