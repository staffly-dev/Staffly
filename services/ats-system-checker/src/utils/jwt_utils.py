"""
JWT Utility Functions for ATS System
Handles JWT token validation and decoding from API Gateway
"""

import jwt
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from src.config.settings import get_settings
from src.utils.logging_config import get_logger

logger = get_logger(__name__)


class JWTUtils:
    """Utility class for JWT operations"""
    
    def __init__(self):
        """Initialize JWT utilities with settings"""
        self.settings = get_settings()
    
    def decode_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Decode and validate JWT token from API Gateway
        
        Args:
            token: JWT token string
            
        Returns:
            Decoded token payload or None if invalid
            
        Raises:
            HTTPException: If token is invalid or expired
        """
        try:
            # For API Gateway tokens, we don't need to verify signature
            # as they come from a trusted source
            decoded = jwt.decode(
                token,
                options={"verify_signature": False},
                algorithms=["HS256"]
            )
            
            logger.info(f"Successfully decoded JWT token for user: {decoded.get('userId', 'unknown')}")
            return decoded
            
        except jwt.ExpiredSignatureError:
            logger.warning("JWT token has expired")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid JWT token: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        except Exception as e:
            logger.error(f"Error decoding JWT token: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token validation failed"
            )
    
    def extract_user_info(self, token: str) -> Dict[str, Any]:
        """
        Extract user information from JWT token
        
        Args:
            token: JWT token string
            
        Returns:
            Dictionary containing user information
        """
        decoded = self.decode_token(token)
        
        if not decoded:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not extract user information from token"
            )
        
        # Extract user information from API Gateway token format
        user_info = {
            "user_id": decoded.get("userId"),
            "aud": decoded.get("aud", []),
            "iat": decoded.get("iat"),
            "exp": decoded.get("exp")
        }
        
        # Validate required fields
        if not user_info["user_id"]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing required user information"
            )
        
        return user_info


# Global instance
jwt_utils = JWTUtils()

