import axios from "axios";
import { Env } from "../config/env.config";
import { EmailService } from "./email.service";
import { DatabaseService } from "./database.service";
import { EvaluationDecision } from "../models/evaluation.models";

export class EvaluationService {
  private ai_service_url: string;
  private email_service: EmailService;
  private database_service: DatabaseService;

  constructor(
    ai_service_url: string,
    email_service: EmailService,
    database_service: DatabaseService
  ) {
    this.ai_service_url = ai_service_url;
    this.email_service = email_service;
    this.database_service = database_service;
  }

  // Getter for email service to allow access from controllers
  get_email_service(): EmailService {
    return this.email_service;
  }

  // Check AI service health
  async check_ai_service_health(): Promise<{ healthy: boolean; message: string; response_time_ms?: number }> {
    try {
      if (!this.ai_service_url || !this.ai_service_url.trim()) {
        return { healthy: false, message: "AI service URL not configured" };
      }

      const startTime = Date.now();
      const response = await axios.get(`${this.ai_service_url}/health`, { timeout: 10000 });
      const responseTime = Date.now() - startTime;

      if (response.status === 200 && response.data) {
        const isHealthy = response.data.status === "healthy" || response.data.status === "degraded";
        return {
          healthy: isHealthy,
          message: `AI service is ${response.data.status}`,
          response_time_ms: responseTime
        };
      }

      return { healthy: false, message: "AI service returned unexpected response" };
    } catch (error: any) {
      console.error("AI service health check failed:", error.message);
      return {
        healthy: false,
        message: error.message || "Failed to connect to AI service"
      };
    }
  }

  async generate_quiz(job_description: string): Promise<any> {
    try {
      if (!this.ai_service_url || !this.ai_service_url.trim()) {
        console.warn("AI service URL not configured, using fallback quiz generation");
        return this._generate_fallback_quiz(job_description);
      }

      const max_retries = 3;
      for (let attempt = 0; attempt < max_retries; attempt++) {
        try {
          const response = await axios.post(
            `${this.ai_service_url}/generate-quiz`,
            {
              job_description,
              num_questions: 10
            },
            { timeout: 60000 }
          );

          const quiz_questions = response.data.questions || [];
          if (quiz_questions.length > 0) {
            return { questions: quiz_questions };
          }
        } catch (error: any) {
          console.warn(`Quiz generation attempt ${attempt + 1} failed:`, error.message);
          if (attempt === max_retries - 1) {
            console.warn("All quiz generation attempts failed, using fallback");
            return this._generate_fallback_quiz(job_description);
          }
        }
      }

      return this._generate_fallback_quiz(job_description);
    } catch (error: any) {
      const msg = error?.message || "Unknown error";
      const status = error?.response?.status;
      const code = error?.code;
      console.error(
        "Error generating quiz:",
        status ? `${msg} (HTTP ${status})` : code ? `${msg} (${code})` : msg
      );
      return this._generate_fallback_quiz(job_description);
    }
  }

  private _generate_fallback_quiz(job_description: string): any {
    // Simple fallback quiz generation
    return {
      questions: [
        {
          question: "What is your primary programming language?",
          options: ["Python", "JavaScript", "Java", "C++"],
          correct_answer: 0
        },
        {
          question: "How many years of experience do you have?",
          options: ["0-1", "2-3", "4-5", "5+"],
          correct_answer: 3
        }
      ]
    };
  }

  async evaluate_cv(
    cv_text: string,
    job_description: string,
    required_skills: string[]
  ): Promise<{
    decision: EvaluationDecision;
    score: number;
    evaluation_text: string;
    text_length: number;
    email?: string;
    candidate_name?: string;
  }> {
    try {
      if (!this.ai_service_url || !this.ai_service_url.trim()) {
        console.warn("AI service URL not configured, using fallback evaluation");
        return this._evaluate_cv_fallback(cv_text, job_description, required_skills);
      }

      const response = await axios.post(
        `${this.ai_service_url}/evaluate`,
        {
          cv_text,
          job_description
        },
        { timeout: 60000 }
      );

      return {
        decision: response.data.decision || EvaluationDecision.REVIEW,
        score: response.data.score ?? 50,
        evaluation_text: response.data.reasoning || "Evaluation completed",
        text_length: cv_text.length,
        email: response.data.email,
        candidate_name: response.data.candidate_name
      };
    } catch (error: any) {
      const msg = error?.message || "Unknown error";
      const status = error?.response?.status;
      const code = error?.code;
      console.error(
        "Error evaluating CV:",
        status ? `${msg} (HTTP ${status})` : code ? `${msg} (${code})` : msg
      );
      return this._evaluate_cv_fallback(cv_text, job_description, required_skills);
    }
  }

  private _evaluate_cv_fallback(
    cv_text: string,
    job_description: string,
    required_skills: string[]
  ): {
    decision: EvaluationDecision;
    score: number;
    evaluation_text: string;
    text_length: number;
  } {
    // Simple fallback evaluation
    const text_lower = cv_text.toLowerCase();
    const skills_found = required_skills.filter(skill =>
      text_lower.includes(skill.toLowerCase())
    ).length;

    const score = Math.min(100, (skills_found / required_skills.length) * 100);
    const decision = score >= 70 ? EvaluationDecision.ACCEPT : EvaluationDecision.REJECT;

    return {
      decision,
      score: Math.round(score),
      evaluation_text: `Found ${skills_found} out of ${required_skills.length} required skills.`,
      text_length: cv_text.length
    };
  }
}

