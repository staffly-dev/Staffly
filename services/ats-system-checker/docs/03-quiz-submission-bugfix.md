# Quiz Submission Bugfix: Variable Scope Resolution

## Issue Description

The quiz submission was failing with the error:

```
"cannot access local variable 'application_id' where it is not associated with a value"
```

This occurred because the `application_id` variable was being used in the log message and database operations before it was properly defined in the `evaluate_quiz_submission` method.

## Root Cause

In the `evaluate_quiz_submission` method, the `application_id` variable was being referenced in two places before it was defined:

1. **Line 343**: In the log message at the beginning of the method
2. **Line 420**: In the `save_quiz_result` call before the application_id extraction

The `application_id` was only being extracted from the quiz session's `associated_cv_filename` later in the method (around line 430).

## Fix Applied

### 1. Removed application_id from initial log message

**File**: `src/services/evaluation_service.py`

**Before**:

```python
logger.info(f"🧮 Evaluating quiz submission for quiz session: {quiz_session_id}, application: {application_id}, email: {email}")
```

**After**:

```python
logger.info(f"🧮 Evaluating quiz submission for quiz session: {quiz_session_id}, email: {email}")
```

### 2. Moved application_id extraction earlier in the method

**Before**: Application_id was extracted after the quiz result was saved
**After**: Application_id is extracted before the quiz result is saved

```python
# Get application_id from quiz session
application_id = None
if quiz_session.associated_cv_filename:
    # Extract application_id from associated_cv_filename (format: "application_{application_id}")
    if quiz_session.associated_cv_filename.startswith("application_"):
        application_id = quiz_session.associated_cv_filename.replace("application_", "")
        logger.info(f" Extracted application_id: {application_id} from quiz session")
    else:
        logger.warning(f" Quiz session associated_cv_filename format unexpected: {quiz_session.associated_cv_filename}")
else:
    logger.warning(" Quiz session has no associated_cv_filename")
```

### 3. Added better logging and error handling

- Added logging to show when application_id is successfully extracted
- Added warnings for unexpected filename formats
- Added warnings when no associated_cv_filename is present

## Test Results

After applying the fix, the quiz submission now works correctly:

```
✅ Quiz submission successful!
   - Score: 10/10
   - Status: PASSED
   - Percentage: 100.0%
   - Message: Quiz completed successfully!
```

## Files Modified

- `src/services/evaluation_service.py` - Fixed application_id variable scope and extraction order

## Benefits

1. **Fixed Quiz Submission**: Quiz submissions now work without errors
2. **Better Error Handling**: Clear logging for debugging application_id extraction
3. **Proper Variable Scope**: All variables are defined before use
4. **Maintained Security**: All security features from the previous fix remain intact

## Verification

The fix has been tested and verified to work correctly:

- Quiz submission accepts `quiz_session_id` parameter
- Application_id is properly extracted from quiz session
- Quiz results are saved to database
- Quiz session status is updated to "COMPLETED"
- Application status is updated with quiz results
