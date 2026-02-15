"""
Gateway/HRMS client helpers for cross-service validations
"""

from typing import Optional

import httpx
from fastapi import HTTPException, status

from src.config.settings import get_settings
from src.utils.logging_config import get_logger


logger = get_logger(__name__)
settings = get_settings()


async def verify_user_exists_and_token_valid(user_id: str, access_token: str) -> None:
    """Verify that the user_id exists in API Gateway database and the token is valid.

    Calls API Gateway → HRMS endpoint POST /api/v1/hrms/auth/verify-token with JSON { token }.
    Then calls GET /api/v1/hrms/users/me to get the actual user from the database.
    Ensures the provided user_id exists and is accessible with the given token.
    """

    if not user_id or not access_token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="user_id and access_token are required")

    base_url = settings.API_GATEWAY_BASE_URL.rstrip("/")
    
    # First verify token is valid
    verify_url = f"{base_url}/api/v1/hrms/auth/verify-token"
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            verify_response = await client.post(verify_url, json={"token": access_token})
    except Exception as e:
        logger.error(f"Failed calling API Gateway verify-token: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, 
            detail=f"Could not reach API Gateway at {base_url} for user verification. Please start the API Gateway service first. The user_id {user_id} cannot be validated without the Gateway running."
        )

    if verify_response.status_code != 200:
        detail = None
        try:
            detail = verify_response.json().get("message")
        except Exception:
            detail = verify_response.text
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail or "Invalid or expired access token")

    # Now get the actual user from the database to verify user_id exists
    user_url = f"{base_url}/api/v1/hrms/users/me"
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            user_response = await client.get(user_url, headers={"Authorization": f"Bearer {access_token}"})
    except Exception as e:
        logger.error(f"Failed calling API Gateway get user: {e}")
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Could not reach API Gateway to verify user existence")

    if user_response.status_code != 200:
        detail = None
        try:
            detail = user_response.json().get("message")
        except Exception:
            detail = user_response.text
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail or "Could not retrieve user from API Gateway database")

    try:
        user_data = user_response.json().get("user", {})
        db_user_id = str(user_data.get("id")) if user_data.get("id") is not None else None
    except Exception as e:
        logger.error(f"Unexpected user response shape: {e}")
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Unexpected response from API Gateway while retrieving user")

    if not db_user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found in API Gateway database")

    # This is the critical check: provided user_id must exist in Gateway DB
    if db_user_id != user_id:
        logger.warning(f"User ID mismatch: provided={user_id}, database={db_user_id}")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"User ID {user_id} does not exist in API Gateway database")

    logger.info(f"User {user_id} verified successfully in API Gateway database")


