# AWS S3 Integration Setup Guide

This guide explains how to set up AWS S3 integration for the ATS System to handle file uploads.

## Overview

The system now supports uploading PDF and DOCX files directly to AWS S3, making them publicly accessible via direct URLs. This replaces local file storage and provides better scalability and reliability.

## Features

- **Direct S3 Upload**: Files are uploaded directly to AWS S3 bucket
- **Public Access**: Files are set with `ACL=public-read` for direct browser access
- **Unique Filenames**: Generated with timestamps and UUIDs to prevent conflicts
- **File Validation**: Checks file type (PDF/DOCX) and size (max 16MB)
- **Error Handling**: Comprehensive error handling for S3 operations
- **Status Endpoints**: Check S3 service configuration and health

## AWS Setup Requirements

### 1. Create AWS Account

If you don't have an AWS account, create one at [aws.amazon.com](https://aws.amazon.com)

### 2. Create S3 Bucket

1. Go to AWS S3 Console
2. Click "Create bucket"
3. Choose a unique bucket name (globally unique)
4. Select your preferred region
5. **Important**: Configure bucket for public access
   - Uncheck "Block all public access"
   - Acknowledge the warning about public access
6. Keep other settings as default
7. Click "Create bucket"

### 3. Configure Bucket Policy

To allow public read access, add this bucket policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

Replace `YOUR-BUCKET-NAME` with your actual bucket name.

### 4. Create IAM User

1. Go to AWS IAM Console
2. Click "Users" → "Add user"
3. Enter username (e.g., "ats-system-s3")
4. Select "Programmatic access"
5. Click "Next: Permissions"
6. Click "Attach existing policies directly"
7. Search for and select "AmazonS3FullAccess"
8. Click "Next: Tags" (optional)
9. Click "Next: Review"
10. Click "Create user"
11. **Important**: Save the Access Key ID and Secret Access Key

## Environment Configuration

### 1. Copy Environment Template

```bash
cp env.example .env
```

### 2. Update .env File

Edit the `.env` file with your AWS credentials:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_actual_access_key_id
AWS_SECRET_ACCESS_KEY=your_actual_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-unique-bucket-name

# Other settings...
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

## API Endpoints

### Upload File

```http
POST /upload
Content-Type: multipart/form-data

file: [PDF or DOCX file]
```

**Response:**

```json
{
  "success": true,
  "file_url": "https://your-bucket.s3.us-east-1.amazonaws.com/cv_uploads/20240101_123456_abc12345.pdf",
  "s3_key": "cv_uploads/20240101_123456_abc12345.pdf",
  "original_filename": "resume.pdf",
  "file_size": 245760,
  "content_type": "application/pdf",
  "uploaded_at": "2024-01-01T12:34:56.789Z"
}
```

### Check S3 Status

```http
GET /upload/status
```

**Response:**

```json
{
  "configured": true,
  "bucket_name": "your-bucket-name",
  "region": "us-east-1",
  "bucket_url": "https://your-bucket.s3.us-east-1.amazonaws.com",
  "credentials_configured": true
}
```

### Delete File

```http
DELETE /upload/{s3_key}
```

### Get File URL

```http
GET /upload/url/{s3_key}
```

## Integration with Application Submission

When a user submits a job application:

1. **File Upload**: CV file is uploaded to S3 via `/upload` endpoint
2. **URL Storage**: The S3 file URL is stored in the database instead of local filename
3. **Public Access**: Files are accessible via direct URLs in the browser
4. **AI Processing**: File content is extracted for CV evaluation
5. **Response**: Application response includes the S3 file URL

## Database Changes

The `cv_filename` field in the Application model now stores the full S3 URL instead of just the filename:

```python
# Before (local storage)
cv_filename = "resume.pdf"

# After (S3 storage)
cv_filename = "https://your-bucket.s3.us-east-1.amazonaws.com/cv_uploads/20240101_123456_abc12345.pdf"
```

## Security Considerations

1. **Public Access**: Files are publicly accessible - ensure no sensitive data
2. **File Validation**: Only PDF and DOCX files are allowed
3. **Size Limits**: Maximum file size is 16MB
4. **Unique Names**: Filenames include timestamps and UUIDs to prevent conflicts
5. **ACL Settings**: Files are set with `public-read` ACL for browser access

## Troubleshooting

### Common Issues

1. **"S3 service not configured"**

   - Check AWS credentials in `.env` file
   - Verify bucket name is correct
   - Ensure IAM user has S3 permissions

2. **"Access denied to S3 bucket"**

   - Check bucket policy allows public read access
   - Verify IAM user has `s3:PutObject` and `s3:PutObjectAcl` permissions

3. **"Bucket not found"**

   - Verify bucket name is correct
   - Check bucket exists in the specified region

4. **"File upload failed"**
   - Check file size (max 16MB)
   - Verify file type (PDF or DOCX only)
   - Check network connectivity to AWS

### Testing

1. **Test S3 Status**:

   ```bash
   curl http://localhost:4002/upload/status
   ```

2. **Test File Upload**:

   ```bash
   curl -X POST http://localhost:4002/upload \
     -F "file=@test.pdf"
   ```

3. **Test Application Submission**:
   ```bash
   curl -X POST http://localhost:4002/ats-checker/jobs/{job_id}/apply \
     -F "cv_file=@resume.pdf" \
     -F "candidate_email=test@example.com" \
     -F "candidate_name=Test User"
   ```

## Cost Considerations

- **S3 Storage**: ~$0.023 per GB per month
- **S3 Transfer**: ~$0.09 per GB for outbound data
- **API Requests**: ~$0.005 per 1,000 requests

For typical usage (1000 applications/month with 2MB files each):

- Storage: ~$0.05/month
- Transfer: ~$0.18/month
- Requests: ~$0.01/month
- **Total**: ~$0.24/month

## Best Practices

1. **Regular Cleanup**: Implement automatic cleanup of old files
2. **Monitoring**: Set up CloudWatch alerts for S3 usage
3. **Backup**: Consider cross-region replication for critical files
4. **Security**: Regularly rotate AWS access keys
5. **Cost Optimization**: Use S3 lifecycle policies to move old files to cheaper storage tiers

## Migration from Local Storage

If migrating from local file storage:

1. **Backup**: Backup all existing files
2. **Upload**: Upload existing files to S3
3. **Update Database**: Update `cv_filename` fields with S3 URLs
4. **Test**: Verify all file URLs work correctly
5. **Cleanup**: Remove local files after verification

## Support

For issues with S3 integration:

1. Check the application logs for detailed error messages
2. Verify AWS credentials and permissions
3. Test S3 connectivity using AWS CLI
4. Check bucket policy and CORS settings
