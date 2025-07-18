"""
Data models for CV evaluation and quiz functionality
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, validator
from datetime import datetime
from enum import Enum


class EvaluationDecision(str, Enum):
    """Enumeration for evaluation decisions"""
    ACCEPT = "ACCEPT"
    REJECT = "REJECT"  
    REVIEW = "REVIEW"
    ACCEPTED = "ACCEPTED"  # Keep for backward compatibility
    REJECTED = "REJECTED"  # Keep for backward compatibility
    UNKNOWN = "UNKNOWN"    # Keep for backward compatibility


class EvaluationResult(BaseModel):
    """Model for CV evaluation results"""
    decision: EvaluationDecision = Field(..., description="Evaluation decision")
    score: int = Field(..., description="Evaluation score (0-100)", ge=0, le=100)
    reasoning: str = Field(..., description="Reasoning for the decision")
    extracted_skills: List[str] = Field(default_factory=list, description="Skills extracted from CV")
    experience_years: Optional[int] = Field(None, description="Years of experience extracted")
    match_percentage: Optional[float] = Field(None, description="Match percentage with job requirements")
    strengths: List[str] = Field(default_factory=list, description="Candidate strengths")
    weaknesses: List[str] = Field(default_factory=list, description="Areas for improvement")
    recommendations: Optional[str] = Field(None, description="Hiring recommendations")
    
    @validator('score')
    def validate_score(cls, v):
        if not 0 <= v <= 100:
            raise ValueError('Score must be between 0 and 100')
        return v


class FileUploadInfo(BaseModel):
    """Model for file upload information"""
    filename: str = Field(..., description="Original filename")
    size_bytes: int = Field(..., description="File size in bytes")
    size_mb: float = Field(..., description="File size in MB")
    extension: str = Field(..., description="File extension")
    is_allowed: bool = Field(..., description="Whether file type is allowed")
    timestamp: datetime = Field(default_factory=datetime.now, description="Upload timestamp")


class APIResponse(BaseModel):
    """Generic API response model"""
    success: bool = Field(..., description="Whether the operation was successful")
    message: str = Field(..., description="Response message")
    data: Optional[Dict[str, Any]] = Field(None, description="Response data")
    timestamp: datetime = Field(default_factory=datetime.now, description="Response timestamp")


class ErrorResponse(BaseModel):
    """Error response model"""
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")
    timestamp: datetime = Field(default_factory=datetime.now, description="Error timestamp") 