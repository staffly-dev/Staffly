"""
FastAPI main application for ATS System
Modern, async replacement for the original Flask application
"""

import sys
import os
from datetime import datetime

# Add the parent directory to sys.path for imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Configuration and utilities
from src.config import get_settings, init_database, close_database
from src.utils.logging_config import setup_logging, get_logger

# Middleware
from src.middlewares import (
    EXCEPTION_HANDLERS,
    RequestLoggingMiddleware,
    EnhancedSecurityMiddleware,
    FileUploadSecurityMiddleware,
    DocsAuthenticationMiddleware
)

# Services
from src.services.database_service import DatabaseService
from src.services.email_service import EmailService
from src.services.evaluation_service import EvaluationService


# Routes
from src.routes import api_router
from src.routes.health_routes import router as health_router
from src.routes.upload_routes import router as upload_router

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
        
        app.state.email_service = EmailService(
            gmail_user=settings.GMAIL_USER,
            gmail_password=settings.GMAIL_PASSWORD,
            database_service=app.state.database_service,
            frontend_url=settings.FRONTEND_URL
        )
        app.state.evaluation_service = EvaluationService(
            ai_service_url=settings.AI_SERVICE_URL,
            email_service=app.state.email_service,
            database_service=app.state.database_service
        )
        
        # Create necessary directories
        os.makedirs(settings.UPLOAD_FOLDER, exist_ok=True)
        os.makedirs(settings.EVALUATIONS_FOLDER, exist_ok=True)
        
        # Print startup success message
        print("FastAPI connected to mongoose db connected")
        
        # Display startup information using environment-based configuration
        _display_startup_info(settings)
        
    except Exception as e:
        logger.error(f" Failed to initialize application: {e}")
        raise
    
    yield
    
    # Shutdown
    try:
        await app.state.database_service.disconnect()
        await close_database()
        logger.info("Application shutdown complete")
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")


def _display_startup_info(settings):
    """Display startup information using environment configuration"""
    # Use environment-based host display
    display_host = "localhost" if settings.API_HOST == "0.0.0.0" else settings.API_HOST
    
    print(f"ATS System Backend Started Successfully")
    print(f"Environment: {settings.ENV.upper()}")
    print(f"API Host: {settings.API_HOST}:{settings.API_PORT}")
    print(f"API Documentation: http://{display_host}:{settings.API_PORT}/docs (Authentication Required)")
    print(f"Alternative Docs: http://{display_host}:{settings.API_PORT}/redoc (Authentication Required)")
    print(f"OpenAPI Schema: http://{display_host}:{settings.API_PORT}/openapi.json (Authentication Required)")
    
    if settings.DOCS_AUTH_ENABLED:
        print(f"Default credentials: {settings.DOCS_USERNAME}:{settings.DOCS_PASSWORD}")
    
    # Display service URLs
    if settings.FRONTEND_URL:
        print(f" Frontend URL: {settings.FRONTEND_URL}")
    
    if settings.AI_SERVICE_URL:
        print(f"AI Service URL: {settings.AI_SERVICE_URL}")
    
    if settings.UPLOADS_BASE_URL:
        print(f"Uploads Base URL: {settings.UPLOADS_BASE_URL}")
    
    # Security information
    if settings.is_production:
        print("Production Mode: Enhanced security enabled")
        if settings.FORCE_HTTPS:
            print("HTTPS enforcement enabled")
    else:
        print("Development Mode: Relaxed security for development")
    
    print("=" * 60)


# Create FastAPI app
app = FastAPI(
    title="ATS System Backend",
    description="Modern FastAPI backend for ATS (Applicant Tracking System)",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.DOCS_AUTH_ENABLED else None,
    redoc_url="/redoc" if settings.DOCS_AUTH_ENABLED else None,
    openapi_url="/openapi.json" if settings.DOCS_AUTH_ENABLED else None
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

# Add security middleware (order matters - most restrictive first)
app.add_middleware(EnhancedSecurityMiddleware)
app.add_middleware(FileUploadSecurityMiddleware)
app.add_middleware(DocsAuthenticationMiddleware)

# Add request logging middleware
app.add_middleware(RequestLoggingMiddleware)

# Add exception handlers
for exception_class, handler in EXCEPTION_HANDLERS.items():
    app.add_exception_handler(exception_class, handler)

# Create necessary directories before mounting
os.makedirs(settings.UPLOAD_FOLDER, exist_ok=True)
os.makedirs(settings.EVALUATIONS_FOLDER, exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_FOLDER), name="uploads")
app.mount("/evaluations", StaticFiles(directory=settings.EVALUATIONS_FOLDER), name="evaluations")

# Root endpoint
@app.get("", tags=["Root"])
async def root():
    """Root endpoint with service information"""
    return {
        "message": "ATS System Backend",
        "version": "2.0.0",
        "description": "Modern FastAPI backend for ATS (Applicant Tracking System)",
        "environment": settings.ENV,
        "status": "running",
        "docs": f"/docs" if settings.DOCS_AUTH_ENABLED else "disabled",
        "timestamp": datetime.now().isoformat()
    }

# Include routers
app.include_router(health_router, prefix="/health", tags=["health"])
app.include_router(api_router, prefix="/api")
app.include_router(upload_router, prefix="/upload", tags=["upload"])

# Add debug endpoint
@app.get("/debug/s3", tags=["debug"])
async def debug_s3():
    """Debug S3 service configuration"""
    from src.utils.dependencies import get_upload_controller
    controller = await get_upload_controller()
    return await controller.check_s3_status()


if __name__ == "__main__":
    import uvicorn
    
    # Run the application
    uvicorn.run(
        "src.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
        reload_excludes=["venv", ".pytest_cache", "__pycache__", "uploads", "ats_system.log"]
    ) 