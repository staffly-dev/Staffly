# File Upload Issue Resolution

## Problem Description

The ATS system was experiencing a "FILE_UPLOADS_DISABLED" error when trying to submit job applications. The error occurred because the `FileUploadSecurityMiddleware` was blocking all file uploads, including legitimate job application CV uploads.

## Root Cause

The `FileUploadSecurityMiddleware` was configured to block ALL file uploads for security reasons, but it was being too aggressive and blocking the job application endpoint `/api/jobs/{job_id}/apply` which is a legitimate use case.

## Solution Implemented

### 1. Updated FileUploadSecurityMiddleware

- **Removed** `/api/jobs/` from the blocked endpoints list
- **Added** specific allowed upload patterns for job applications:
  - `/api/jobs/.*/apply` (API gateway pattern)
  - `/ats-checker/jobs/.*/apply` (Original route pattern)
- **Added** configuration-based control for file uploads

### 2. Added Configuration Options

New environment variables added to control file upload behavior:

```bash
# File Upload Security Configuration
ALLOW_JOB_APPLICATION_UPLOADS=true    # Allow CV uploads for job applications
ALLOW_GENERAL_FILE_UPLOADS=false      # Block general file uploads for security
```

### 3. Enhanced Logging

Added detailed logging to help debug file upload issues:

- Request path logging
- Allowed/blocked endpoint detection
- Upload pattern matching results

### 4. Conditional Middleware

The `FileUploadSecurityMiddleware` is now conditionally added based on configuration:

- If both upload types are enabled, the middleware is disabled
- Otherwise, the middleware runs with the updated rules

## Files Modified

1. **`src/middlewares/security.py`**

   - Updated `FileUploadSecurityMiddleware` to allow job application uploads
   - Added support for both API gateway and original route patterns
   - Enhanced logging for debugging

2. **`src/config/settings.py`**

   - Added `ALLOW_JOB_APPLICATION_UPLOADS` setting
   - Added `ALLOW_GENERAL_FILE_UPLOADS` setting

3. **`src/main.py`**

   - Conditional middleware addition based on configuration
   - Better logging for middleware status

4. **`.example.env`**
   - Added new configuration options with examples

## How to Deploy the Fix

### 1. Update Environment Variables

Add these variables to your production environment:

```bash
ALLOW_JOB_APPLICATION_UPLOADS=true
ALLOW_GENERAL_FILE_UPLOADS=false
```

### 2. Deploy the Updated Code

The changes will automatically:

- Allow job application CV uploads
- Maintain security for other file upload endpoints
- Provide better logging for debugging

### 3. Test the Endpoint

The job application endpoint should now work correctly:

- **Local**: `http://localhost:4000/ats-checker/jobs/{job_id}/apply`
- **Production**: `https://ats-system-checker-backend-production.up.railway.app/api/jobs/{job_id}/apply`

## Security Considerations

- **Job Application Uploads**: Now allowed and properly validated
- **General File Uploads**: Still blocked for security
- **File Validation**: Maintained in the controller layer
- **Rate Limiting**: Still active through other middleware

## Testing

Use the provided test script to verify the fix:

```bash
cd services/ats-system-checker
python test_job_application.py
```

## Monitoring

The enhanced logging will help monitor:

- File upload attempts
- Blocked requests
- Allowed uploads
- Security events

## Rollback Plan

If issues arise, you can temporarily disable the middleware by setting:

```bash
ALLOW_JOB_APPLICATION_UPLOADS=true
ALLOW_GENERAL_FILE_UPLOADS=true
```

This will completely disable the `FileUploadSecurityMiddleware` while maintaining other security measures.
