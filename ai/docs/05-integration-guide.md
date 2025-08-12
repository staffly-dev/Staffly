# 🔗 AI Service Integration Guide

## Overview

This guide provides comprehensive information for developers and teams who want to integrate with the ATS AI Service. It covers authentication, API usage patterns, error handling, and best practices for production integration.

## 🚀 Getting Started

### Service Information

- **Base URL**: `http://localhost:5000` (development) / `https://your-domain.com` (production)
- **API Version**: 1.0.0
- **Authentication**: HTTP Basic Auth for docs endpoints only
- **Rate Limits**: Configurable (currently unlimited)
- **Response Format**: JSON

### Quick Test

```bash
# Test service health
curl http://localhost:5000/health

# Expected response
{
  "status": "healthy",
  "service": "ATS AI Service",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🔐 Authentication

### API Endpoints

**No Authentication Required**:
- `/` - Service information
- `/health` - Health check
- `/evaluate` - CV evaluation
- `/extract-text` - Document text extraction
- `/generate-quiz` - Quiz generation
- `/evaluate-quiz` - Quiz evaluation

**Authentication Required**:
- `/docs` - Swagger UI documentation
- `/redoc` - ReDoc documentation
- `/openapi.json` - OpenAPI schema

### Accessing Protected Endpoints

```bash
# Using curl with credentials
curl -u "admin:admin123" http://localhost:5000/docs

# Using Authorization header
curl -H "Authorization: Basic YWRtaW46YWRtaW4xMjM=" http://localhost:5000/docs
```

**Note**: Default credentials are `admin:admin123`. Change these in production!

## 📡 API Integration Patterns

### 1. CV Evaluation Integration

#### Basic Integration

```javascript
// JavaScript/Node.js
async function evaluateCV(cvText, jobDescription, filename = null) {
  try {
    const response = await fetch('http://localhost:5000/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cv_text: cvText,
        job_description: jobDescription,
        filename: filename
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('CV evaluation failed:', error);
    throw error;
  }
}

// Usage
evaluateCV(
  "Experienced Python developer with 5 years...",
  "We are looking for a Python developer...",
  "resume.pdf"
).then(result => {
  console.log('Decision:', result.decision);
  console.log('Score:', result.score);
  console.log('Reasoning:', result.reasoning);
});
```

#### Python Integration

```python
import requests
import json

def evaluate_cv(cv_text, job_description, filename=None):
    """Evaluate CV using AI service"""
    url = "http://localhost:5000/evaluate"
    
    payload = {
        "cv_text": cv_text,
        "job_description": job_description
    }
    
    if filename:
        payload["filename"] = filename
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"CV evaluation failed: {e}")
        raise

# Usage
result = evaluate_cv(
    cv_text="Experienced Python developer with 5 years...",
    job_description="We are looking for a Python developer...",
    filename="resume.pdf"
)

print(f"Decision: {result['decision']}")
print(f"Score: {result['score']}")
print(f"Reasoning: {result['reasoning']}")
```

#### PHP Integration

```php
<?php
function evaluateCV($cvText, $jobDescription, $filename = null) {
    $url = 'http://localhost:5000/evaluate';
    
    $data = [
        'cv_text' => $cvText,
        'job_description' => $jobDescription
    ];
    
    if ($filename) {
        $data['filename'] = $filename;
    }
    
    $options = [
        'http' => [
            'header' => "Content-type: application/json\r\n",
            'method' => 'POST',
            'content' => json_encode($data)
        ]
    ];
    
    $context = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    
    if ($result === FALSE) {
        throw new Exception('CV evaluation failed');
    }
    
    return json_decode($result, true);
}

// Usage
try {
    $result = evaluateCV(
        "Experienced Python developer with 5 years...",
        "We are looking for a Python developer...",
        "resume.pdf"
    );
    
    echo "Decision: " . $result['decision'] . "\n";
    echo "Score: " . $result['score'] . "\n";
    echo "Reasoning: " . $result['reasoning'] . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
```

### 2. Document Text Extraction

#### File Upload Integration

```javascript
// JavaScript/Node.js
async function extractTextFromDocument(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:5000/extract-text', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Text extraction failed:', error);
    throw error;
  }
}

// Usage with file input
document.getElementById('fileInput').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (file) {
    try {
      const result = await extractTextFromDocument(file);
      console.log('Extracted text:', result.text_content);
      console.log('Email:', result.email);
      console.log('Name:', result.name);
    } catch (error) {
      console.error('Failed to extract text:', error);
    }
  }
});
```

#### Python File Upload

```python
import requests

def extract_text_from_document(file_path):
    """Extract text from uploaded document"""
    url = "http://localhost:5000/extract-text"
    
    with open(file_path, 'rb') as file:
        files = {'file': file}
        
        try:
            response = requests.post(url, files=files)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Text extraction failed: {e}")
            raise

# Usage
result = extract_text_from_document("resume.pdf")
print(f"Text content: {result['text_content'][:100]}...")
print(f"Email: {result['email']}")
print(f"Name: {result['name']}")
```

### 3. Quiz Generation and Evaluation

#### Complete Quiz Workflow

```javascript
// JavaScript/Node.js
class QuizService {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
  }

  async generateQuiz(jobDescription, numQuestions = 10) {
    try {
      const response = await fetch(`${this.baseUrl}/generate-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_description: jobDescription,
          num_questions: numQuestions
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Quiz generation failed:', error);
      throw error;
    }
  }

  async evaluateQuiz(answers, quizQuestions) {
    try {
      const response = await fetch(`${this.baseUrl}/evaluate-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: answers,
          quiz_questions: quizQuestions
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Quiz evaluation failed:', error);
      throw error;
    }
  }
}

// Usage
const quizService = new QuizService();

// Generate quiz
quizService.generateQuiz(
  "Python developer position requiring FastAPI and MongoDB experience...",
  15
).then(quiz => {
  console.log(`Generated ${quiz.total_questions} questions`);
  
  // Simulate user answers (0-based indices)
  const userAnswers = [1, 0, 2, 1, 0, 1, 2, 0, 1, 0, 1, 2, 0, 1, 0];
  
  // Evaluate quiz
  return quizService.evaluateQuiz(userAnswers, quiz.questions);
}).then(result => {
  console.log(`Score: ${result.score}/${result.total_questions}`);
  console.log(`Percentage: ${result.percentage}%`);
  console.log(`Passed: ${result.passed}`);
}).catch(error => {
  console.error('Quiz workflow failed:', error);
});
```

## 🔄 Error Handling

### HTTP Status Codes

- `200 OK`: Request successful
- `400 Bad Request`: Invalid request data
- `422 Unprocessable Entity`: Request validation failed
- `500 Internal Server Error`: Server error

### Error Response Format

```json
{
  "error": "Error message",
  "detail": "Detailed error information",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Comprehensive Error Handling

```javascript
class AIServiceClient {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
  }

  async makeRequest(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AIServiceError(
          response.status,
          errorData.error || 'Request failed',
          errorData.detail || 'No additional details'
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }
      
      // Network or other errors
      throw new AIServiceError(
        0,
        'Network error',
        error.message
      );
    }
  }

  async evaluateCV(cvText, jobDescription, filename = null) {
    return this.makeRequest('/evaluate', {
      method: 'POST',
      body: JSON.stringify({
        cv_text: cvText,
        job_description: jobDescription,
        filename: filename
      })
    });
  }
}

class AIServiceError extends Error {
  constructor(statusCode, message, detail) {
    super(message);
    this.name = 'AIServiceError';
    this.statusCode = statusCode;
    this.detail = detail;
  }
}

// Usage with error handling
const client = new AIServiceClient();

try {
  const result = await client.evaluateCV(
    "CV text...",
    "Job description..."
  );
  console.log('Success:', result);
} catch (error) {
  if (error instanceof AIServiceError) {
    console.error(`AI Service Error (${error.statusCode}):`, error.message);
    if (error.detail) {
      console.error('Details:', error.detail);
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## 📊 Response Handling

### CV Evaluation Response

```javascript
// Handle CV evaluation response
function handleEvaluationResponse(result) {
  const { decision, score, reasoning, extracted_skills, strengths, weaknesses } = result;
  
  // Decision logic
  switch (decision) {
    case 'ACCEPT':
      console.log('✅ Candidate accepted!');
      break;
    case 'REJECT':
      console.log('❌ Candidate rejected');
      break;
    case 'REVIEW':
      console.log('⚠️ Requires manual review');
      break;
    default:
      console.log('❓ Unknown decision');
  }
  
  // Score analysis
  if (score >= 80) {
    console.log('🌟 Excellent candidate');
  } else if (score >= 60) {
    console.log('👍 Good candidate');
  } else {
    console.log('📝 Needs improvement');
  }
  
  // Skills analysis
  if (extracted_skills.length > 0) {
    console.log('🔧 Skills found:', extracted_skills.join(', '));
  }
  
  // Strengths and weaknesses
  if (strengths.length > 0) {
    console.log('💪 Strengths:', strengths.join(', '));
  }
  
  if (weaknesses.length > 0) {
    console.log('🔍 Areas for improvement:', weaknesses.join(', '));
  }
  
  return {
    decision,
    score,
    reasoning,
    extracted_skills,
    strengths,
    weaknesses
  };
}
```

### Quiz Response Handling

```javascript
// Handle quiz generation response
function handleQuizGeneration(quiz) {
  const { questions, total_questions, time_limit, pass_threshold } = quiz;
  
  console.log(`📝 Quiz generated: ${total_questions} questions`);
  console.log(`⏱️ Time limit: ${time_limit} seconds`);
  console.log(`🎯 Pass threshold: ${pass_threshold}/${total_questions}`);
  
  // Process questions
  questions.forEach((question, index) => {
    console.log(`\nQuestion ${index + 1}: ${question.question}`);
    question.options.forEach((option, optionIndex) => {
      console.log(`  ${optionIndex}: ${option}`);
    });
  });
  
  return questions;
}

// Handle quiz evaluation response
function handleQuizEvaluation(result) {
  const { score, total_questions, percentage, passed, pass_threshold } = result;
  
  console.log(`📊 Quiz Results:`);
  console.log(`  Score: ${score}/${total_questions}`);
  console.log(`  Percentage: ${percentage}%`);
  console.log(`  Passed: ${passed ? '✅ Yes' : '❌ No'}`);
  console.log(`  Threshold: ${pass_threshold}/${total_questions}`);
  
  // Performance analysis
  if (percentage >= 90) {
    console.log('🏆 Outstanding performance!');
  } else if (percentage >= 80) {
    console.log('🎯 Excellent performance');
  } else if (percentage >= 70) {
    console.log('👍 Good performance');
  } else if (passed) {
    console.log('✅ Passed, but room for improvement');
  } else {
    console.log('📚 Failed - consider additional training');
  }
  
  return result;
}
```

## 🔧 Configuration and Customization

### Environment-Specific Configuration

```javascript
// Configuration management
const config = {
  development: {
    baseUrl: 'http://localhost:5000',
    timeout: 30000,
    retries: 3,
    logLevel: 'debug'
  },
  staging: {
    baseUrl: 'https://ai-staging.yourdomain.com',
    timeout: 60000,
    retries: 2,
    logLevel: 'info'
  },
  production: {
    baseUrl: 'https://ai.yourdomain.com',
    timeout: 120000,
    retries: 1,
    logLevel: 'error'
  }
};

class ConfigurableAIClient {
  constructor(environment = 'development') {
    this.config = config[environment] || config.development;
    this.baseUrl = this.config.baseUrl;
    this.timeout = this.config.timeout;
    this.retries = this.config.retries;
  }
  
  async makeRequestWithRetry(endpoint, options = {}) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        lastError = error;
        
        if (attempt < this.retries) {
          console.warn(`Attempt ${attempt} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    throw lastError;
  }
}
```

### Custom Headers and Metadata

```javascript
// Custom headers and metadata
class MetadataAIClient {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.metadata = {};
  }
  
  setMetadata(key, value) {
    this.metadata[key] = value;
  }
  
  async makeRequest(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'X-Client-Version': '1.0.0',
      'X-Request-ID': this.generateRequestId(),
      ...this.metadata,
      ...options.headers
    };
    
    return fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers
    });
  }
  
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Usage
const client = new MetadataAIClient();
client.setMetadata('X-User-ID', 'user123');
client.setMetadata('X-Session-ID', 'session456');
```

## 📈 Performance Optimization

### Batch Processing

```javascript
// Batch CV evaluation
class BatchAIClient {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.batchSize = 5;
    this.delay = 1000; // 1 second between batches
  }
  
  async evaluateCVsBatch(cvData) {
    const results = [];
    const batches = this.chunkArray(cvData, this.batchSize);
    
    for (let i = 0; i < batches.length; i++) {
      console.log(`Processing batch ${i + 1}/${batches.length}`);
      
      const batchPromises = batches[i].map(cv => 
        this.evaluateCV(cv.cvText, cv.jobDescription, cv.filename)
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Delay between batches to avoid overwhelming the service
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, this.delay));
      }
    }
    
    return results;
  }
  
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
  
  async evaluateCV(cvText, jobDescription, filename = null) {
    const response = await fetch(`${this.baseUrl}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cv_text: cvText, job_description: jobDescription, filename })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return response.json();
  }
}

// Usage
const batchClient = new BatchAIClient();
const cvData = [
  { cvText: "CV 1...", jobDescription: "Job 1...", filename: "cv1.pdf" },
  { cvText: "CV 2...", jobDescription: "Job 2...", filename: "cv2.pdf" },
  // ... more CVs
];

batchClient.evaluateCVsBatch(cvData).then(results => {
  console.log(`Processed ${results.length} CVs`);
  results.forEach((result, index) => {
    console.log(`CV ${index + 1}: ${result.decision} (${result.score}/100)`);
  });
});
```

### Caching and Optimization

```javascript
// Simple caching for repeated requests
class CachedAIClient {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }
  
  generateCacheKey(cvText, jobDescription) {
    // Simple hash for cache key
    return btoa(`${cvText.substring(0, 100)}_${jobDescription.substring(0, 100)}`);
  }
  
  async evaluateCV(cvText, jobDescription, filename = null) {
    const cacheKey = this.generateCacheKey(cvText, jobDescription);
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log('Using cached result');
      return cached.data;
    }
    
    const result = await this.makeRequest(cvText, jobDescription, filename);
    
    // Cache the result
    this.cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    return result;
  }
  
  async makeRequest(cvText, jobDescription, filename = null) {
    const response = await fetch(`${this.baseUrl}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cv_text: cvText, job_description: jobDescription, filename })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return response.json();
  }
  
  clearCache() {
    this.cache.clear();
  }
  
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}
```

## 🔒 Security Best Practices

### Input Validation

```javascript
// Input validation utilities
class InputValidator {
  static validateCVText(cvText) {
    if (!cvText || typeof cvText !== 'string') {
      throw new Error('CV text must be a non-empty string');
    }
    
    if (cvText.length > 10000) {
      throw new Error('CV text too long (max 10,000 characters)');
    }
    
    // Check for potentially malicious content
    if (cvText.includes('<script>') || cvText.includes('javascript:')) {
      throw new Error('CV text contains potentially malicious content');
    }
    
    return cvText.trim();
  }
  
  static validateJobDescription(jobDescription) {
    if (!jobDescription || typeof jobDescription !== 'string') {
      throw new Error('Job description must be a non-empty string');
    }
    
    if (jobDescription.length > 5000) {
      throw new Error('Job description too long (max 5,000 characters)');
    }
    
    return jobDescription.trim();
  }
  
  static validateFilename(filename) {
    if (filename && typeof filename === 'string') {
      // Check for dangerous file extensions
      const dangerousExtensions = ['.exe', '.bat', '.sh', '.py', '.js'];
      const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
      
      if (dangerousExtensions.includes(extension)) {
        throw new Error('Filename contains dangerous extension');
      }
      
      return filename;
    }
    
    return null;
  }
}

// Secure client with validation
class SecureAIClient {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
  }
  
  async evaluateCV(cvText, jobDescription, filename = null) {
    try {
      // Validate inputs
      const validatedCVText = InputValidator.validateCVText(cvText);
      const validatedJobDescription = InputValidator.validateJobDescription(jobDescription);
      const validatedFilename = InputValidator.validateFilename(filename);
      
      // Make request
      const response = await fetch(`${this.baseUrl}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cv_text: validatedCVText,
          job_description: validatedJobDescription,
          filename: validatedFilename
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('CV evaluation failed:', error.message);
      throw error;
    }
  }
}
```

## 📚 Testing and Validation

### Integration Testing

```javascript
// Integration test suite
class AIServiceIntegrationTests {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.testResults = [];
  }
  
  async runAllTests() {
    console.log('🚀 Starting AI Service Integration Tests...\n');
    
    await this.testHealthCheck();
    await this.testCVEvaluation();
    await this.testDocumentExtraction();
    await this.testQuizGeneration();
    await this.testQuizEvaluation();
    
    this.printTestResults();
  }
  
  async testHealthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      const data = await response.json();
      
      if (response.ok && data.status === 'healthy') {
        this.testResults.push({ test: 'Health Check', status: 'PASS' });
        console.log('✅ Health Check: PASS');
      } else {
        this.testResults.push({ test: 'Health Check', status: 'FAIL', error: 'Unexpected response' });
        console.log('❌ Health Check: FAIL');
      }
    } catch (error) {
      this.testResults.push({ test: 'Health Check', status: 'FAIL', error: error.message });
      console.log('❌ Health Check: FAIL');
    }
  }
  
  async testCVEvaluation() {
    try {
      const response = await fetch(`${this.baseUrl}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cv_text: "Experienced Python developer with 5 years of experience in web development.",
          job_description: "We are looking for a Python developer with FastAPI experience."
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.decision && data.score !== undefined) {
        this.testResults.push({ test: 'CV Evaluation', status: 'PASS' });
        console.log('✅ CV Evaluation: PASS');
      } else {
        this.testResults.push({ test: 'CV Evaluation', status: 'FAIL', error: 'Invalid response format' });
        console.log('❌ CV Evaluation: FAIL');
      }
    } catch (error) {
      this.testResults.push({ test: 'CV Evaluation', status: 'FAIL', error: error.message });
      console.log('❌ CV Evaluation: FAIL');
    }
  }
  
  async testDocumentExtraction() {
    try {
      // Create a simple test file
      const testFile = new File(['Test document content'], 'test.txt', { type: 'text/plain' });
      
      const formData = new FormData();
      formData.append('file', testFile);
      
      const response = await fetch(`${this.baseUrl}/extract-text`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        this.testResults.push({ test: 'Document Extraction', status: 'PASS' });
        console.log('✅ Document Extraction: PASS');
      } else {
        this.testResults.push({ test: 'Document Extraction', status: 'FAIL', error: `HTTP ${response.status}` });
        console.log('❌ Document Extraction: FAIL');
      }
    } catch (error) {
      this.testResults.push({ test: 'Document Extraction', status: 'FAIL', error: error.message });
      console.log('❌ Document Extraction: FAIL');
    }
  }
  
  async testQuizGeneration() {
    try {
      const response = await fetch(`${this.baseUrl}/generate-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_description: "Python developer position requiring FastAPI and MongoDB experience.",
          num_questions: 5
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.questions && data.total_questions === 5) {
        this.testResults.push({ test: 'Quiz Generation', status: 'PASS' });
        console.log('✅ Quiz Generation: PASS');
      } else {
        this.testResults.push({ test: 'Quiz Generation', status: 'FAIL', error: 'Invalid response format' });
        console.log('❌ Quiz Generation: FAIL');
      }
    } catch (error) {
      this.testResults.push({ test: 'Quiz Generation', status: 'FAIL', error: error.message });
      console.log('❌ Quiz Generation: FAIL');
    }
  }
  
  async testQuizEvaluation() {
    try {
      const response = await fetch(`${this.baseUrl}/evaluate-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: [1, 0, 2, 1, 0],
          quiz_questions: [
            {
              question: "What is FastAPI?",
              options: ["Web scraping tool", "API framework", "Database"],
              correct_answer: 1,
              explanation: "FastAPI is a modern web framework for building APIs"
            }
          ]
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.score !== undefined && data.total_questions !== undefined) {
        this.testResults.push({ test: 'Quiz Evaluation', status: 'PASS' });
        console.log('✅ Quiz Evaluation: PASS');
      } else {
        this.testResults.push({ test: 'Quiz Evaluation', status: 'FAIL', error: 'Invalid response format' });
        console.log('❌ Quiz Evaluation: FAIL');
      }
    } catch (error) {
      this.testResults.push({ test: 'Quiz Evaluation', status: 'FAIL', error: error.message });
      console.log('❌ Quiz Evaluation: FAIL');
    }
  }
  
  printTestResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const total = this.testResults.length;
    
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(r => r.status === 'FAIL')
        .forEach(r => {
          console.log(`  - ${r.test}: ${r.error}`);
        });
    }
  }
}

// Run tests
const tests = new AIServiceIntegrationTests();
tests.runAllTests();
```

## 📖 Additional Resources

### Documentation Links

- **[API Endpoints Reference](02-api-endpoints-reference.md)** - Complete API documentation
- **[Data Models Reference](03-data-models-reference.md)** - Data structure documentation
- **[Troubleshooting Guide](04-troubleshooting-and-deployment.md)** - Common issues and solutions
- **[Security Documentation](01-api-documentation-security.md)** - Security implementation details

### External Resources

- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **Cohere AI API**: https://docs.cohere.com/
- **HTTP Status Codes**: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
- **Fetch API**: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API

## 🤝 Support and Community

### Getting Help

1. **Check Documentation**: Review all documentation files
2. **Test Endpoints**: Use the provided test examples
3. **Check Logs**: Review service logs for errors
4. **Community**: Check repository issues and discussions

### Contributing

1. **Report Issues**: Create detailed bug reports
2. **Suggest Features**: Propose new functionality
3. **Submit PRs**: Contribute code improvements
4. **Documentation**: Help improve documentation

## 📄 License

This integration guide is part of the ATS AI Service, licensed under the MIT License.

---

**Happy Integrating! 🚀**

For questions or support, check the troubleshooting guide or create an issue in the repository.
