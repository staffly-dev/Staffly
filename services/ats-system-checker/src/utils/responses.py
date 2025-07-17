"""
Response Utilities for ATS System
Standardized API response formats
"""

from typing import Any, Dict, Optional
from fastapi.responses import JSONResponse
from src.models.evaluation_models import APIResponse


def success_response(
    message: str = "Success",
    data: Any = None,
    status_code: int = 200
) -> APIResponse:
    """
    Create a standardized success response
    
    Args:
        message: Success message
        data: Response data
        status_code: HTTP status code
        
    Returns:
        APIResponse: Standardized success response
    """
    return APIResponse(
        success=True,
        message=message,
        data=data
    )


def error_response(
    message: str = "An error occurred",
    details: Optional[str] = None,
    status_code: int = 500
) -> JSONResponse:
    """
    Create a standardized error response
    
    Args:
        message: Error message
        details: Additional error details
        status_code: HTTP status code
        
    Returns:
        JSONResponse: Standardized error response
    """
    content = {
        "success": False,
        "message": message,
        "error": True
    }
    
    if details:
        content["details"] = details
    
    return JSONResponse(
        status_code=status_code,
        content=content
    )


def validation_error_response(
    message: str = "Validation failed",
    errors: Dict[str, Any] = None
) -> JSONResponse:
    """
    Create a validation error response
    
    Args:
        message: Error message
        errors: Validation errors dictionary
        
    Returns:
        JSONResponse: Validation error response
    """
    content = {
        "success": False,
        "message": message,
        "error": True,
        "validation_errors": errors or {}
    }
    
    return JSONResponse(
        status_code=422,
        content=content
    )


def not_found_response(
    resource: str = "Resource"
) -> JSONResponse:
    """
    Create a not found error response
    
    Args:
        resource: Name of the resource that was not found
        
    Returns:
        JSONResponse: Not found response
    """
    return JSONResponse(
        status_code=404,
        content={
            "success": False,
            "message": f"{resource} not found",
            "error": True
        }
    ) 