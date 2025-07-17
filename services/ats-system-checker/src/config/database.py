"""
Database Configuration for ATS System
MongoDB connection and initialization
"""

import logging
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from src.models.database_models import (
    CVEvaluation,
    QuizSession,
    QuizResult,
    JobPosting,
    Application,
    SystemMetrics,
    EmailNotification
)

logger = logging.getLogger(__name__)

# List of all database models
DATABASE_MODELS = [
    CVEvaluation,
    QuizSession,
    QuizResult,
    JobPosting,
    Application,
    SystemMetrics,
    EmailNotification
]

async def init_database(mongodb_url: str, database_name: str):
    """Initialize MongoDB connection and Beanie ODM"""
    try:
        client = AsyncIOMotorClient(mongodb_url)
        await init_beanie(
            database=client[database_name],
            document_models=DATABASE_MODELS
        )
    except Exception as e:
        logger.error(f" Database connection failed: {e}")
        raise

async def close_database():
    """Close database connections"""
    # Beanie/Motor handles connection cleanup automatically
    pass 