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
from middlewares import DocsAuthenticationMiddleware

# Setup logging
logger = setup_ai_logger(__name__, "ats_ai.log", "INFO")

# Initialize services
cohere_service = None
document_service = None

# Load environment variables from .env
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# Environment configuration
def get_env_config():
    """Get environment configuration with defaults"""
    return {
        'COHERE_API_KEY': os.getenv('COHERE_API_KEY', ''),
        'CORS_ALLOW_ORIGINS': os.getenv('CORS_ALLOW_ORIGINS', ''),
        'CORS_ALLOW_CREDENTIALS': os.getenv('CORS_ALLOW_CREDENTIALS', 'true').lower() == 'true',
        'DOCS_USERNAME': os.getenv('DOCS_USERNAME', 'admin'),
        'DOCS_PASSWORD': os.getenv('DOCS_PASSWORD', 'admin123'),
        'DOCS_AUTH_ENABLED': os.getenv('DOCS_AUTH_ENABLED', 'true').lower() == 'true',
        'ENV': os.getenv('ENV', 'development'),
        'AI_HOST': os.getenv('AI_HOST', '0.0.0.0'),
        'AI_PORT': int(os.getenv('AI_PORT', '5000')),
    }

config = get_env_config()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler"""
    global cohere_service, document_service
    
    # Startup
    logger.info("Starting AI Service...")
    
    # Initialize services
    api_key = config['COHERE_API_KEY']
    if not api_key:
        logger.warning("COHERE_API_KEY not set - AI features will be limited")
    
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
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs" if config['DOCS_AUTH_ENABLED'] else None,
    redoc_url="/redoc" if config['DOCS_AUTH_ENABLED'] else None,
    openapi_url="/openapi.json" if config['DOCS_AUTH_ENABLED'] else None
)

# CORS configuration
def get_cors_origins() -> list:
    """Get CORS allowed origins from environment"""
    origins = []
    
    # Use CORS_ALLOW_ORIGINS if configured
    if config['CORS_ALLOW_ORIGINS']:
        origins = [origin.strip() for origin in config['CORS_ALLOW_ORIGINS'].split(",")]
    
    # Add development origins if in development mode
    if config['ENV'] == 'development':
        dev_origins = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:4000",
            "http://127.0.0.1:4000",
            "http://localhost:5000",
            "http://127.0.0.1:5000"
        ]
        for origin in dev_origins:
            if origin not in origins:
                origins.append(origin)
    
    return origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=config['CORS_ALLOW_CREDENTIALS'],
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Add authentication middleware for docs endpoints
if config['DOCS_AUTH_ENABLED']:
    app.add_middleware(DocsAuthenticationMiddleware)

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


# Root endpoint
@app.get("", tags=["Root"])
async def root():
    """Root endpoint with service information"""
    return {
        "message": "ATS AI Service",
        "version": "2.0.0",
        "description": "AI-powered CV evaluation and quiz generation",
        "environment": config['ENV'],
        "status": "running",
        "docs": f"/docs" if config['DOCS_AUTH_ENABLED'] else "disabled",
        "timestamp": datetime.now().isoformat()
    }


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ATS AI Service",
        "version": "2.0.0",
        "environment": config['ENV'],
        "timestamp": datetime.now().isoformat(),
        "ai_service_available": cohere_service is not None and cohere_service.api_key is not None
    }

# CV Evaluation endpoint
@app.post("/evaluate", tags=["CV Evaluation"])
async def evaluate_cv(request: EvaluateRequest):
    """
    Evaluate CV against job description using AI
    
    Args:
        request: CV evaluation request
        
    Returns:
        EvaluationResult: AI-generated evaluation
    """
    try:
        if not cohere_service or not cohere_service.api_key:
            # Fallback heuristic evaluation when no API key is configured
            import re
            cv_text = request.cv_text or ""
            job_desc = request.job_description or ""
            
            # Extract candidate skills/n-grams from job description (simple heuristic)
            # Split by commas and common separators, keep alphanumerics and '+'
            raw_tokens = re.split(r"[,\n\r;]+", job_desc)
            skills = [t.strip().lower() for t in raw_tokens if t and len(t.strip()) > 1]
            skills = [re.sub(r"[^a-z0-9+#\.\- ]", "", s) for s in skills]
            skills = [s for s in skills if s]
            
            # Match presence in CV text
            cv_lower = cv_text.lower()
            matched = []
            for s in skills:
                # treat multi-word skills as phrase; basic contains match
                if s and s in cv_lower:
                    matched.append(s)
            
            # Compute score based on coverage of listed skills
            coverage = (len(matched) / max(1, len(skills))) if skills else 0
            score = int(round(coverage * 100))
            
            # Build reasoning
            reasoning = (
                f"Heuristic evaluation based on job requirements. Matched {len(matched)} of {len(skills)} "
                f"skills/keywords from the job description."
            )
            
            # Return EvaluationResult-like structure
            evaluation = {
                "decision": "ACCEPTED" if score >= 70 else "REJECTED",
                "score": score,
                "reasoning": reasoning,
                "extracted_skills": matched[:20],
                "experience_years": None,
                "match_percentage": float(score),
                "strengths": [],
                "weaknesses": []
            }
            save_evaluation_log(evaluation, "cv_evaluation_fallback")
            return evaluation
        
        # Perform evaluation via Cohere when configured, with graceful fallback
        try:
            logger.info("Starting Cohere evaluation...")
            evaluation_text = cohere_service.evaluate_cv(
                cv_text=request.cv_text,
                job_description=request.job_description
            )
            
            if not evaluation_text:
                logger.warning("Cohere evaluation returned empty result, falling back to heuristic")
                raise RuntimeError("Empty evaluation from AI")

            # Parse decision and score from Cohere's response
            decision, score = cohere_service.parse_evaluation_result(evaluation_text)
            extracted_skills = cohere_service.extract_skills(request.cv_text) or []

            evaluation = {
                "decision": decision,
                "score": int(score),
                "reasoning": evaluation_text,
                "extracted_skills": extracted_skills,
                "experience_years": None,
                "match_percentage": float(score),
                "strengths": [],
                "weaknesses": []
            }

            # Log evaluation with required fields
            try:
                save_evaluation_log(
                    filename=request.filename or "unknown",
                    job_description=request.job_description,
                    cv_text=request.cv_text,
                    evaluation_result=evaluation_text,
                    decision=decision,
                    score=int(score)
                )
            except Exception as log_err:
                logger.error(f"Logging error (AI evaluation): {log_err}")
            
            logger.info(f"Cohere evaluation completed: {decision}, score: {score}")
            return evaluation
        except Exception as e:
            logger.error(f"CV evaluation error: {e}")
            # Fallback heuristic evaluation
            import re
            cv_text = request.cv_text or ""
            job_desc = request.job_description or ""
            raw_tokens = re.split(r"[,\n\r;]+", job_desc)
            skills = [t.strip().lower() for t in raw_tokens if t and len(t.strip()) > 1]
            skills = [re.sub(r"[^a-z0-9+#\.\- ]", "", s) for s in skills]
            skills = [s for s in skills if s]
            cv_lower = cv_text.lower()
            matched = [s for s in skills if s and s in cv_lower]
            coverage = (len(matched) / max(1, len(skills))) if skills else 0
            score = int(round(coverage * 100))
            reasoning = (
                f"Heuristic evaluation based on job requirements. Matched {len(matched)} of {len(skills)} "
                f"skills/keywords from the job description."
            )
            evaluation = {
                "decision": "ACCEPTED" if score >= 70 else "REJECTED",
                "score": score,
                "reasoning": reasoning,
                "extracted_skills": matched[:20],
                "experience_years": None,
                "match_percentage": float(score),
                "strengths": [],
                "weaknesses": []
            }
            try:
                save_evaluation_log(
                    filename=request.filename or "unknown",
                    job_description=request.job_description,
                    cv_text=request.cv_text,
                    evaluation_result=reasoning,
                    decision=evaluation["decision"],
                    score=int(score)
                )
            except Exception as log_err:
                logger.error(f"Logging error (fallback evaluation): {log_err}")
            return evaluation
        
    except Exception as e:
        logger.error(f"CV evaluation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Quiz Generation endpoint
@app.post("/quiz/generate", tags=["Quiz"])
async def generate_quiz(request: QuizGenerationRequest):
    """
    Generate quiz questions based on job description
    
    Args:
        request: Quiz generation request
        
    Returns:
        Dict: Generated quiz questions
    """
    try:
        if not cohere_service or not cohere_service.api_key:
            # Fallback quiz generation: simple skill-based questions
            import re
            job_desc = request.job_description or ""
            raw_tokens = re.split(r"[,\n\r;]+", job_desc)
            skills = [t.strip() for t in raw_tokens if t and len(t.strip()) > 1]
            
            questions = []
            for i, s in enumerate(skills[:request.num_questions]):
                q = {
                    "question": f"Which of the following best relates to '{s}'?",
                    "options": [
                        f"{s}",
                        "Unrelated concept",
                        "General workplace term",
                        "Irrelevant term"
                    ],
                    "correct_answer": 0
                }
                questions.append(q)
            
            # If not enough skills, pad with generic questions
            while len(questions) < request.num_questions:
                idx = len(questions) + 1
                questions.append({
                    "question": f"General best practice question #{idx}",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correct_answer": 0
                })
            
            quiz = {"questions": questions[:request.num_questions]}
            logger.info(f"Generated fallback quiz with {len(questions)} questions")
            return quiz
        
        # Generate quiz via Cohere when configured (sync function)
        quiz_questions = cohere_service.generate_quiz(
            job_description=request.job_description,
            num_questions=request.num_questions
        )
        if not quiz_questions:
            raise HTTPException(status_code=503, detail="AI quiz generation failed")
        
        result = {"questions": quiz_questions}
        logger.info(f"Generated AI quiz with {len(quiz_questions)} questions")
        return result
    except Exception as e:
        logger.error(f"Quiz generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Backward-compatible alias expected by ATS service
@app.post("/generate-quiz", tags=["Quiz"])
async def generate_quiz_alias(request: QuizGenerationRequest):
    return await generate_quiz(request)

# Quiz Evaluation endpoint
@app.post("/quiz/evaluate", tags=["Quiz"])
async def evaluate_quiz(request: QuizAnswerRequest):
    """
    Evaluate quiz answers
    
    Args:
        request: Quiz evaluation request
        
    Returns:
        Dict: Quiz evaluation results
    """
    try:
        if not cohere_service or not cohere_service.api_key:
            raise HTTPException(
                status_code=503, 
                detail="AI service not available - COHERE_API_KEY not configured"
            )
        
        # Evaluate quiz
        evaluation = await cohere_service.evaluate_quiz(
            answers=request.answers,
            quiz_questions=request.quiz_questions
        )
        
        # Log quiz evaluation
        save_evaluation_log(evaluation, "quiz_evaluation")
        
        return evaluation
        
    except Exception as e:
        logger.error(f"Quiz evaluation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Text Extraction endpoint (expected by ATS service)
@app.post("/extract-text", tags=["Document"])
async def extract_text(file: UploadFile = File(...)):
    """
    Extract text content from an uploaded PDF or DOCX and optionally infer a name.
    Returns keys expected by ATS service: text_content, name
    """
    try:
        if not document_service:
            raise HTTPException(status_code=503, detail="Document service not available")

        if not file or not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")

        filename = file.filename
        content = await file.read()

        # Validate
        if not document_service.validate_file_type(filename):
            raise HTTPException(status_code=400, detail="Unsupported file type. Only PDF and DOCX are allowed")

        if not document_service.validate_file_size(content):
            raise HTTPException(status_code=400, detail="File size exceeds 16MB limit")

        # Extract text
        text = await document_service.extract_text_from_file_async(content, filename)
        if not text or not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from document")

        # Try to infer candidate name
        name = document_service.extract_name(text) or document_service.extract_name_from_text(text)

        return JSONResponse(status_code=200, content={
            "text_content": text,
            "name": name
        })

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Text extraction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# File Upload endpoint
@app.post("/upload", tags=["File Upload"])
async def upload_file(file: UploadFile = File(...)):
    """
    Upload and process document file
    
    Args:
        file: Document file to upload
        
    Returns:
        FileUploadInfo: File processing information
    """
    try:
        if not document_service:
            raise HTTPException(status_code=503, detail="Document service not available")
        
        # Process file
        result = await document_service.process_file(file)
        
        # Log file upload
        save_evaluation_log(result, "file_upload")
        
        return result
        
    except Exception as e:
        logger.error(f"File upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Service Status endpoint
@app.get("/status", tags=["Status"])
async def service_status():
    """Get detailed service status"""
    return {
        "service": "ATS AI Service",
        "version": "2.0.0",
        "status": "running",
        "environment": config['ENV'],
        "timestamp": datetime.now().isoformat(),
        "services": {
            "cohere_service": {
                "available": cohere_service is not None,
                "configured": cohere_service.api_key is not None if cohere_service else False
            },
            "document_service": {
                "available": document_service is not None
            }
        },
        "configuration": {
            "docs_auth_enabled": config['DOCS_AUTH_ENABLED'],
            "cors_origins": get_cors_origins(),
            "cors_credentials": config['CORS_ALLOW_CREDENTIALS']
        }
    }

if __name__ == "__main__":
    import uvicorn
    
    # Display startup information
    print("ATS AI Service Starting...")
    print(f"Environment: {config['ENV'].upper()}")
    print(f"Host: {config['AI_HOST']}:{config['AI_PORT']}")
    print(f"API Documentation: http://{config['AI_HOST']}:{config['AI_PORT']}/docs" + 
          (" (Authentication Required)" if config['DOCS_AUTH_ENABLED'] else ""))
    
    if config['DOCS_AUTH_ENABLED']:
        print(f"Default credentials: {config['DOCS_USERNAME']}:{config['DOCS_PASSWORD']}")
    
    if not config['COHERE_API_KEY']:
        print("Warning: COHERE_API_KEY not set - AI features will be limited")
    
    print("=" * 60)
    
    # Run the application
    uvicorn.run(
        "main:app",
        host=config['AI_HOST'],
        port=config['AI_PORT'],
        reload=config['ENV'] == 'development',
        log_level="info"
    ) 