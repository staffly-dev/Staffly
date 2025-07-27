# Quiz Security Enhancement: Preventing Multiple Submissions

## Issues Identified

1. **Quiz can be taken multiple times** - No validation to prevent multiple submissions
2. **Quiz accessible via both quiz_session_id and application_id** - Should only be accessible via quiz_session_id
3. **Missing application_id in quiz responses** - Need to link application_id to quiz_session_id properly
4. **No proper validation** - Quiz sessions weren't properly validated before submission

## Fixes Applied

### 1. Quiz Submission Security

**File**: `src/services/evaluation_service.py`

**Changes**:

- Added `quiz_session_id` as required parameter
- Added validation to prevent multiple submissions
- Added quiz session status validation
- Added proper error handling for invalid quiz sessions

```python
# Check if quiz has already been completed
existing_result = await self.database_service.get_quiz_result_by_session_id(quiz_session_id)
if existing_result:
    raise ValueError("Quiz has already been completed. You cannot submit answers multiple times.")

# Get quiz session to validate it exists and is accessible
quiz_session = await self.database_service.get_quiz_session_by_id(quiz_session_id)
if not quiz_session:
    raise ValueError("Quiz session not found or invalid")

if quiz_session.status == "COMPLETED":
    raise ValueError("Quiz has already been completed")

if quiz_session.status == "EXPIRED":
    raise ValueError("Quiz session has expired")
```

### 2. Quiz Session Status Management

**File**: `src/services/database_service.py`

**New Methods Added**:

- `get_quiz_result_by_session_id()` - Check if quiz already completed
- `update_quiz_session_status()` - Update quiz session status

**Changes**:

- Quiz session status is updated to "COMPLETED" after submission
- Proper completion timestamp is recorded

### 3. Quiz Routes Security

**File**: `src/routes/quiz_routes.py`

**Changes**:

- Removed `application_id` from quiz submission endpoint
- Made `quiz_session_id` required parameter
- Updated documentation to reflect security requirements

```python
@router.post("/submit", response_model=APIResponse, summary="Submit Quiz")
async def submit_quiz(
    answers: str = Form(..., description="Quiz answers as JSON string"),
    quiz_data: str = Form(..., description="Quiz questions data as JSON string"),
    quiz_session_id: str = Form(..., description="Quiz session ID (required)"),
    email: Optional[str] = Form(None, description="Candidate email address"),
    controller: QuizController = Depends(get_quiz_controller)
):
```

### 4. Application ID Linking

**File**: `src/services/database_service.py`

**Changes**:

- Added application_id extraction from quiz session's `associated_cv_filename`
- Application_id is now included in all quiz responses
- Proper linking between application and quiz session

```python
# Extract application_id from associated_cv_filename
application_id = None
if quiz_session.associated_cv_filename and quiz_session.associated_cv_filename.startswith("application_"):
    application_id = quiz_session.associated_cv_filename.replace("application_", "")
```

### 5. API Response Models

**File**: `src/models/api_models.py`

**Changes**:

- Added `application_id` field to `QuizUserInfoResponse`
- Added `application_id` field to `QuizDisplayResponse`
- Updated all related response models

### 6. Quiz Controller Updates

**File**: `src/controllers/quiz.controller.py`

**Changes**:

- Updated method signatures to require `quiz_session_id`
- Removed `application_id` parameter from quiz evaluation
- Added application_id to response data

## New Quiz Workflow

### Before (Insecure):

1. Quiz could be submitted multiple times
2. Quiz accessible via application_id
3. No validation of quiz session status
4. Missing application_id in responses

### After (Secure):

1. **Quiz can only be submitted once per session**
2. **Quiz only accessible via quiz_session_id**
3. **Full validation of quiz session status**
4. **Application_id properly linked and included in responses**

## API Changes

### Quiz Submission Endpoint

**Before**:

```
POST /api/quiz/submit
{
  "answers": "...",
  "quiz_data": "...",
  "email": "...",
  "application_id": "..."  // Optional
}
```

**After**:

```
POST /api/quiz/submit
{
  "answers": "...",
  "quiz_data": "...",
  "quiz_session_id": "...",  // Required
  "email": "..."  // Optional
}
```

### Quiz Display Response

**Before**:

```json
{
  "quiz_session_id": "...",
  "questions": [...],
  // ... other fields
}
```

**After**:

```json
{
  "quiz_session_id": "...",
  "application_id": "...",  // NEW
  "questions": [...],
  // ... other fields
}
```

### Quiz Users Response

**Before**:

```json
{
  "quiz_users": [
    {
      "quiz_session_id": "..."
      // ... other fields
    }
  ]
}
```

**After**:

```json
{
  "quiz_users": [
    {
      "application_id": "...", // NEW
      "quiz_session_id": "..."
      // ... other fields
    }
  ]
}
```

## Security Improvements

1. **Single Submission**: Each quiz session can only be submitted once
2. **Session Validation**: Quiz sessions are validated before allowing submission
3. **Status Tracking**: Quiz session status is properly tracked (GENERATED → IN_PROGRESS → COMPLETED)
4. **Proper Linking**: Application_id is properly linked to quiz_session_id
5. **Error Handling**: Clear error messages for invalid quiz sessions

## Testing

To test the new security features:

1. **Try to submit the same quiz twice** - Should get error: "Quiz has already been completed"
2. **Try to access quiz with invalid session ID** - Should get error: "Quiz session not found"
3. **Check quiz responses** - Should include application_id in all responses
4. **Verify quiz status updates** - Should see status change from IN_PROGRESS to COMPLETED

## Files Modified

- `src/services/evaluation_service.py` - Main security fixes
- `src/services/database_service.py` - New validation methods
- `src/routes/quiz_routes.py` - Updated API endpoints
- `src/controllers/quiz.controller.py` - Updated controller logic
- `src/models/api_models.py` - Updated response models

## Benefits

1. **Security**: Prevents quiz manipulation and multiple submissions
2. **Data Integrity**: Ensures quiz results are accurate and reliable
3. **Proper Linking**: Application_id is now properly linked to quiz sessions
4. **Better UX**: Clear error messages for invalid quiz sessions
5. **Audit Trail**: Complete tracking of quiz session lifecycle
