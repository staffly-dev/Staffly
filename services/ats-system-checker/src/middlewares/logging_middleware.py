"""
Request Logging Middleware for ATS System
Logs incoming requests and responses for monitoring and debugging
"""

import time
import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from ..utils.logging_config import get_logger

logger = get_logger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging HTTP requests and responses"""
    
    def __init__(self, app):
        super().__init__(app)
    
    async def dispatch(self, request: Request, call_next) -> Response:
        """
        Process request and log details
        
        Args:
            request: FastAPI request object
            call_next: Next middleware/endpoint in chain
            
        Returns:
            Response: HTTP response
        """
        # Start timing
        start_time = time.time()
        
        # Extract request information
        method = request.method
        url = str(request.url)
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        
        # Log incoming request
        logger.info(f" {method} {url} - IP: {client_ip}")
        
        # Process request
        try:
            response = await call_next(request)
            
            # Calculate processing time
            process_time = time.time() - start_time
            
            # Log response
            status_code = response.status_code
            status_emoji = "" if 200 <= status_code < 400 else "" if 400 <= status_code < 500 else ""
            
            logger.info(
                f"{status_emoji} {method} {url} - {status_code} - {process_time:.3f}s"
            )
            
            # Add custom headers
            response.headers["X-Process-Time"] = str(process_time)
            
            return response
            
        except Exception as e:
            # Log error
            process_time = time.time() - start_time
            logger.error(f" {method} {url} - ERROR - {process_time:.3f}s - {str(e)}")
            raise 