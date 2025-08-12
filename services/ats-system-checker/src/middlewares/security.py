"""
Security Middleware for ATS System
Handles security headers and basic security measures
"""

from fastapi import Request, Response, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from starlette.middleware.base import BaseHTTPMiddleware
import base64
import secrets

from ..utils.logging_config import get_logger
from ..config.settings import get_settings

logger = get_logger(__name__)
settings = get_settings()


class DocsAuthenticationMiddleware(BaseHTTPMiddleware):
    """Middleware for protecting API documentation endpoints with HTTP Basic Authentication"""
    
    def __init__(self, app):
        super().__init__(app)
        self.docs_endpoints = ["/docs", "/redoc", "/openapi.json"]
        self.security = HTTPBasic()
    
    async def dispatch(self, request: Request, call_next) -> Response:
        """
        Check authentication for docs endpoints
        
        Args:
            request: FastAPI request object
            call_next: Next middleware/endpoint in chain
            
        Returns:
            Response: HTTP response
        """
        # Check if this is a docs endpoint
        is_docs_endpoint = any(
            endpoint in str(request.url.path) for endpoint in self.docs_endpoints
        )
        
        if is_docs_endpoint and settings.DOCS_AUTH_ENABLED:
            # Extract credentials from Authorization header
            auth_header = request.headers.get("authorization")
            
            if not auth_header or not auth_header.startswith("Basic "):
                # Return 401 with WWW-Authenticate header to prompt for credentials
                response = Response(
                    content="Authentication required",
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    media_type="text/plain"
                )
                response.headers["WWW-Authenticate"] = 'Basic realm="API Documentation"'
                return response
            
            try:
                # Decode credentials
                credentials = base64.b64decode(auth_header[6:]).decode("utf-8")
                username, password = credentials.split(":", 1)
                
                # Check credentials
                if (username == settings.DOCS_USERNAME and 
                    password == settings.DOCS_PASSWORD):
                    # Authentication successful, continue
                    logger.info(f"Successful docs access by user: {username}")
                else:
                    # Invalid credentials
                    logger.warning(f"Failed docs access attempt with username: {username}")
                    response = Response(
                        content="Invalid credentials",
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        media_type="text/plain"
                    )
                    response.headers["WWW-Authenticate"] = 'Basic realm="API Documentation"'
                    return response
                    
            except Exception as e:
                logger.error(f"Error processing authentication: {e}")
                response = Response(
                    content="Authentication error",
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    media_type="text/plain"
                )
                response.headers["WWW-Authenticate"] = 'Basic realm="API Documentation"'
                return response
        
        response = await call_next(request)
        return response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware for adding security headers to responses"""
    
    def __init__(self, app):
        super().__init__(app)
    
    async def dispatch(self, request: Request, call_next) -> Response:
        """
        Add security headers to response
        
        Args:
            request: FastAPI request object
            call_next: Next middleware/endpoint in chain
            
        Returns:
            Response: HTTP response with security headers
        """
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Add server identification
        response.headers["Server"] = "ATS-System"
        
        # Force HTTPS in production if configured
        if settings.security_headers_enabled:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        # Secure cookies if enabled
        if settings.secure_cookies_enabled:
            # This will be applied to cookies set by the application
            pass  # Cookie security is handled at the cookie setting level
        
        # Skip restrictive headers for docs endpoints to allow Swagger UI to load
        docs_endpoints = ["/docs", "/redoc", "/openapi.json"]
        is_docs_endpoint = any(endpoint in str(request.url.path) for endpoint in docs_endpoints)
        
        if not is_docs_endpoint:
            # Only add restrictive headers for non-docs endpoints
            response.headers["X-Frame-Options"] = "DENY"
            
            # Content Security Policy for development
            if settings.is_development:
                csp = (
                    "default-src 'self'; "
                    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
                    "style-src 'self' 'unsafe-inline'; "
                    "img-src 'self' data:; "
                    "font-src 'self'; "
                    "connect-src 'self'"
                )
                response.headers["Content-Security-Policy"] = csp
        else:
            # For docs endpoints, use more permissive headers
            response.headers["X-Frame-Options"] = "SAMEORIGIN"
        
        return response


class FileUploadSecurityMiddleware(BaseHTTPMiddleware):
    """Middleware for securing file upload endpoints"""
    
    def __init__(self, app):
        super().__init__(app)
        self.upload_endpoints = ["/api/jobs/", "/apply/"]  # Endpoints that handle file uploads
    
    async def dispatch(self, request: Request, call_next) -> Response:
        """
        Apply file upload security measures
        
        Args:
            request: FastAPI request object
            call_next: Next middleware/endpoint in chain
            
        Returns:
            Response: HTTP response
        """
        # Check if this is a file upload endpoint
        is_upload_endpoint = any(
            endpoint in str(request.url.path) for endpoint in self.upload_endpoints
        )
        
        if is_upload_endpoint and request.method == "POST":
            # Check content length
            content_length = request.headers.get("content-length")
            if content_length:
                content_length = int(content_length)
                if content_length > settings.MAX_FILE_SIZE:
                    from fastapi.responses import JSONResponse
                    return JSONResponse(
                        status_code=413,
                        content={
                            "success": False,
                            "error": True,
                            "message": f"File size exceeds maximum allowed size of {settings.MAX_FILE_SIZE} bytes"
                        }
                    )
            
            # Log file upload attempt
            logger.info(f" File upload attempt from {request.client.host if request.client else 'unknown'}")
        
        response = await call_next(request)
        return response 