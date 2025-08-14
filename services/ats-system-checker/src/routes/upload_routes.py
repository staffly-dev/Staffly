"""
Upload Routes for ATS System
File upload endpoints for S3 integration
"""

from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Request
from fastapi.responses import JSONResponse

from src.utils.dependencies import get_upload_controller
from src.utils.logging_config import get_logger

logger = get_logger(__name__)
router = APIRouter(tags=["upload"])


@router.post("/upload", summary="Upload File to S3")
async def upload_file(
    file: UploadFile = File(..., description="File to upload (PDF or DOCX)"),
    controller = Depends(get_upload_controller)
):
    """
    Upload a file to AWS S3 bucket.
    
    - **file**: PDF or DOCX file to upload (max 16MB)
    
    Returns a JSON response with:
    - **success**: Upload success status
    - **file_url**: Direct URL to access the uploaded file
    - **s3_key**: S3 object key for future reference
    - **original_filename**: Original filename
    - **file_size**: File size in bytes
    - **content_type**: MIME type of the file
    - **uploaded_at**: Upload timestamp
    
    The uploaded file will be publicly accessible via the returned URL.
    """
    result = await controller.upload_file(file)
    return JSONResponse(status_code=200, content=result)


@router.get("/upload/status", summary="Check S3 Service Status")
async def check_s3_status(
    controller = Depends(get_upload_controller)
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


@router.get("/debug/s3", summary="Debug S3 Service")
async def debug_s3_service(
    controller = Depends(get_upload_controller)
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


@router.delete("/upload/{s3_key}", summary="Delete File from S3")
async def delete_file(
    s3_key: str,
    controller = Depends(get_upload_controller)
):
    """
    Delete a file from S3 bucket.
    
    - **s3_key**: S3 object key of the file to delete
    
    Returns confirmation of deletion.
    """
    result = await controller.delete_file(s3_key)
    return JSONResponse(status_code=200, content=result)


@router.get("/upload/url/{s3_key}", summary="Get File URL from S3")
async def get_file_url(
    s3_key: str,
    controller = Depends(get_upload_controller)
):
    """
    Get the public URL for a file in S3.
    
    - **s3_key**: S3 object key of the file
    
    Returns the public URL if the file exists.
    """
    result = await controller.get_file_url(s3_key)
    return JSONResponse(status_code=200, content=result) 