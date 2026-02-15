# TypeScript Migration Guide

## Overview

The ATS System Checker service has been successfully migrated from Python (FastAPI) to TypeScript (Express.js). This document outlines the migration details, changes, and how to work with the new codebase.

## Migration Summary

### Technology Stack Changes

| Component | Before (Python) | After (TypeScript) |
|-----------|----------------|-------------------|
| Framework | FastAPI | Express.js |
| Language | Python 3.9+ | TypeScript/Node.js 20+ |
| Database ODM | Beanie (Motor) | Mongoose |
| Validation | Pydantic | Zod |
| AWS SDK | boto3 | @aws-sdk/client-s3 |
| File Upload | FastAPI UploadFile | Multer |
| Async | asyncio/await | async/await (native) |

### Architecture Preservation

The migration maintains the same:
- ✅ API endpoint structure
- ✅ Database schema and collections
- ✅ Authentication flow
- ✅ Security features
- ✅ Business logic
- ✅ Environment variables

## Project Structure

```
src/
├── config/
│   ├── env.config.ts          # Environment configuration (replaces settings.py)
│   └── database.config.ts     # Database connection (replaces database.py)
├── controllers/               # Business logic (same structure)
│   ├── job.controller.ts
│   ├── application.controller.ts
│   ├── quiz.controller.ts
│   ├── statistics.controller.ts
│   ├── health.controller.ts
│   └── aws_s3.controller.ts
├── models/
│   ├── database.models.ts     # Mongoose schemas (replaces Beanie models)
│   ├── api.models.ts          # TypeScript interfaces (replaces Pydantic models)
│   └── evaluation.models.ts  # Evaluation types
├── routes/                     # Express routers (replaces FastAPI routers)
│   ├── jobs.routes.ts
│   ├── applications.routes.ts
│   ├── quiz.routes.ts
│   ├── statistics.routes.ts
│   ├── aws_s3.routes.ts
│   └── health.routes.ts
├── services/
│   ├── database.service.ts   # Database operations
│   ├── s3.service.ts          # AWS S3 integration
│   ├── email.service.ts       # Email notifications
│   ├── evaluation.service.ts  # CV evaluation & quiz
│   └── template.service.ts   # HTML templates
├── middlewares/
│   ├── errorHandler.middleware.ts
│   ├── logging.middleware.ts
│   └── security.middleware.ts
├── utils/
│   ├── jwt_utils.ts
│   ├── gateway_client.ts
│   ├── responses.ts
│   ├── logging_config.ts
│   ├── dependencies.ts
│   └── asyncHandler.ts
└── index.ts                   # Main application (replaces main.py)
```

## Key Differences

### 1. Request/Response Handling

**Python (FastAPI):**
```python
@router.get("/jobs")
async def get_jobs(controller: JobController = Depends(get_job_controller)):
    return await controller.get_all_job_postings()
```

**TypeScript (Express):**
```typescript
router.get(
  "/jobs",
  asyncHandler(async (req: Request, res: Response) => {
    const controller = new JobController(...);
    return await controller.get_all_job_postings(req, res);
  })
);
```

### 2. Database Models

**Python (Beanie):**
```python
class JobPosting(Document):
    title: str
    description: str
    class Settings:
        name = "job_postings"
```

**TypeScript (Mongoose):**
```typescript
const JobPostingSchema = new Schema<IJobPosting>({
  title: { type: String, required: true },
  description: { type: String, required: true }
});
export const JobPosting = mongoose.model<IJobPosting>("JobPosting", JobPostingSchema, "job_postings");
```

### 3. File Uploads

**Python (FastAPI):**
```python
@router.post("/upload")
async def upload(file: UploadFile = File(...)):
    result = await s3_service.upload_file(file)
```

**TypeScript (Express + Multer):**
```typescript
const upload = multer({ dest: "uploads/" });
router.post("/upload", upload.single("file"), async (req, res) => {
  const result = await s3Service.upload_file(req.file);
});
```

### 4. Environment Configuration

**Python (Pydantic Settings):**
```python
class Settings(BaseSettings):
    MONGODB_URL: str
    class Config:
        env_file = ".env"
```

**TypeScript (Custom Config):**
```typescript
const envConfig = () => ({
  MONGODB_URL: getEnv("MONGODB_URL", "mongodb://localhost:27017"),
  // ... other config
});
export const Env = envConfig();
```

## API Compatibility

All API endpoints remain the same:

- ✅ `/ats-checker/jobs` - Job management
- ✅ `/ats-checker/applications` - Application management
- ✅ `/ats-checker/quiz` - Quiz operations
- ✅ `/ats-checker/statistics` - Statistics
- ✅ `/ats-checker/s3/*` - S3 file operations
- ✅ `/ats-checker/health` - Health checks

## Environment Variables

All environment variables remain unchanged. The `.env` file format is identical:

```bash
MONGODB_URL=mongodb://localhost:27017
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
# ... etc
```

## Running the Application

### Development

```bash
npm install
npm run dev
```

### Production

```bash
npm run build
npm start
```

### Docker

```bash
docker build -t ats-system-checker .
docker run -p 4002:4002 ats-system-checker
```

## Migration Benefits

1. **Type Safety**: Full TypeScript type checking
2. **Better IDE Support**: Enhanced autocomplete and error detection
3. **Performance**: Node.js performance optimizations
4. **Ecosystem**: Access to rich npm package ecosystem
5. **Consistency**: Aligns with other TypeScript services in the monorepo

## Common Tasks

### Adding a New Route

```typescript
// src/routes/new_feature.routes.ts
import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get(
  "/new-endpoint",
  asyncHandler(async (req, res) => {
    // Implementation
    return res.status(200).json({ message: "Success" });
  })
);

export default router;
```

### Adding a New Service

```typescript
// src/services/new_service.ts
export class NewService {
  async doSomething(): Promise<any> {
    // Implementation
  }
}
```

### Adding a New Database Model

```typescript
// src/models/database.models.ts
export interface INewModel extends Document {
  field1: string;
  field2: number;
}

const NewModelSchema = new Schema<INewModel>({
  field1: { type: String, required: true },
  field2: { type: Number, required: true }
});

export const NewModel = mongoose.model<INewModel>("NewModel", NewModelSchema, "new_collection");
```

## Troubleshooting

### TypeScript Errors

If you see TypeScript errors about missing types:
```bash
npm install
```

### Database Connection Issues

Ensure MongoDB is running and `MONGODB_URL` is correctly set in `.env`.

### File Upload Issues

Ensure the `uploads/` directory exists and has proper permissions.

## Additional Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Mongoose Documentation](https://mongoosejs.com/docs/guide.html)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/)

