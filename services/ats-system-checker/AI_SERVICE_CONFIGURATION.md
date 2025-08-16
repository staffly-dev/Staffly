# AI Service Configuration and Fallback Options

## Overview

The ATS system integrates with an AI service for enhanced CV evaluation and quiz generation. However, the system is designed to work even when the AI service is not available, using intelligent fallback mechanisms.

## AI Service Features

### 1. CV Text Extraction

- **AI Service**: Extracts text content from PDF/DOCX files using advanced OCR and parsing
- **Fallback**: Creates basic CV text from filename and metadata

### 2. CV Evaluation

- **AI Service**: AI-powered evaluation of CV against job requirements
- **Fallback**: Heuristic evaluation based on keyword matching and coverage analysis

### 3. Quiz Generation

- **AI Service**: Dynamic quiz generation from job descriptions
- **Fallback**: Pre-defined generic questions to maintain workflow

## Configuration Options

### Environment Variables

```bash
# AI Service Configuration
AI_SERVICE_URL=http://localhost:5000                    # AI service endpoint
AI_SERVICE_ENABLED=true                                 # Enable AI service integration
AI_SERVICE_FALLBACK=true                                # Enable fallback processing
```

### Configuration Modes

#### 1. Full AI Service Mode

```bash
AI_SERVICE_URL=http://localhost:5000
AI_SERVICE_ENABLED=true
AI_SERVICE_FALLBACK=true
```

- **CV Processing**: Full AI-powered text extraction
- **Evaluation**: AI-powered CV scoring and decision making
- **Quiz Generation**: Dynamic AI-generated questions
- **Fallback**: Automatic fallback if AI service fails

#### 2. Fallback-Only Mode

```bash
AI_SERVICE_URL=
AI_SERVICE_ENABLED=false
AI_SERVICE_FALLBACK=true
```

- **CV Processing**: Basic text extraction from metadata
- **Evaluation**: Heuristic keyword-based scoring
- **Quiz Generation**: Pre-defined generic questions
- **Fallback**: Always uses fallback methods

#### 3. Disabled Mode

```bash
AI_SERVICE_URL=
AI_SERVICE_ENABLED=false
AI_SERVICE_FALLBACK=false
```

- **CV Processing**: Basic text extraction only
- **Evaluation**: Minimal processing
- **Quiz Generation**: Disabled
- **Fallback**: No fallback processing

## Fallback Mechanisms

### 1. CV Text Extraction Fallback

When AI service is unavailable:

```python
# Fallback: create basic CV text from filename and metadata
cv_text = f"CV submitted by {candidate_name} for job application. File: {cv_file.filename}"
extracted_name = candidate_name
```

### 2. CV Evaluation Fallback

Heuristic evaluation based on keyword matching:

```python
def _heuristic_evaluation(self, cv_text: str, job_posting) -> tuple[str, int, str]:
    # Extract skills from job description
    job_desc = job_posting.description or ""
    skills = self._extract_skills(job_desc)

    # Match skills in CV text
    cv_lower = cv_text.lower()
    matched_skills = [s for s in skills if s in cv_lower]

    # Calculate coverage score
    coverage = len(matched_skills) / max(1, len(skills))
    score = int(round(coverage * 100))

    # Determine decision based on threshold
    decision = "ACCEPTED" if score >= job_posting.evaluation_threshold else "REJECTED"

    return decision, score, evaluation_text
```

### 3. Quiz Generation Fallback

Pre-defined generic questions:

```python
def _generate_fallback_quiz(self, job_description: str) -> Dict[str, Any]:
    questions = [
        {
            "question": "What is the main purpose of this job?",
            "options": ["To earn money", "To gain experience", "To contribute to society"],
            "correct_answer": 2
        },
        # ... more generic questions
    ]
    return {"questions": questions, "job_description": job_description}
```

## Production Deployment

### Option 1: Deploy AI Service

1. **Deploy AI Service** to Railway or similar platform
2. **Configure Environment Variables**:
   ```bash
   AI_SERVICE_URL=https://your-ai-service.up.railway.app
   AI_SERVICE_ENABLED=true
   AI_SERVICE_FALLBACK=true
   ```

### Option 2: Use Fallback Mode

1. **Disable AI Service**:

   ```bash
   AI_SERVICE_URL=
   AI_SERVICE_ENABLED=false
   AI_SERVICE_FALLBACK=true
   ```

2. **System will work** with reduced functionality but maintain core workflow

## Error Handling

### AI Service Connection Errors

The system gracefully handles various AI service errors:

1. **Connection Failed**: Falls back to heuristic evaluation
2. **Timeout**: Retries with exponential backoff
3. **Service Unavailable**: Uses fallback processing
4. **Invalid Response**: Logs error and uses fallback

### Fallback Activation

Fallback is automatically activated when:

- `AI_SERVICE_URL` is empty or invalid
- `AI_SERVICE_ENABLED` is false
- AI service connection fails
- AI service returns errors

## Monitoring and Logging

### Startup Logs

```
INFO - AI Service configured: http://localhost:5000
INFO - AI Service enabled: True
INFO - AI Service fallback: True
```

### Fallback Logs

```
WARNING - AI service URL not configured, using fallback CV processing
WARNING - AI evaluation failed, using heuristic fallback: Connection error
INFO - Heuristic evaluation: score=75, decision=ACCEPTED, matched_skills=['python', 'fastapi']
```

### Error Logs

```
ERROR - AI service extract-text error: [Errno -2] Name or service not known
WARNING - Falling back to basic CV processing without AI service
```

## Performance Impact

### AI Service Mode

- **CV Processing**: ~2-5 seconds (AI service dependent)
- **Evaluation**: ~1-3 seconds (AI service dependent)
- **Quiz Generation**: ~3-8 seconds (AI service dependent)

### Fallback Mode

- **CV Processing**: ~0.1 seconds (local processing)
- **Evaluation**: ~0.1 seconds (local keyword matching)
- **Quiz Generation**: ~0.01 seconds (pre-defined questions)

## Security Considerations

### AI Service Integration

- **HTTPS Required**: All AI service communication must use HTTPS
- **Timeout Limits**: 60-second timeout prevents hanging requests
- **Error Handling**: No sensitive data exposed in error messages

### Fallback Processing

- **Local Processing**: All fallback processing happens locally
- **No External Calls**: Fallback mode doesn't make external API calls
- **Data Privacy**: CV content remains within the ATS system

## Troubleshooting

### Common Issues

1. **"Name or service not known"**

   - Check `AI_SERVICE_URL` configuration
   - Verify AI service is running and accessible
   - Use fallback mode if AI service is unavailable

2. **"AI service error"**

   - Check AI service logs
   - Verify API endpoint responses
   - Check network connectivity

3. **"Failed to extract text from CV"**
   - Verify file format (PDF/DOCX)
   - Check file size limits
   - Use fallback processing if AI service fails

### Debug Commands

```bash
# Test AI service connectivity
curl -X GET https://your-ai-service.up.railway.app/health

# Test CV text extraction
curl -X POST https://your-ai-service.up.railway.app/extract-text \
  -F "file=@test_cv.pdf"

# Check ATS system logs
tail -f ats_system.log | grep -i "ai service"
```

## Best Practices

### Development

- Use local AI service (`http://localhost:5000`)
- Enable fallback for testing
- Monitor fallback activation

### Production

- Deploy AI service to reliable platform
- Use HTTPS for all AI service communication
- Enable fallback as safety net
- Monitor AI service availability

### Testing

- Test with AI service enabled
- Test with AI service disabled
- Test fallback mechanisms
- Verify error handling
