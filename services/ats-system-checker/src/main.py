"""
FastAPI main application for ATS System
Modern, async replacement for the original Flask application
"""

import sys
import os

# Add the ai directory to sys.path so ai/services/cohere_service.py can import models.evaluation_models
ai_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../ai'))
if ai_path not in sys.path:
    sys.path.insert(0, ai_path)
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Configuration and utilities
from src.config import get_settings, init_database, close_database
from src.utils.logging_config import setup_logging, get_logger

# Middleware
from src.middlewares import (
    EXCEPTION_HANDLERS,
    RequestLoggingMiddleware,
    SecurityHeadersMiddleware,
    FileUploadSecurityMiddleware
)

# Services
from src.services.database_service import DatabaseService
from src.services.email_service import EmailService
from src.services.evaluation_service import EvaluationService
from ai.services.cohere_service import CohereService
from ai.services.document_service import DocumentProcessingService

# Routes
from src.routes import api_router

# Initialize settings and logging
settings = get_settings()
setup_logging(settings.LOG_LEVEL, settings.LOG_FILE)
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    try:
        # Initialize database and services
        await init_database(settings.MONGODB_URL, settings.MONGODB_DATABASE)
        
        app.state.database_service = DatabaseService(
            mongodb_url=settings.MONGODB_URL,
            database_name=settings.MONGODB_DATABASE
        )
        await app.state.database_service.connect()
        
        app.state.cohere_service = CohereService(settings.COHERE_API_KEY)
        app.state.document_service = DocumentProcessingService(settings.UPLOAD_FOLDER)
        app.state.email_service = EmailService(
            gmail_user=settings.GMAIL_USER,
            gmail_password=settings.GMAIL_PASSWORD,
            database_service=app.state.database_service
        )
        app.state.evaluation_service = EvaluationService(
            cohere_service=app.state.cohere_service,
            document_service=app.state.document_service,
            email_service=app.state.email_service,
            database_service=app.state.database_service
        )
        
        # Create necessary directories
        os.makedirs(settings.UPLOAD_FOLDER, exist_ok=True)
        os.makedirs(settings.EVALUATIONS_FOLDER, exist_ok=True)
        
        # Print startup success message
        print("FastAPI connected to mongoose db connected")
        
        # Use localhost for user-friendly URLs (regardless of bind host)
        display_host = "localhost" if settings.API_HOST == "0.0.0.0" else settings.API_HOST
        print(f"API Documentation: http://{display_host}:{settings.API_PORT}/docs")
        print(f"Alternative Docs: http://{display_host}:{settings.API_PORT}/redoc")
        print(f"OpenAPI Schema: http://{display_host}:{settings.API_PORT}/openapi.json")
        
    except Exception as e:
        logger.error(f" Failed to initialize application: {e}")
        raise
    
    yield
    
    # Shutdown
    try:
        await app.state.database_service.disconnect()
        await close_database()
    except Exception as e:
        logger.error(f" Error during shutdown: {e}")


def create_app() -> FastAPI:
    """
    Create and configure FastAPI application
    
    Returns:
        FastAPI: Configured application instance
    """
    # Create FastAPI app
    app = FastAPI(
        title="ATS System API",
        version="2.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
        openapi_tags=[
            {
                "name": "health",
                "description": "System health checks and status monitoring"
            },
            {
                "name": "jobs",
                "description": "Job posting management and CV application submission"
            },
            {
                "name": "quiz",
                "description": "Quiz generation and evaluation"
            },
            {
                "name": "statistics",
                "description": "System analytics and metrics"
            },
            {
                "name": "applications",
                "description": "Application management and retrieval"
            }
        ]
    )
    
    # Add middleware (order matters!)
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(FileUploadSecurityMiddleware)
    app.add_middleware(RequestLoggingMiddleware)
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.get_cors_origins(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Add exception handlers
    for exception_type, handler in EXCEPTION_HANDLERS.items():
        app.add_exception_handler(exception_type, handler)
    
    # Include all routes
    app.include_router(api_router)
    
    return app


# Create the app instance
app = create_app()

@app.get("/", tags=["health"], summary="API Status")
def root():
    """
    Get API status and information.
    
    Returns basic API information and links to documentation.
    """
    return {
        "message": " FastAPI connected to mongoose db connected",
        "version": "2.0.0",
        "docs": f"http://{settings.API_HOST}:{settings.API_PORT}/docs",
        "redoc": f"http://{settings.API_HOST}:{settings.API_PORT}/redoc",
        "openapi": f"http://{settings.API_HOST}:{settings.API_PORT}/openapi.json",
        "status": "operational"
    }


@app.get("/test", tags=["health"], summary="Simple Test Endpoint")
def test_endpoint():
    """
    Simple test endpoint to verify API documentation is working.
    
    Returns a simple test message.
    """
    return {"test": "success", "message": "API documentation is working!"}


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "src.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.is_development,
        log_level=settings.LOG_LEVEL.lower(),
        reload_excludes=["venv", ".pytest_cache", "__pycache__", "uploads", "ats_system.log"]
    ) 