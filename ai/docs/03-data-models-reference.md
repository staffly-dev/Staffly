# 📊 AI Service Data Models Reference

## Overview

This document provides comprehensive documentation for all data models used in the ATS AI Service. These models define the structure of requests, responses, and internal data used throughout the service.

## 🔗 Base Models

### BaseModel

All models inherit from Pydantic's `BaseModel`, providing:
- Automatic validation
- JSON serialization/deserialization
- Type checking
- Field validation

## 📝 Request Models

### EvaluateRequest

**Purpose**: Request model for CV evaluation endpoint

**Location**: `main.py` (defined inline)

**Fields**:
```python
class EvaluateRequest(BaseModel):
    cv_text: str = Field(..., description="CV text content")
    job_description: str = Field(..., description="Job description")
    filename: Optional[str] = Field(None, description="Original filename")
```

**Field Details**:
- `cv_text` (string, required): The CV content as plain text
- `job_description` (string, required): Job requirements and description
- `filename` (string, optional): Original filename for logging purposes

**Validation Rules**:
- `cv_text` must not be empty
- `job_description` must not be empty
- `filename` is optional

**Example**:
```json
{
  "cv_text": "Experienced Python developer with 5 years of experience...",
  "job_description": "We are looking for a Python developer with FastAPI experience...",
  "filename": "resume.pdf"
}
```

### QuizGenerationRequest

**Purpose**: Request model for quiz generation endpoint

**Location**: `main.py` (defined inline)

**Fields**:
```python
class QuizGenerationRequest(BaseModel):
    job_description: str = Field(..., description="Job description")
    num_questions: int = Field(default=10, ge=1, le=20, description="Number of questions")
```

**Field Details**:
- `job_description` (string, required): Job requirements and description
- `num_questions` (integer, optional): Number of questions to generate (1-20, default: 10)

**Validation Rules**:
- `job_description` must not be empty
- `num_questions` must be between 1 and 20 (inclusive)
- `num_questions` defaults to 10 if not provided

**Example**:
```json
{
  "job_description": "Python developer position requiring FastAPI and MongoDB experience...",
  "num_questions": 15
}
```

### QuizAnswerRequest

**Purpose**: Request model for quiz evaluation endpoint

**Location**: `main.py` (defined inline)

**Fields**:
```python
class QuizAnswerRequest(BaseModel):
    answers: List[int] = Field(..., description="List of selected answer indices")
    quiz_questions: List[Dict[str, Any]] = Field(..., description="Original quiz questions")
```

**Field Details**:
- `answers` (array of integers, required): List of selected answer indices (0-based)
- `quiz_questions` (array of objects, required): Original quiz questions from generation

**Validation Rules**:
- `answers` must be a list of integers
- `quiz_questions` must be a list of question objects
- Answer indices must correspond to the question options

**Example**:
```json
{
  "answers": [1, 0, 2, 1, 0, 1, 2, 0, 1, 0],
  "quiz_questions": [
    {
      "question": "What is FastAPI?",
      "options": ["Web scraping tool", "API framework", "Database", "File processor"],
      "correct_answer": 1,
      "explanation": "FastAPI is a modern web framework for building APIs"
    }
  ]
}
```

## 📤 Response Models

### EvaluationResult

**Purpose**: Response model for CV evaluation results

**Location**: `models/evaluation_models.py`

**Fields**:
```python
class EvaluationResult(BaseModel):
    decision: EvaluationDecision = Field(..., description="Evaluation decision")
    score: int = Field(..., description="Evaluation score (0-100)", ge=0, le=100)
    reasoning: str = Field(..., description="Reasoning for the decision")
    extracted_skills: List[str] = Field(default_factory=list, description="Skills extracted from CV")
    experience_years: Optional[int] = Field(None, description="Years of experience extracted")
    match_percentage: Optional[float] = Field(None, description="Match percentage with job requirements")
    strengths: List[str] = Field(default_factory=list, description="Candidate strengths")
    weaknesses: List[str] = Field(default_factory=list, description="Areas for improvement")
    recommendations: Optional[str] = Field(None, description="Hiring recommendations")
```

**Field Details**:
- `decision`: Evaluation decision from `EvaluationDecision` enum
- `score`: Numerical score from 0-100
- `reasoning`: Detailed reasoning for the decision
- `extracted_skills`: List of skills found in the CV
- `experience_years`: Years of experience (optional)
- `match_percentage`: Match percentage with job requirements (optional)
- `strengths`: List of candidate strengths
- `weaknesses`: Areas for improvement
- `recommendations`: Hiring recommendations (optional)

**Validation Rules**:
- `score` must be between 0 and 100 (inclusive)
- `decision` must be a valid enum value
- `reasoning` must not be empty

**Example**:
```json
{
  "decision": "ACCEPT",
  "score": 85,
  "reasoning": "Strong technical background with relevant experience...",
  "extracted_skills": ["Python", "FastAPI", "MongoDB", "AWS"],
  "experience_years": 5,
  "match_percentage": 85.5,
  "strengths": ["Strong technical skills", "Relevant experience", "Cloud knowledge"],
  "weaknesses": ["Could improve communication skills"],
  "recommendations": "Strong candidate, recommend for interview"
}
```

### FileUploadInfo

**Purpose**: Model for file upload information

**Location**: `models/evaluation_models.py`

**Fields**:
```python
class FileUploadInfo(BaseModel):
    filename: str = Field(..., description="Original filename")
    size_bytes: int = Field(..., description="File size in bytes")
    size_mb: float = Field(..., description="File size in MB")
    extension: str = Field(..., description="File extension")
    is_allowed: bool = Field(..., description="Whether file type is allowed")
    timestamp: datetime = Field(default_factory=datetime.now, description="Upload timestamp")
```

**Field Details**:
- `filename`: Original filename
- `size_bytes`: File size in bytes
- `size_mb`: File size in MB (calculated)
- `extension`: File extension (lowercase)
- `is_allowed`: Whether file type is supported
- `timestamp`: Upload timestamp (auto-generated)

**Example**:
```json
{
  "filename": "resume.pdf",
  "size_bytes": 245760,
  "size_mb": 0.23,
  "extension": "pdf",
  "is_allowed": true,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### APIResponse

**Purpose**: Generic API response wrapper

**Location**: `models/evaluation_models.py`

**Fields**:
```python
class APIResponse(BaseModel):
    success: bool = Field(..., description="Whether the operation was successful")
    message: str = Field(..., description="Response message")
    data: Optional[Dict[str, Any]] = Field(None, description="Response data")
    timestamp: datetime = Field(default_factory=datetime.now, description="Response timestamp")
```

**Field Details**:
- `success`: Boolean indicating operation success
- `message`: Human-readable response message
- `data`: Optional response data (dictionary)
- `timestamp`: Response timestamp (auto-generated)

**Example**:
```json
{
  "success": true,
  "message": "CV evaluation completed successfully",
  "data": {
    "decision": "ACCEPT",
    "score": 85
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### ErrorResponse

**Purpose**: Standardized error response model

**Location**: `models/evaluation_models.py`

**Fields**:
```python
class ErrorResponse(BaseModel):
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")
    timestamp: datetime = Field(default_factory=datetime.now, description="Error timestamp")
```

**Field Details**:
- `error`: Primary error message
- `detail`: Optional detailed error information
- `timestamp`: Error timestamp (auto-generated)

**Example**:
```json
{
  "error": "File processing failed",
  "detail": "Unsupported file type. Allowed: pdf,docx",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🔤 Enums

### EvaluationDecision

**Purpose**: Enumeration for CV evaluation decisions

**Location**: `models/evaluation_models.py`

**Values**:
```python
class EvaluationDecision(str, Enum):
    ACCEPT = "ACCEPT"           # Candidate accepted
    REJECT = "REJECT"           # Candidate rejected
    REVIEW = "REVIEW"           # Requires manual review
    ACCEPTED = "ACCEPTED"       # Backward compatibility
    REJECTED = "REJECTED"       # Backward compatibility
    UNKNOWN = "UNKNOWN"         # Unknown/undetermined
```

**Usage**:
- `ACCEPT`: Strong candidate, recommend hiring
- `REJECT`: Does not meet requirements
- `REVIEW`: Borderline case, requires human review
- Legacy values maintained for backward compatibility

## 🔍 Quiz Question Structure

### Quiz Question Object

**Purpose**: Structure for individual quiz questions

**Fields**:
```json
{
  "question": "What is the primary purpose of FastAPI?",
  "options": [
    "Web scraping",
    "Building APIs",
    "Database management",
    "File processing"
  ],
  "correct_answer": 1,
  "explanation": "FastAPI is a modern web framework for building APIs with Python"
}
```

**Field Details**:
- `question`: The question text
- `options`: Array of answer options (strings)
- `correct_answer`: Index of correct answer (0-based)
- `explanation`: Explanation of the correct answer

**Validation Rules**:
- `correct_answer` must be a valid index within `options` array
- `options` must contain at least 2 choices
- `question` must not be empty

## 🔧 Validation Rules

### Field Validation

**String Fields**:
- Required strings must not be empty
- Maximum length limits may apply
- Content validation for specific fields

**Integer Fields**:
- `score`: Must be between 0 and 100 (inclusive)
- `num_questions`: Must be between 1 and 20 (inclusive)
- `experience_years`: Must be non-negative

**Array Fields**:
- `extracted_skills`: List of non-empty strings
- `strengths`: List of non-empty strings
- `weaknesses`: List of non-empty strings
- `answers`: List of valid integers

**Optional Fields**:
- `filename`: Optional string
- `experience_years`: Optional integer
- `match_percentage`: Optional float
- `recommendations`: Optional string

### Custom Validators

**Score Validation**:
```python
@validator('score')
def validate_score(cls, v):
    if not 0 <= v <= 100:
        raise ValueError('Score must be between 0 and 100')
    return v
```

**File Extension Validation**:
- Only `.pdf` and `.docx` files are supported
- Extensions are case-insensitive
- File size limits apply (configurable)

## 📊 Data Flow

### Request Flow

1. **Client Request**: JSON payload sent to endpoint
2. **Model Validation**: Pydantic validates request data
3. **Business Logic**: Service processes validated data
4. **Response Generation**: Response model created and validated
5. **Client Response**: JSON response sent to client

### Error Flow

1. **Validation Error**: Pydantic validation fails
2. **Error Response**: `ErrorResponse` model created
3. **HTTP Status**: Appropriate HTTP status code set
4. **Client Error**: Error response sent to client

## 🧪 Testing Models

### Test Data Examples

**Valid EvaluateRequest**:
```json
{
  "cv_text": "Experienced Python developer with 5 years of experience in web development. Proficient in FastAPI, Django, and MongoDB.",
  "job_description": "We are looking for a Python developer with experience in FastAPI and MongoDB. The ideal candidate should have at least 3 years of experience.",
  "filename": "test_resume.pdf"
}
```

**Valid QuizGenerationRequest**:
```json
{
  "job_description": "Python developer position requiring FastAPI, MongoDB, and AWS experience. Looking for candidates with strong problem-solving skills and 3+ years of experience.",
  "num_questions": 10
}
```

**Valid QuizAnswerRequest**:
```json
{
  "answers": [1, 0, 2, 1, 0, 1, 2, 0, 1, 0],
  "quiz_questions": [
    {
      "question": "What is FastAPI?",
      "options": ["Web scraping tool", "API framework", "Database", "File processor"],
      "correct_answer": 1,
      "explanation": "FastAPI is a modern web framework for building APIs"
    }
  ]
}
```

## 🔒 Security Considerations

### Input Validation

- All input is validated using Pydantic models
- Field types are strictly enforced
- Size limits prevent abuse
- Content validation for sensitive fields

### Data Sanitization

- HTML/script tags are stripped from text input
- File content is validated before processing
- No persistent storage of uploaded files
- Sensitive information is not logged

### Error Handling

- Error messages don't expose internal details
- Validation errors are user-friendly
- All errors are logged for monitoring
- Consistent error response format

## 📚 Related Documentation

- **[API Endpoints Reference](02-api-endpoints-reference.md)** - Complete API documentation
- **[API Documentation Security](01-api-documentation-security.md)** - Security implementation
- **[Environment Configuration](../README.md#environment-variables)** - Service configuration
- **[Troubleshooting](../README.md#troubleshooting)** - Common issues and solutions

## 🤝 Support

For questions about data models:

1. Check the [API endpoints reference](02-api-endpoints-reference.md)
2. Review the [troubleshooting guide](../README.md#troubleshooting)
3. Check service logs for validation errors
4. Ensure all required fields are provided

## 📄 License

This documentation is part of the ATS AI Service, licensed under the MIT License.
