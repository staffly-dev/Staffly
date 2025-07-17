# 🖥️ ATS Backend Service

A professional FastAPI-based backend for the Advanced Applicant Tracking System, providing job management, application processing, analytics, and secure API endpoints.

## ✨ Features

- **Job Management**: Create and manage job postings
- **Application Processing**: Handle CV submissions and candidate workflows
- **Quiz Generation**: Integrate with AI service for skill assessments
- **Email Notifications**: Automated candidate communication
- **MongoDB Integration**: Scalable NoSQL database with Beanie ODM
- **Security Middleware**: CORS, rate limiting, secure headers, file upload protection
- **Real-time Analytics**: System statistics and metrics dashboard
- **RESTful API**: Clean, documented endpoints with FastAPI

## 🏗️ Architecture

- **FastAPI** application (Python 3.8+)
- **Beanie** ODM for MongoDB
- **Pydantic** models for type safety
- **Modular codebase**: `src/` with `config/`, `controllers/`, `models/`, `routes/`, `services/`, `middlewares/`, `utils/`

## 📚 API Endpoints

| Endpoint                     | Method | Description                |
| ---------------------------- | ------ | -------------------------- |
| `/health`                    | GET    | System health check        |
| `/api/jobs`                  | POST   | Create new job posting     |
| `/api/jobs/{job_id}`         | GET    | Get job posting details    |
| `/api/jobs/{job_id}/apply`   | POST   | Submit application for job |
| `/api/statistics`            | GET    | Get evaluation statistics  |
| `/api/quiz/{quiz_id}/submit` | POST   | Submit quiz answers        |

Interactive docs: [http://localhost:4000/docs](http://localhost:4000/docs)

## ⚙️ Environment Variables

Create a `.env` file in the `services/ats-system-checker/` directory with:

```
API_HOST=0.0.0.0
API_PORT=4000
FRONTEND_URL=http://localhost:3000
COHERE_API_KEY=your_cohere_api_key_here
GMAIL_USER=your_email@gmail.com
GMAIL_PASSWORD=your_gmail_app_password
MONGODB_URL=mongodb://localhost:27017
MONGODB_DATABASE=ats_system
SECRET_KEY=your-super-secret-key-change-in-production
```

## 🚀 How to Run the Backend Service

### 1. Install dependencies

```bash
cd services/ats-system-checker
pip install -r requirements.txt
```

### 2. Run the backend service (Development & Production)

#### **Recommended: Run as a module (robust for imports)**

From the `services/ats-system-checker` directory:

```bash
  python -m src.main
```

#### **Or: Use Uvicorn directly (for hot reload/dev)**

From the `services/ats-system-checker` directory:

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 4000 --reload-exclude venv --reload-exclude .pytest_cache --reload-exclude __pycache__ --reload-exclude uploads --reload-exclude ats_system.log
```

- Service runs on [http://localhost:4000](http://localhost:4000)

#### **Production (Docker)**

The Dockerfile now uses `python -m src.main` for robust startup.

### 3. Development & Testing

- Auto-reload: `uvicorn src.main:app --reload --host 0.0.0.0 --port 4000`
- Run tests: `pytest`
- Lint: `flake8 .`
- Format: `black .`

## 🐞 Troubleshooting

- **Import/module errors:** Always run from the `services/ats-system-checker` directory using `python -m src.main` or `uvicorn src.main:app ...`.
- **Watcher spam ("change detected"):** The backend now uses `reload_excludes` to ignore changes in `venv`, `.pytest_cache`, `__pycache__`, `uploads`, and `ats_system.log`. If you see constant reloads, ensure your log files and cache folders are excluded from reload.
- **.env file:** Must be present in the `services/ats-system-checker/` directory before running or building Docker image.

## 🐳 Docker Instructions

### 1. Create the .env file

- Place your backend environment variables in `services/ats-system-checker/.env`.

### 2. Build the Docker image

```bash
docker build -t ats-backend .
```

### 3. Run the Docker container

```bash
docker run --env-file .env -p 4000:4000 ats-backend
```

- The backend service will be available at <http://localhost:4000>

> **Note:** The `.env` file must be present in the `services/ats-system-checker` directory before building or running the Docker image.

## 📝 License

MIT License
