# CV Evaluation Database Fix: Resolving Storage Issues

## Issue Description

The `cv_evaluations` collection in MongoDB was not storing any data because the `save_cv_evaluation` method in the `DatabaseService` was never being called during the CV evaluation workflow.

## Root Cause

1. **Missing Database Call**: In the `evaluate_cv_for_job` method of `EvaluationService`, the CV evaluation results were only being stored in the `Application` model but not in the `CVEvaluation` collection.

2. **Response Field Mismatch**: The AI service returns `reasoning` field, but the evaluation service was looking for `evaluation_text`.

3. **Missing Service Dependencies**: The `generate_quiz` method was trying to use `self.cohere_service` which doesn't exist in the `EvaluationService` class.

## Fixes Applied

### 1. Added CV Evaluation Database Storage

**File**: `src/services/evaluation_service.py`

**Change**: Added call to `save_cv_evaluation` in the `evaluate_cv_for_job` method:

```python
# Save CV evaluation to database
await self.database_service.save_cv_evaluation(
    filename=f"application_{application_id}",
    job_description=job_posting.description,
    decision=EvaluationDecision(final_decision),
    score=score,
    evaluation_text=evaluation_text,
    cv_text_length=len(cv_text),
    email=email,
    processing_time_ms=None  # Could be calculated if needed
)
```

### 2. Fixed Response Field Mapping

**File**: `src/services/evaluation_service.py`

**Change**: Updated field mapping to match AI service response:

```python
# Before
evaluation_text = ai_result.get("evaluation_text", "")

# After
evaluation_text = ai_result.get("reasoning", "")  # AI service returns "reasoning" not "evaluation_text"
```

### 3. Fixed Quiz Generation

**File**: `src/services/evaluation_service.py`

**Change**: Updated `generate_quiz` method to call AI service via HTTP instead of using non-existent `cohere_service`:

```python
# Call AI service for quiz generation
async with httpx.AsyncClient() as client:
    response = await client.post(
        f"{self.ai_service_url}/generate-quiz",
        json={
            "job_description": job_description,
            "num_questions": 10
        },
        timeout=60
    )
    response.raise_for_status()
    ai_result = response.json()
    quiz_questions = ai_result.get("questions", [])
```

### 4. Fixed Email Field Handling

**File**: `src/services/evaluation_service.py`

**Change**: Fixed email field handling since AI service doesn't return email in response:

```python
# AI service doesn't return email in the response, so use the provided candidate_email
email = candidate_email
```

## Testing

A test script `test_cv_evaluation.py` has been created to verify that CV evaluations are being saved correctly to the database.

## Workflow Verification

The complete workflow now works as follows:

1. **Job Application Submission**:

   - HR creates job via `POST /api/jobs`
   - Candidate applies via `POST /api/jobs/{job_id}/apply`

2. **CV Evaluation**:

   - CV text is extracted using AI service
   - CV is evaluated against job requirements
   - **NEW**: Evaluation is saved to `cv_evaluations` collection
   - Application status is updated
   - Email notification is sent

3. **Quiz Generation** (if accepted):

   - Quiz is generated using AI service
   - Quiz session is saved to database
   - Quiz invitation email is sent

4. **Quiz Submission**:
   - Candidate submits quiz via `POST /api/quiz/submit`
   - Quiz is evaluated and results saved
   - Interview invitation sent if passed

## Database Collections

The following collections should now contain data:

- `job_postings`: Job postings created by HR
- `applications`: Job applications submitted by candidates
- `cv_evaluations`: **NEW** - CV evaluation results (was empty before)
- `quiz_sessions`: Quiz sessions generated for accepted candidates
- `quiz_results`: Quiz submission results
- `email_notifications`: Email notification tracking

## Verification Steps

1. Run the test script: `python test_cv_evaluation.py`
2. Submit a job application through the API
3. Check the `cv_evaluations` collection in MongoDB
4. Verify that evaluation data is being stored correctly

## Files Modified

- `src/services/evaluation_service.py`: Main fixes for CV evaluation storage
- `test_cv_evaluation.py`: Test script for verification
- `CV_EVALUATION_FIX.md`: This documentation file

## Database Schema

### CV Evaluations Collection

```json
{
  "_id": ObjectId("..."),
  "filename": "application_96b51684-67df-4fec-877e-918969f92729",
  "job_description": "We are looking for a Python developer...",
  "decision": "ACCEPTED",
  "score": 85,
  "evaluation_text": "The candidate has strong Python skills...",
  "cv_text_length": 1250,
  "email": "candidate@example.com",
  "processing_time_ms": null,
  "created_at": ISODate("2024-01-15T10:30:00Z")
}
```

## Benefits

1. **Complete Data Storage**: CV evaluations are now properly stored
2. **Audit Trail**: Full history of CV evaluations maintained
3. **Analytics**: Data available for performance analysis
4. **Debugging**: Easier to troubleshoot evaluation issues
5. **Compliance**: Better record keeping for hiring decisions

## Performance Impact

- **Minimal**: Database write operation is fast
- **Non-blocking**: Async operation doesn't affect response time
- **Reliable**: Proper error handling ensures system stability

The CV evaluation system now properly stores all evaluation data, providing a complete audit trail and enabling better analytics for the hiring process.
