# ATS System JWT Authentication Endpoints

## Overview

The ATS System now requires JWT authentication for all sensitive endpoints. These endpoints validate JWT tokens from the API Gateway and ensure users can only access their own data.

## Authentication Model

All authenticated endpoints require the following request format:

```json
{
  "user_id": "68a140ef2549fe9b5ea0b961",
  "created_by": "68a140ef2549fe9b5ea0b961",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGExNDBlZjI1NDlmZTliNWVhMGI5NjEiLCJpYXQiOjE3NTU1Nzc1NzYsImV4cCI6MTc1NTY2Mzk3NiwiYXVkIjpbInVzZXIiXX0.wRI2byb2Lud2QVWsj-OaTaHiq-I-YDXMIhi7214zLxE"
}
```

### Authentication Fields

| Field          | Type   | Required | Description                             |
| -------------- | ------ | -------- | --------------------------------------- |
| `user_id`      | string | Yes      | User ID from API Gateway                |
| `created_by`   | string | Yes      | User who created the records            |
| `access_token` | string | Yes      | Valid JWT access token from API Gateway |

## Authenticated Endpoints

### 1. User Statistics Endpoint

## Endpoint Details

- **URL**: `POST /user-statistics`
- **Authentication**: Required (JWT token from API Gateway)
- **Content-Type**: `application/json`

## Request Format

```json
{
  "user_id": "68a140ef2549fe9b5ea0b961",
  "created_by": "68a140ef2549fe9b5ea0b961",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGExNDBlZjI1NDlmZTliNWVhMGI5NjEiLCJpYXQiOjE3NTU1Nzc1NzYsImV4cCI6MTc1NTY2Mzk3NiwiYXVkIjpbInVzZXIiXX0.wRI2byb2Lud2QVWsj-OaTaHiq-I-YDXMIhi7214zLxE"
}
```

### Request Fields

| Field          | Type   | Required | Description                             |
| -------------- | ------ | -------- | --------------------------------------- |
| `user_id`      | string | Yes      | User ID from API Gateway                |
| `created_by`   | string | Yes      | User who created the records            |
| `access_token` | string | Yes      | Valid JWT access token from API Gateway |

## Response Format

```json
{
  "user_id": "68a140ef2549fe9b5ea0b961",
  "created_by": "68a140ef2549fe9b5ea0b961",
  "total_applications": 25,
  "total_evaluations": 25,
  "acceptance_rate": 72.0,
  "average_score": 78.5,
  "quiz_pass_rate": 85.0,
  "daily_stats": {
    "20250119": 5,
    "20250120": 8,
    "20250121": 12
  },
  "last_activity": "2025-01-21T15:30:00"
}
```

### Response Fields

| Field                | Type    | Description                             |
| -------------------- | ------- | --------------------------------------- |
| `user_id`            | string  | User ID from API Gateway                |
| `created_by`         | string  | User who created the records            |
| `total_applications` | integer | Total applications created by this user |
| `total_evaluations`  | integer | Total CVs evaluated for this user       |
| `acceptance_rate`    | float   | CV acceptance rate percentage           |
| `average_score`      | float   | Average CV evaluation score             |
| `quiz_pass_rate`     | float   | Quiz pass rate percentage               |
| `daily_stats`        | object  | Daily activity counts for last 30 days  |
| `last_activity`      | string  | Last activity timestamp (ISO format)    |

## Authentication

The endpoint validates JWT tokens from the API Gateway:

1. **Token Validation**: Decodes and validates the JWT token
2. **User Verification**: Ensures the token's `userId` matches the requested `user_id`
3. **Access Control**: Only allows users to access their own statistics

## Error Responses

### 401 Unauthorized

```json
{
  "detail": "Token has expired"
}
```

### 403 Forbidden

```json
{
  "detail": "Access token user_id does not match requested user_id"
}
```

### 500 Internal Server Error

```json
{
  "detail": "Failed to retrieve user statistics: [error message]"
}
```

## Database Schema Updates

The following database models have been updated to support user-specific statistics:

- **CVEvaluation**: Added `created_by` field
- **QuizSession**: Added `created_by` field
- **QuizResult**: Added `created_by` field

New indexes have been created on the `created_by` field for efficient querying.

## Usage Examples

### cURL Example

```bash
curl -X POST "http://localhost:4002/user-statistics" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "68a140ef2549fe9b5ea0b961",
    "created_by": "68a140ef2549fe9b5ea0b961",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGExNDBlZjI1NDlmZTliNWVhMGI5NjEiLCJpYXQiOjE3NTU1Nzc1NzYsImV4cCI6MTc1NTY2Mzk3NiwiYXVkIjpbInVzZXIiXX0.wRI2byb2Lud2QVWsj-OaTaHiq-I-YDXMIhi7214zLxE"
  }'
```

### Python Example

```python
import requests

url = "http://localhost:4002/user-statistics"
data = {
    "user_id": "68a140ef2549fe9b5ea0b961",
    "created_by": "68a140ef2549fe9b5ea0b961",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGExNDBlZjI1NDlmZTliNWVhMGI5NjEiLCJpYXQiOjE3NTU1Nzc1NzYsImV4cCI6MTc1NTY2Mzk3NiwiYXVkIjpbInVzZXIiXX0.wRI2byb2Lud2QVWsj-OaTaHiq-I-YDXMIhi7214zLxE"
}

response = requests.post(url, json=data)
if response.status_code == 200:
    stats = response.json()
    print(f"User has {stats['total_applications']} applications")
    print(f"Acceptance rate: {stats['acceptance_rate']}%")
```

## Testing

Run the test script to verify the endpoint components:

```bash
cd services/ats-system-checker
python test_user_statistics.py
```

## Dependencies

- **PyJWT**: For JWT token validation
- **FastAPI**: For the REST API framework
- **MongoDB**: For data storage and querying

## Security Considerations

1. **Token Validation**: JWT tokens are validated without signature verification (trusted source)
2. **User Isolation**: Users can only access their own statistics
3. **Input Validation**: All input fields are validated using Pydantic models
4. **Error Handling**: Sensitive information is not exposed in error messages

### 2. Create Job Posting Endpoint

- **URL**: `POST /jobs`
- **Authentication**: Required (JWT token from API Gateway)
- **Content-Type**: `multipart/form-data`

#### Request Format

The endpoint accepts form data with the following fields:

**Authentication Fields:**

- `user_id`: User ID from API Gateway
- `created_by`: User who created the records
- `access_token`: Valid JWT access token from API Gateway

**Job Posting Fields:**

- `title`: Job title (e.g., "Senior Python Developer")
- `description`: Detailed job description
- `required_skills`: Comma-separated list of required skills
- `additional_details`: Optional additional information
- `hr_email`: HR contact email
- `hr_name`: HR contact name
- `evaluation_threshold`: Minimum CV score (0-100)
- `quiz_required`: Whether quiz is required (true/false)
- `quiz_pass_threshold`: Minimum quiz score to pass (0-10)

#### cURL Example

```bash
curl -X POST "http://localhost:4002/ats-checker/jobs" \
  -F "user_id=68a140ef2549fe9b5ea0b961" \
  -F "created_by=68a140ef2549fe9b5ea0b961" \
  -F "access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGExNDBlZjI1NDlmZTliNWVhMGI5NjEiLCJpYXQiOjE3NTU1Nzc1NzYsImV4cCI6MTc1NTY2Mzk3NiwiYXVkIjpbInVzZXIiXX0.wRI2byb2Lud2QVWsj-OaTaHiq-I-YDXMIhi7214zLxE" \
  -F "title=Senior Python Developer" \
  -F "description=We are looking for an experienced Python developer..." \
  -F "required_skills=Python, FastAPI, MongoDB" \
  -F "evaluation_threshold=70" \
  -F "quiz_required=true" \
  -F "quiz_pass_threshold=7"
```

### 3. Get All Quiz Users Endpoint

- **URL**: `POST /quiz/users`
- **Authentication**: Required (JWT token from API Gateway)
- **Content-Type**: `application/json`

#### Request Format

```json
{
  "user_id": "68a140ef2549fe9b5ea0b961",
  "created_by": "68a140ef2549fe9b5ea0b961",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGExNDBlZjI1NDlmZTliNWVhMGI5NjEiLCJpYXQiOjE3NTU1Nzc1NzYsImV4cCI6MTc1NTY2Mzk3NiwiYXVkIjpbInVzZXIiXX0.wRI2byb2Lud2QVWsj-OaTaHiq-I-YDXMIhi7214zLxE"
}
```

### 4. Get All Applications Endpoint

- **URL**: `POST /applications`
- **Authentication**: Required (JWT token from API Gateway)
- **Content-Type**: `application/json`

#### Request Format

```json
{
  "user_id": "68a140ef2549fe9b5ea0b961",
  "created_by": "68a140ef2549fe9b5ea0b961",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGExNDBlZjI1NDlmZTliNWVhMGI5NjEiLCJpYXQiOjE3NTU1Nzc1NzYsImV4cCI6MTc1NTY2Mzk3NiwiYXVkIjpbInVzZXIiXX0.wRI2byb2Lud2QVWsj-OaTaHiq-I-YDXMIhi7214zLxE"
}
```

### 5. Get Application by ID Endpoint

- **URL**: `POST /applications/{application_id}`
- **Authentication**: Required (JWT token from API Gateway)
- **Content-Type**: `application/json`

#### Request Format

```json
{
  "user_id": "68a140ef2549fe9b5ea0b961",
  "created_by": "68a140ef2549fe9b5ea0b961",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGExNDBlZjI1NDlmZTliNWVhMGI5NjEiLCJpYXQiOjE3NTU1Nzc1NzYsImV4cCI6MTc1NTY2Mzk3NiwiYXVkIjpbInVzZXIiXX0.wRI2byb2Lud2QVWsj-OaTaHiq-I-YDXMIhi7214zLxE"
}
```

## Important Notes

1. **Method Changes**: Some endpoints have been changed from GET to POST to accommodate the authentication request body
2. **Content-Type Changes**: The Create Job Posting endpoint now accepts `multipart/form-data` instead of JSON to maintain compatibility with existing frontend implementations
3. **Token Validation**: All endpoints validate JWT tokens and ensure user_id matches the token
4. **Security**: Users can only access data associated with their user_id
5. **Error Handling**: Proper error responses for invalid/expired tokens
6. **Backward Compatibility**: The Create Job Posting endpoint maintains the same field structure while adding JWT authentication

## Future Enhancements

- Add role-based access control for HR managers
- Implement caching for frequently accessed statistics
- Add real-time statistics updates via WebSocket
- Support for date range filtering
- Export functionality for reports
