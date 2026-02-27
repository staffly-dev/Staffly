import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { EmailService } from '../email/email.service';
import { DatabaseService } from '../database/database.service';
import { EvaluationDecision } from '../common/evaluation-decision';

@Injectable()
export class EvaluationService {
  private readonly aiServiceUrl: string;
  private readonly timeoutMs: number;

  constructor(
    private config: ConfigService,
    private emailService: EmailService,
    private databaseService: DatabaseService,
  ) {
    this.aiServiceUrl = this.config.get<string>('AI_SERVICE_URL') || '';
    this.timeoutMs = parseInt(this.config.get<string>('AI_SERVICE_TIMEOUT_MS') || '120000', 10);
  }

  getEmailService(): EmailService {
    return this.emailService;
  }

  async checkAiServiceHealth(): Promise<{ healthy: boolean; message: string; response_time_ms?: number }> {
    try {
      if (!this.aiServiceUrl?.trim()) {
        return { healthy: false, message: 'AI service URL not configured' };
      }
      const start = Date.now();
      const response = await axios.get(`${this.aiServiceUrl}/health`, { timeout: 10000 });
      const responseTime = Date.now() - start;
      const isHealthy = response.data?.status === 'healthy' || response.data?.status === 'degraded';
      return {
        healthy: isHealthy,
        message: `AI service is ${response.data?.status || 'unknown'}`,
        response_time_ms: responseTime,
      };
    } catch (err: any) {
      return { healthy: false, message: err?.message || 'Failed to connect to AI service' };
    }
  }

  async generateQuiz(jobDescription: string): Promise<{ questions: any[] }> {
    try {
      if (!this.aiServiceUrl?.trim()) {
        return this.generateFallbackQuiz(jobDescription);
      }
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const response = await axios.post(
            `${this.aiServiceUrl}/generate-quiz`,
            { job_description: jobDescription, num_questions: 10 },
            { timeout: this.timeoutMs },
          );
          const questions = response.data?.questions || [];
          if (questions.length > 0) return { questions };
        } catch (e: any) {
          if (attempt === 2) return this.generateFallbackQuiz(jobDescription);
        }
      }
    } catch (e) {
      return this.generateFallbackQuiz(jobDescription);
    }
    return this.generateFallbackQuiz(jobDescription);
  }

  private generateFallbackQuiz(_jobDescription: string): { questions: any[] } {
    return {
      questions: [
        { question: 'What is your primary programming language?', options: ['Python', 'JavaScript', 'Java', 'C++'], correct_answer: 0 },
        { question: 'How many years of experience do you have?', options: ['0-1', '2-3', '4-5', '5+'], correct_answer: 3 },
      ],
    };
  }

  async evaluateCv(
    cvText: string,
    jobDescription: string,
    _requiredSkills: string[],
  ): Promise<{
    decision: EvaluationDecision;
    score: number;
    evaluation_text: string;
    text_length: number;
    email?: string;
    candidate_name?: string;
  }> {
    try {
      if (!this.aiServiceUrl?.trim()) {
        return this.evaluateCvFallback(cvText, jobDescription, _requiredSkills);
      }
      const response = await axios.post(
        `${this.aiServiceUrl}/evaluate`,
        { cv_text: cvText, job_description: jobDescription },
        { timeout: this.timeoutMs },
      );
      return {
        decision: (response.data?.decision as EvaluationDecision) || EvaluationDecision.REVIEW,
        score: response.data?.score ?? 50,
        evaluation_text: response.data?.reasoning || 'Evaluation completed',
        text_length: cvText.length,
        email: response.data?.email,
        candidate_name: response.data?.candidate_name,
      };
    } catch (err: any) {
      return this.evaluateCvFallback(cvText, jobDescription, _requiredSkills);
    }
  }

  private evaluateCvFallback(
    cvText: string,
    _jobDescription: string,
    requiredSkills: string[],
  ): {
    decision: EvaluationDecision;
    score: number;
    evaluation_text: string;
    text_length: number;
  } {
    const textLower = cvText.toLowerCase();
    const skillsFound = requiredSkills.filter((s) => textLower.includes(s.toLowerCase())).length;
    const score = Math.min(100, requiredSkills.length ? (skillsFound / requiredSkills.length) * 100 : 0);
    const decision = score >= 70 ? EvaluationDecision.ACCEPT : EvaluationDecision.REJECT;
    return {
      decision,
      score: Math.round(score),
      evaluation_text: `Found ${skillsFound} out of ${requiredSkills.length} required skills.`,
      text_length: cvText.length,
    };
  }
}
