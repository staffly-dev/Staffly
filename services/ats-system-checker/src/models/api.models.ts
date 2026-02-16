import { EvaluationDecision } from "./evaluation.models";

// Job Posting Models
export interface JobPostingRequest {
  title: string;
  description: string;
  required_skills: string; // comma-separated
  additional_details?: string;
  hr_email?: string;
  hr_name?: string;
  evaluation_threshold?: number; // 0-100
  quiz_required?: boolean;
  quiz_pass_threshold?: number; // 0-10
}

export interface JobPostingResponse {
  job_id: string;
  title: string;
  description: string;
  required_skills: string[];
  shareable_link: string;
  created_at: Date;
  is_active: boolean;
  hr_email?: string;
  hr_name?: string;
  created_by?: string;
  owner_username?: string;
}

export interface JobPostingsListResponse {
  total_jobs: number;
  jobs: JobPostingResponse[];
}

// Application Models
export interface ApplicationRequest {
  candidate_email: string;
  candidate_name?: string;
  cv_file: Buffer | Express.Multer.File;
}

export interface ApplicationResponse {
  application_id: string;
  job_id: string;
  status: string;
  evaluation_decision?: EvaluationDecision;
  evaluation_score?: number;
  quiz_required?: boolean;
  quiz_link?: string;
}

export interface ApplicationListResponse {
  application_id: string;
  candidate_email?: string;
  candidate_name?: string;
  cv_score?: number;
  cv_filename: string;
  s3_key: string;
  decision?: string;
  job_id: string;
  quiz_score?: number;
  status: string;
}

export interface ApplicationsListResponse {
  total_applications: number;
  applications: ApplicationListResponse[];
}

export interface SingleApplicationResponse {
  application_id: string;
  candidate_email: string;
  candidate_name: string;
  cv_score: number;
  cv_filename: string;
  s3_key: string;
  decision: string;
  job_id: string;
  quiz_score?: number;
  status: string;
}

// Quiz Models
export interface QuizSubmissionRequest {
  answers: Record<string, any>;
  time_taken_seconds?: number;
}

export interface QuizSubmissionResponse {
  quiz_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  passed: boolean;
  feedback?: string;
}

export interface QuizUserInfoResponse {
  application_id?: string;
  quiz_session_id: string;
  candidate_email?: string;
  quiz_link?: string;
  job_title?: string;
  job_id?: string;
  quiz_status: string;
  created_at: Date;
  started_at?: Date;
  completed_at?: Date;
  score?: number;
  total_questions?: number;
  percentage?: number;
  passed?: boolean;
}

export interface AllQuizUsersResponse {
  total_quizzes: number;
  quiz_users: QuizUserInfoResponse[];
}

export interface QuizDisplayResponse {
  quiz_session_id: string;
  application_id?: string;
  questions: any[];
  total_questions: number;
  time_limit_seconds: number;
  pass_threshold: number;
  job_title?: string;
  job_description?: string;
  candidate_email?: string;
  status: string;
  created_at: Date;
  started_at?: Date;
}

// Statistics Models
export interface StatisticsResponse {
  total_applications: number;
  total_evaluations: number;
  acceptance_rate: number;
  average_score: number;
  quiz_pass_rate?: number;
  daily_stats: Record<string, any>;
}

export interface UserStatisticsRequest {
  user_id: string;
  created_by: string;
}

export interface UserStatisticsResponse {
  user_id: string;
  created_by: string;
  total_applications: number;
  total_evaluations: number;
  acceptance_rate: number;
  average_score: number;
  quiz_pass_rate?: number;
  daily_stats: Record<string, any>;
  last_activity?: string;
}

// Authentication Models
export interface AuthenticatedRequest {
  user_id: string;
  created_by: string;
}

export interface CreateJobPostingRequest extends AuthenticatedRequest {
  title: string;
  description: string;
  required_skills: string;
  additional_details?: string;
  hr_email?: string;
  hr_name?: string;
  evaluation_threshold?: number;
  quiz_required?: boolean;
  quiz_pass_threshold?: number;
}

