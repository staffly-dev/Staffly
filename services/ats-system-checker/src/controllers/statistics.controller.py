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