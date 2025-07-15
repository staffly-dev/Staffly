"""
Error Handling Middleware for ATS System
Centralized error handling and exception management
"""

import logging
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from pydantic import ValidationError

from ..utils.logging_config import get_logger
from ..config.settings import get_settings

logger = get_logger(__name__)
settings = get_settings()


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """
    Handle HTTP exceptions
    
    Args:
        request: FastAPI request object
        exc: HTTP exception
        
    Returns:
        JSONResponse: Error response
    """
    logger.warning(f"HTTP {exc.status_code}: {exc.detail} - Path: {request.url.path}")
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": True,
            "message": exc.detail,
            "status_code": exc.status_code
        }
    )


async def starlette_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """
    Handle Starlette HTTP exceptions
    
    Args:
        request: FastAPI request object
        exc: Starlette HTTP exception
        
    Returns:
        JSONResponse: Error response
    """
    logger.warning(f"Starlette HTTP {exc.status_code}: {exc.detail} - Path: {request.url.path}")
    
    # Custom messages for common status codes
    error_messages = {
        404: "The requested resource was not found",
        405: "Method not allowed for this endpoint",
        413: f"File size exceeds maximum allowed size of {settings.MAX_FILE_SIZE} bytes",
        415: "Unsupported media type"
    }
    
    message = error_messages.get(exc.status_code, exc.detail)
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": True,
            "message": message,
            "status_code": exc.status_code
        }
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """
    Handle request validation errors
    
    Args:
        request: FastAPI request object
        exc: Validation error
        
    Returns:
        JSONResponse: Validation error response
    """
    logger.warning(f"Validation error on {request.url.path}: {exc.errors()}")
    
    # Format validation errors
    formatted_errors = []
    for error in exc.errors():
        field = " -> ".join(str(loc) for loc in error["loc"])
        formatted_errors.append({
            "field": field,
            "message": error["msg"],
            "type": error["type"]
        })
    
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": True,
            "message": "Validation failed",
            "validation_errors": formatted_errors
        }
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handle general unhandled exceptions
    
    Args:
        request: FastAPI request object
        exc: General exception
        
    Returns:
        JSONResponse: Error response
    """
    logger.error(f"Unhandled exception on {request.url.path}: {str(exc)}", exc_info=True)
    
    # Don't expose internal errors in production
    if settings.is_production:
        message = "An internal server error occurred"
        details = None
    else:
        message = f"Internal server error: {str(exc)}"
        details = str(exc)
    
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": True,
            "message": message,
            "details": details,
            "status_code": 500
        }
    )


# Exception handler mapping
EXCEPTION_HANDLERS = {
    HTTPException: http_exception_handler,
    StarletteHTTPException: starlette_exception_handler,
    RequestValidationError: validation_exception_handler,
    Exception: general_exception_handler
} 