"""
Health Controller for ATS System
Handles system health checks and status monitoring
"""

from typing import Dict, Any
from src.utils.logging_config import get_logger
from src.services.database_service import DatabaseService
from src.models.evaluation_models import APIResponse

logger = get_logger(__name__)


class HealthController:
    """Controller for health check operations"""
    
    def __init__(self, database_service: DatabaseService, cohere_service, email_service):
        """
        Initialize health controller
        
        Args:
            database_service: Database service instance
            cohere_service: Cohere AI service instance
            email_service: Email service instance
        """
        self.database_service = database_service
        self.cohere_service = cohere_service
        self.email_service = email_service
    
    async def health_check(self) -> APIResponse:
        """
        Perform comprehensive health check
        
        Returns:
            APIResponse: Health status information
        """
        try:
            # Check database connectivity
            db_healthy = await self.database_service.health_check()
            
            # Check AI service (handle case when cohere_service is None)
            ai_healthy = False
            if self.cohere_service is not None and hasattr(self.cohere_service, 'client'):
                try:
                    ai_healthy = self.cohere_service.client is not None
                except Exception:
                    ai_healthy = False
            else:
                # Cohere service not available - mark as degraded but not unhealthy
                ai_healthy = False
            
            # Check email service (test connection method)
            email_healthy = True
            try:
                if hasattr(self.email_service, 'test_connection'):
                    email_healthy = self.email_service.test_connection()
                elif hasattr(self.email_service, 'gmail_user'):
                    email_healthy = hasattr(self.email_service, 'gmail_user')
            except Exception:
                email_healthy = False
            
            # Determine overall health status
            # Database is required, AI and email are optional
            if db_healthy:
                if ai_healthy and email_healthy:
                    status = "healthy"
                else:
                    # Database is healthy but some optional services are not - system is degraded
                    status = "degraded"
            else:
                # Database is not healthy - system is unhealthy
                status = "unhealthy"
            
            services_status = {
                "database": db_healthy,
                "cohere": ai_healthy,
                "email": email_healthy
            }
            
            message = "All systems operational" if status == "healthy" else "System operational with some issues"
            
            return APIResponse(
                success=True,
                message=message,
                data={
                    "status": status,
                    "services": services_status
                }
            )
            
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return APIResponse(
                success=True,  # Health endpoint itself succeeded
                message=f"Health check failed: {e}",
                data={
                    "status": "unhealthy",
                    "services": {
                        "database": False,
                        "cohere": False,
                        "email": False
                    }
                }
            ) 