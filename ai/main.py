"""
AI Service Main Application
FastAPI application for AI services (CV evaluation, quiz generation)
"""

import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from dotenv import load_dotenv

from services.cohere_service import CohereService  
from services.document_service import DocumentProcessingService
from models.evaluation_models import EvaluationResult, FileUploadInfo, ErrorResponse
from utils.logging_utils import setup_ai_logger, save_evaluation_log

# Setup logging
logger = setup_ai_logger(__name__, "ats_ai.log", "INFO")

# Initialize services
cohere_service = None
document_service = None

# Load environment variables from model/.env
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler"""
    global cohere_service, document_service
    
    # Startup
    logger.info("Starting AI Service...")
    
    # Initialize services
    api_key = os.getenv("COHERE_API_KEY")
    cohere_service = CohereService(api_key)
    document_service = DocumentProcessingService()
    
    logger.info("AI Service started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down AI Service...")

# Create FastAPI app
app = FastAPI(
    title="ATS AI Service",
    description="AI-powered CV evaluation and quiz generation service",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
def get_cors_origins() -> list:
    """Get CORS allowed origins from environment"""
    cors_origins = os.getenv("CORS_ALLOW_ORIGINS", "http://localhost:3000,http://localhost:4000")
    origins = [origin.strip() for origin in cors_origins.split(",")]
    
    # Add localhost variants for development
    dev_origins = [
        "http://127.0.0.1:3000",
        "http://127.0.0.1:4000"
    ]
    origins.extend(dev_origins)
    return origins

cors_credentials = os.getenv("CORS_ALLOW_CREDENTIALS", "true").lower() == "true"

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=cors_credentials,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Request/Response Models
class EvaluateRequest(BaseModel):
    cv_text: str = Field(..., description="CV text content")
    job_description: str = Field(..., description="Job description")
    filename: Optional[str] = Field(None, description="Original filename")

class QuizGenerationRequest(BaseModel):
    job_description: str = Field(..., description="Job description")
    num_questions: int = Field(default=10, ge=1, le=20, description="Number of questions")

class QuizAnswerRequest(BaseModel):
    answers: List[int] = Field(..., description="List of selected answer indices")
    quiz_questions: List[Dict[str, Any]] = Field(..., description="Original quiz questions")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "AI Service",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

# CV Evaluation endpoint
@app.post("/evaluate", response_model=EvaluationResult) # بتاخد البيانيات بناءا علي EvaluateRequest و بترجع EvaluationResult
async def evaluate_cv(request: EvaluateRequest):
    """
    Evaluate a CV against job requirements
    """
    try:
        logger.info(f"Starting CV evaluation for: {request.filename or 'unknown'}")
        
        if not cohere_service:
            raise HTTPException(status_code=500, detail="AI service not initialized")
        
        # Generate evaluation
        evaluation_text = cohere_service.evaluate_cv(
            request.cv_text, 
            request.job_description
        )
        
        if not evaluation_text:
            raise HTTPException(
                status_code=500, 
                detail="Failed to generate CV evaluation"
            )
        
        # Parse results
        decision, score = cohere_service.parse_evaluation_result(evaluation_text)
        
        # Extract email if possible
        email = None
        if document_service:
            email = document_service.extract_email_from_text(request.cv_text)
        
        # Save evaluation log
        if request.filename:
            save_evaluation_log(
                filename=request.filename,
                job_description=request.job_description,
                cv_text=request.cv_text,
                evaluation_result=evaluation_text,
                decision=decision,
                score=score,
                email=email
            )
        
        result = EvaluationResult(
            decision=decision,
            score=score,
            evaluation_text=evaluation_text,
            # email=email,
            reasoning=evaluation_text,  # Ensure this field is always present
            # extracted_skills=[],  # Add other fields as needed
            # experience_years=None,
            # match_percentage=None,
            # strengths=[],
            # weaknesses=[],
            # recommendations=None,
            # filename=request.filename
        )
        
        logger.info(f"CV evaluation completed: {decision} ({score}/100)")
        return result
        
    except Exception as e:
        logger.error(f"CV evaluation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Document processing endpoint
@app.post("/extract-text")
async def extract_text_from_document(file: UploadFile = File(...)):
    """
    Extract text from uploaded document (PDF or DOCX)
    """
    try:
        logger.info(f"Processing file: {file.filename}")
        
        if not document_service:
            raise HTTPException(status_code=500, detail="Document service not initialized")
        
        # Check file type
        if not document_service.is_allowed_file(file.filename):
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file type. Allowed: {document_service.allowed_extensions}"
            )
        
        # Read file content
        file_content = await file.read()
        
        # Extract text
        text_content = document_service._extract_text_from_file_sync(
            file_content, file.filename
        )
        
        if not text_content:
            raise HTTPException(
                status_code=422, 
                detail="Failed to extract text from document"
            )
        
        # Extract additional info
        email = document_service.extract_email_from_text(text_content)
        name = document_service.extract_name_from_text(text_content)
        
        # File info
        file_info = FileUploadInfo(
            filename=file.filename,
            size_bytes=len(file_content),
            size_mb=round(len(file_content) / (1024 * 1024), 2),
            extension=file.filename.rsplit('.', 1)[1].lower(),
            is_allowed=True
        )
        
        logger.info(f"Text extracted successfully: {len(text_content)} characters")
        
        return {
            "text_content": text_content,
            "email": email,
            "name": name,
            "file_info": file_info.dict()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Document processing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Quiz generation endpoint
@app.post("/generate-quiz")
async def generate_quiz(request: QuizGenerationRequest):
    """
    Generate a quiz based on job description
    """
    try:
        logger.info(f"Generating quiz with {request.num_questions} questions")
        
        if not cohere_service:
            raise HTTPException(status_code=500, detail="AI service not initialized")
        
        # Generate quiz
        quiz_questions = cohere_service.generate_quiz(
            request.job_description, 
            request.num_questions
        )
        
        if not quiz_questions:
            raise HTTPException(
                status_code=500, 
                detail="Failed to generate quiz questions"
            )
        
        logger.info(f"Quiz generated successfully: {len(quiz_questions)} questions")
        
        return {
            "questions": quiz_questions,
            "total_questions": len(quiz_questions),
            "time_limit": 300,  # 5 minutes
            "pass_threshold": 7
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Quiz generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Quiz evaluation endpoint
@app.post("/evaluate-quiz")
async def evaluate_quiz_answers(request: QuizAnswerRequest):
    """
    Evaluate quiz answers and return score
    """
    try:
        logger.info("Evaluating quiz answers")
        
        if not cohere_service:
            raise HTTPException(status_code=500, detail="AI service not initialized")
        
        # Evaluate answers
        score = cohere_service.evaluate_quiz_answers(
            request.answers, 
            request.quiz_questions
        )
        
        total_questions = len(request.quiz_questions)
        percentage = (score / total_questions) * 100 if total_questions > 0 else 0
        passed = score >= 7  # Pass threshold
        
        logger.info(f"Quiz evaluated: {score}/{total_questions} ({percentage:.1f}%)")
        
        return {
            "score": score,
            "total_questions": total_questions,
            "percentage": round(percentage, 1),
            "passed": passed,
            "pass_threshold": 7
        }
        
    except Exception as e:
        logger.error(f"Quiz evaluation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Error handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="Internal server error",
            detail=str(exc)
        ).dict()
    )

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("AI_PORT", 5000))
    host = os.getenv("AI_HOST", "0.0.0.0")
    
    logger.info(f"Starting AI Service on {host}:{port}")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    ) 