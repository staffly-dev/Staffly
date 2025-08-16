# Security Implementation Guide: Protecting the ATS System

## Overview

Two critical security features have been implemented to protect the ATS system:

1. **Duplicate CV Upload Prevention** - Prevents candidates from submitting multiple applications for the same job
2. **Quiz Email Validation** - Ensures only the original applicant can take the quiz

## Security Feature 1: Duplicate CV Upload Prevention

### Problem

Candidates could potentially upload multiple CVs for the same job posting, which could:

- Spam the system with duplicate applications
- Create confusion in the evaluation process
- Allow candidates to game the system

### Solution

**Email-based duplicate detection** - Each email address can only apply once per job posting.

### Implementation

#### Database Service

**File**: `src/services/database_service.py`

**New Method**: `check_duplicate_email_application()`

```python
async def check_duplicate_email_application(self, email: str, job_id: str) -> Optional["Application"]:
    """
    Check if an email has already applied for a specific job

    Args:
        email: Candidate email address
        job_id: Job posting ID

    Returns:
        Optional[Application]: Existing application if found, None otherwise
    """
```

#### Job Controller

**File**: `src/controllers/job.controller.py`

**Security Check Added**:

```python
# SECURITY CHECK: Prevent duplicate applications by email
if final_email and final_email != "placeholder@example.com":
    existing_application = await self.database_service.check_duplicate_email_application(final_email, job_id)
    if existing_application:
        raise HTTPException(
            status_code=409,
            detail=f"An application with email '{final_email}' has already been submitted for this job posting. Each candidate can only apply once per job."
        )
```

### API Response

**When duplicate email detected**:

```json
{
  "success": false,
  "error": true,
  "message": "An application with email 'candidate@example.com' has already been submitted for this job posting. Each candidate can only apply once per job.",
  "status_code": 409
}
```

## Security Feature 2: Quiz Email Validation

### Problem

Anyone with a quiz link could potentially take the quiz, even if they weren't the original applicant.

### Solution

**Email validation** - The email used when taking the quiz must match the email used in the original CV submission.

### Implementation

#### Quiz Routes

**File**: `src/routes/quiz_routes.py`

**Email Parameter Made Required**:

```python
@router.post("/submit", response_model=APIResponse, summary="Submit Quiz")
async def submit_quiz(
    answers: str = Form(..., description="Quiz answers as JSON string"),
    quiz_data: str = Form(..., description="Quiz questions data as JSON string"),
    quiz_session_id: str = Form(..., description="Quiz session ID (required)"),
    email: str = Form(..., description="Candidate email address (required for security validation)"),
    controller: QuizController = Depends(get_quiz_controller)
):
```

#### Evaluation Service

**File**: `src/services/evaluation_service.py`

**Email Validation Added**:

```python
# SECURITY CHECK: Validate email matches the quiz session email
if quiz_session.candidate_email and email.lower() != quiz_session.candidate_email.lower():
    raise ValueError(f"Email address '{email}' does not match the email used in the original application ('{quiz_session.candidate_email}'). Please use the same email address that was used when submitting your CV.")
```

#### Database Service

**File**: `src/services/database_service.py`

**New Method**: `get_application_email_by_session_id()`

```python
async def get_application_email_by_session_id(self, quiz_session_id: str) -> Optional[str]:
    """
    Get the original application email from quiz session ID

    Args:
        quiz_session_id: Quiz session ID

    Returns:
        Optional[str]: Original application email if found, None otherwise
    """
```

### API Response

**When email doesn't match**:

```json
{
  "success": false,
  "error": true,
  "message": "Email address 'wrong@example.com' does not match the email used in the original application ('correct@example.com'). Please use the same email address that was used when submitting your CV.",
  "status_code": 400
}
```

## Security Workflow

### Application Submission

1. **CV Upload** → System extracts/validates email
2. **Duplicate Check** → System checks if email already applied for this job
3. **If Duplicate** → Returns 409 error with clear message
4. **If New** → Proceeds with application processing

### Quiz Submission

1. **Quiz Access** → User accesses quiz via quiz_session_id
2. **Email Required** → User must provide email when submitting quiz
3. **Email Validation** → System compares with original application email
4. **If Mismatch** → Returns 400 error with clear message
5. **If Match** → Proceeds with quiz evaluation

## API Changes

### Quiz Submission Endpoint

**Before**:

```
POST /ats-checker/quiz/submit
{
  "answers": "...",
  "quiz_data": "...",
  "quiz_session_id": "...",
  "email": "..."  // Optional
}
```

**After**:

```
POST /ats-checker/quiz/submit
{
  "answers": "...",
  "quiz_data": "...",
  "quiz_session_id": "...",
  "email": "..."  // Required
}
```

### Job Application Endpoint

**No changes to API** - Security check is internal

## Error Messages

### Duplicate Application

```
HTTP 409 Conflict
"An application with email 'candidate@example.com' has already been submitted for this job posting. Each candidate can only apply once per job."
```

### Quiz Email Mismatch

```
HTTP 400 Bad Request
"Email address 'wrong@example.com' does not match the email used in the original application ('correct@example.com'). Please use the same email address that was used when submitting your CV."
```

## Testing Results

✅ **Duplicate Email Prevention**:

- Successfully detects existing applications
- Returns appropriate 409 error
- Clear error message

✅ **Quiz Email Validation**:

- Successfully validates email matches
- Rejects wrong email addresses
- Clear error message with original email

✅ **Database Methods**:

- `check_duplicate_email_application()` works correctly
- `get_application_email_by_session_id()` works correctly
- `get_application_by_email_and_job()` works correctly

## Security Benefits

1. **Prevents Spam**: No duplicate applications from same email
2. **Maintains Integrity**: Only original applicant can take quiz
3. **Clear Feedback**: Users get specific error messages
4. **Audit Trail**: All security checks are logged
5. **Email Consistency**: Ensures same email throughout the process

## Files Modified

- `src/services/database_service.py` - Added security check methods
- `src/controllers/job.controller.py` - Added duplicate email check
- `src/routes/quiz_routes.py` - Made email required for quiz submission
- `src/controllers/quiz.controller.py` - Updated to require email
- `src/services/evaluation_service.py` - Added email validation logic

## Usage Examples

### Frontend Implementation

```javascript
// Quiz submission with email validation
const submitQuiz = async (quizData) => {
  const formData = new FormData();
  formData.append("answers", JSON.stringify(answers));
  formData.append("quiz_data", JSON.stringify(quizData));
  formData.append("quiz_session_id", quizSessionId);
  formData.append("email", userEmail); // Must match original application

  const response = await fetch("/ats-checker/quiz/submit", {
    method: "POST",
    body: formData,
  });

  if (response.status === 400) {
    // Handle email mismatch error
    const error = await response.json();
    alert(error.message);
  }
};
```

### Error Handling

```javascript
// Handle duplicate application error
if (response.status === 409) {
  const error = await response.json();
  alert("You have already applied for this position.");
}
```

## Future Enhancements

1. **Rate Limiting**: Add rate limiting per IP address
2. **Email Verification**: Send verification emails before allowing quiz
3. **Session Management**: Add session-based authentication
4. **Audit Logging**: Enhanced logging of security events
