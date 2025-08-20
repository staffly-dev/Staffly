"""
Statistics Controller for ATS System
Handles system analytics and metrics
"""

from src.utils.logging_config import get_logger
from src.models.api_models import StatisticsResponse
from src.services.database_service import DatabaseService

logger = get_logger(__name__)


class StatisticsController:
    """Controller for system statistics operations"""
    
    def __init__(self, database_service: DatabaseService):
        """
        Initialize statistics controller
        
        Args:
            database_service: Database service instance
        """
        self.database_service = database_service
    
    async def get_statistics(self) -> StatisticsResponse:
        """
        Get comprehensive system statistics
        
        Returns:
            StatisticsResponse: System statistics and analytics
        """
        try:
            logger.info(" Retrieving system statistics")
            
            # Get evaluation statistics
            eval_stats = await self.database_service.get_evaluation_statistics()
            
            # Get quiz statistics
            quiz_stats = await self.database_service.get_quiz_statistics()
            
            # Combine statistics
            return StatisticsResponse(
                total_applications=eval_stats.get("total_evaluations", 0),
                total_evaluations=eval_stats.get("total_evaluations", 0),
                acceptance_rate=eval_stats.get("acceptance_rate", 0.0),
                average_score=eval_stats.get("average_score", 0.0),
                quiz_pass_rate=quiz_stats.get("quiz_pass_rate"),
                daily_stats=eval_stats.get("daily_counts", {})
            )
            
        except Exception as e:
            logger.error(f" Error retrieving statistics: {e}")
            # Return empty statistics instead of raising exception
            return StatisticsResponse(
                total_applications=0,
                total_evaluations=0,
                acceptance_rate=0.0,
                average_score=0.0,
                quiz_pass_rate=0.0,
                daily_stats={}
            )
    
    async def get_user_statistics(self, user_id: str, created_by: str) -> "UserStatisticsResponse":
        """
        Get user-specific system statistics
        
        Args:
            user_id: User ID from API Gateway
            created_by: User who created the records
            
        Returns:
            UserStatisticsResponse: User-specific statistics and analytics
        """
        try:
            logger.info(f" Retrieving user statistics for user_id: {user_id}, created_by: {created_by}")
            
            # Get user-specific evaluation statistics
            eval_stats = await self.database_service.get_user_evaluation_statistics(user_id, created_by)
            
            # Get user-specific quiz statistics
            quiz_stats = await self.database_service.get_user_quiz_statistics(user_id, created_by)
            
            # Import here to avoid circular imports
            from src.models.api_models import UserStatisticsResponse
            
            # Combine statistics
            return UserStatisticsResponse(
                user_id=user_id,
                created_by=created_by,
                total_applications=eval_stats.get("total_evaluations", 0),
                total_evaluations=eval_stats.get("total_evaluations", 0),
                acceptance_rate=eval_stats.get("acceptance_rate", 0.0),
                average_score=eval_stats.get("average_score", 0.0),
                quiz_pass_rate=quiz_stats.get("quiz_pass_rate", 0.0),
                daily_stats=eval_stats.get("daily_counts", {}),
                last_activity=eval_stats.get("last_activity")
            )
            
        except Exception as e:
            logger.error(f" Error retrieving user statistics: {e}")
            # Return empty statistics instead of raising exception
            from src.models.api_models import UserStatisticsResponse
            return UserStatisticsResponse(
                user_id=user_id,
                created_by=created_by,
                total_applications=0,
                total_evaluations=0,
                acceptance_rate=0.0,
                average_score=0.0,
                quiz_pass_rate=0.0,
                daily_stats={},
                last_activity=None
            ) 