# 🤖 ATS AI Service

A dedicated, scalable AI microservice for CV evaluation and quiz generation, built with FastAPI and Cohere AI.

## ✨ Features

- **AI-Powered CV Evaluation**: Analyze and score resumes using Cohere AI
- **Dynamic Quiz Generation**: Create skill assessments from job descriptions
- **Document Processing**: Extract text from PDF and DOCX files
- **RESTful API**: Clean, documented endpoints with OpenAPI/Swagger
- **Independent Scaling**: Runs as a standalone service (default port 5000)
- **CORS Support**: Configurable cross-origin resource sharing
- **Health Checks**: Built-in service diagnostics
- **Structured Logging**: File and console logs for all operations

## 🏗️ Architecture

- **FastAPI** application (Python 3.8+)
- **Cohere AI** integration for NLP and evaluation
- **Pydantic** models for type safety
- **Modular codebase**: `main.py`, `services/`, `models/`, `utils/`

## 📚 API Endpoints

| Endpoint         | Method | Description                          |
| ---------------- | ------ | ------------------------------------ |
| `/health`        | GET    | Service health check                 |
| `/evaluate`      | POST   | Evaluate CV against job requirements |
| `/extract-text`  | POST   | Extract text from CV documents       |
| `/generate-quiz` | POST   | Generate quiz from job description   |
| `/evaluate-quiz` | POST   | Evaluate quiz answers and score      |

Interactive docs: [http://localhost:5000/docs](http://localhost:5000/docs)

## ⚙️ Environment Variables

Create a `.env` file in the `ai/` directory with:

```
COHERE_API_KEY=your_cohere_api_key_here
AI_HOST=0.0.0.0
AI_PORT=5000
CORS_ALLOW_ORIGINS=http://localhost:3000
CORS_ALLOW_CREDENTIALS=true
LOG_LEVEL=INFO
```

## 🚀 How to Run the AI Service

### 1. Install dependencies

```bash
cd ai
pip install -r requirements.txt
```

### 2. Run the AI service (Development & Production)

#### **Recommended: Run as a module (robust for imports)**

From the project root:

```bash
python -m ai.main
```

#### **Or: Use Uvicorn directly (for hot reload/dev)**

From the project root:

```bash
uvicorn ai.main:app --reload --host 0.0.0.0 --port 5000
```

- Service runs on [http://localhost:5000](http://localhost:5000)

#### **Production (Docker)**

The Dockerfile now uses `python -m ai.main` for robust startup.

### 3. Development & Testing

- Auto-reload: `uvicorn ai.main:app --reload --host 0.0.0.0 --port 5000`
- Run tests: `pytest`
- Lint: `flake8 .`
- Format: `black .`

## 🐞 Troubleshooting

- **Import/module errors:** Always run from the project root using `python -m ai.main` or `uvicorn ai.main:app ...`.
- **Watcher spam ("change detected"):** If you see constant reloads, ensure your log files and cache folders are excluded from reload (see backend for example of `reload_excludes`).
- **.env file:** Must be present in the `ai/` directory before running or building Docker image.

## 🐳 Docker Instructions

### 1. Create the .env file

- Place your AI service environment variables in `ai/.env`.

### 2. Build the Docker image

```bash
docker build -t ats-ai .
```

### 3. Run the Docker container

```bash
docker run --env-file .env -p 5000:5000 ats-ai
```

- The AI service will be available at <http://localhost:5000>

> **Note:** The `.env` file must be present in the `ai` directory before building or running the Docker image.

## 📝 License

MIT License
