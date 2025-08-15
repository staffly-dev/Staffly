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
from src.services.s3_service import S3Service


# Routes
from src.routes.health_routes import router as health_router
from src.routes.aws_s3_routes import router as aws_s3_router
from src.routes.jobs_routes import router as jobs_router
from src.routes.quiz_routes import router as quiz_router
from src.routes.statistics_routes import router as statistics_router
from src.routes.applications_routes import router as applications_router

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
        
        # Initialize S3 service once and reuse it
        app.state.s3_service = S3Service()
        
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
app.include_router(health_router, prefix="/ats-checker")
app.include_router(jobs_router, prefix="/ats-checker")
app.include_router(quiz_router, prefix="/ats-checker")
app.include_router(statistics_router, prefix="/ats-checker")
app.include_router(applications_router, prefix="/ats-checker")
app.include_router(aws_s3_router, prefix="/ats-checker")

# Add debug endpoints (must be before catch-all route)
# Note: S3 debug endpoints are now handled by aws_s3_router at /ats-checker/s3/debug

# Add debug endpoint for database
@app.get("/ats-checker/debug/db", tags=["debug"])
async def debug_database():
    """Debug database connection and status"""
    try:
        db_service = app.state.database_service
        health_status = await db_service.health_check()
        
        # Try to get some basic counts
        from src.models.database_models import JobPosting, Application, CVEvaluation
        
        job_count = await JobPosting.count()
        application_count = await Application.count()
        evaluation_count = await CVEvaluation.count()
        
        return {
            "database_connected": health_status,
            "mongodb_url": db_service.mongodb_url,
            "database_name": db_service.database_name,
            "counts": {
                "job_postings": job_count,
                "applications": application_count,
                "cv_evaluations": evaluation_count
            },
            "status": "healthy" if health_status else "unhealthy"
        }
    except Exception as e:
        return {
            "error": str(e),
            "status": "error"
        }

# Add sample data creation endpoint
@app.post("/ats-checker/debug/sample-data", tags=["debug"])
async def create_sample_data():
    """Create sample job posting for testing"""
    try:
        from src.models.database_models import JobPosting
        
        # Check if sample data already exists
        existing_jobs = await JobPosting.find_all().to_list()
        if existing_jobs:
            return {
                "message": "Sample data already exists",
                "existing_jobs": len(existing_jobs)
            }
        
        # Use the database service to create the job posting properly
        db_service = app.state.database_service
        sample_job = await db_service.create_job_posting(
            title="Software Engineer",
            description="We are looking for a talented software engineer to join our team.",
            required_skills=["Python", "JavaScript", "React", "Node.js"],
            additional_details="This is a full-time position with competitive salary and benefits.",
            hr_email="hr@example.com",
            hr_name="HR Manager",
            evaluation_threshold=70,
            quiz_required=True,
            quiz_pass_threshold=7
        )
        
        return {
            "message": "Sample job posting created successfully",
            "job_id": sample_job.job_id,
            "title": sample_job.title
        }
    except Exception as e:
        return {
            "error": str(e),
            "status": "error"
        }

# Catch-all route for better error handling (must be last)
@app.get("/ats-checker/{full_path:path}", tags=["Catch-All"])
async def catch_all(full_path: str):
    """Catch-all route for undefined paths"""
    return {
        "error": "Endpoint not found",
        "message": f"The path '/{full_path}' does not exist",
        "available_endpoints": {
            "root": "/",
            "health": "/health",
            "api": "/ats-checker",
            "docs": "/docs" if settings.DOCS_AUTH_ENABLED else "disabled",
            "upload": "/ats-checker/s3/upload",
            "debug": "/ats-checker/debug/db"
        },
        "suggestions": [
            "Use /ats-checker/jobs for job-related endpoints",
            "Use /ats-checker/applications for application-related endpoints",
            "Use /ats-checker/quiz for quiz endpoints",
            "Use /ats-checker/statistics for system statistics",
            "Use /health for health checks",
            "Use /ats-checker/s3/upload for file uploads",
            "Use /docs for API documentation",
            "Use /ats-checker/debug/db for database status",
            "Use /ats-checker/s3/debug for S3 status"
        ]
    }


if __name__ == "__main__":
    import uvicorn
    
    # Run the application
    uvicorn.run(
        app,
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
        reload_excludes=["venv", ".pytest_cache", "__pycache__", "uploads", "ats_system.log"]
    ) 