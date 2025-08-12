"""
Authentication Middleware for AI Service
Protects API documentation endpoints with HTTP Basic Authentication
"""

from fastapi import Request, Response, status
from starlette.middleware.base import BaseHTTPMiddleware
import base64
import os
import logging

logger = logging.getLogger(__name__)


class DocsAuthenticationMiddleware(BaseHTTPMiddleware):
    """Middleware for protecting API documentation endpoints with HTTP Basic Authentication"""
    
    def __init__(self, app):
        super().__init__(app)
        self.docs_endpoints = ["/docs", "/redoc", "/openapi.json"]
    
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
        
        # Get authentication settings from environment
        auth_enabled = os.getenv("DOCS_AUTH_ENABLED", "true").lower() == "true"
        username = os.getenv("DOCS_USERNAME", "admin")
        password = os.getenv("DOCS_PASSWORD", "admin123")
        
        if is_docs_endpoint and auth_enabled:
            # Extract credentials from Authorization header
            auth_header = request.headers.get("authorization")
            
            if not auth_header or not auth_header.startswith("Basic "):
                # Return 401 with WWW-Authenticate header to prompt for credentials
                response = Response(
                    content="Authentication required",
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    media_type="text/plain"
                )
                response.headers["WWW-Authenticate"] = 'Basic realm="AI Service Documentation"'
                return response
            
            try:
                # Decode credentials
                credentials = base64.b64decode(auth_header[6:]).decode("utf-8")
                provided_username, provided_password = credentials.split(":", 1)
                
                # Check credentials
                if (provided_username == username and 
                    provided_password == password):
                    # Authentication successful, continue
                    logger.info(f"Successful docs access by user: {provided_username}")
                else:
                    # Invalid credentials
                    logger.warning(f"Failed docs access attempt with username: {provided_username}")
                    response = Response(
                        content="Invalid credentials",
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        media_type="text/plain"
                    )
                    response.headers["WWW-Authenticate"] = 'Basic realm="AI Service Documentation"'
                    return response
                    
            except Exception as e:
                logger.error(f"Error processing authentication: {e}")
                response = Response(
                    content="Authentication error",
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    media_type="text/plain"
                )
                response.headers["WWW-Authenticate"] = 'Basic realm="AI Service Documentation"'
                return response
        
        response = await call_next(request)
        return response
