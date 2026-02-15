import mongoose, { Schema, Document } from "mongoose";
import { EvaluationDecision } from "./evaluation.models";

// CVEvaluation Model
export interface ICVEvaluation extends Document {
  filename: string;
  job_description_hash: string;
  job_description: string;
  decision: EvaluationDecision;
  score: number;
  evaluation_text: string;
  cv_text_length: number;
  email?: string;
  technical_skills_score?: number;
  experience_score?: number;
  education_score?: number;
  soft_skills_score?: number;
  career_growth_score?: number;
  achievements_score?: number;
  created_at: Date;
  updated_at?: Date;
  processing_time_ms?: number;
  created_by?: string;
}

const CVEvaluationSchema = new Schema<ICVEvaluation>({
  filename: { type: String, required: true, index: true },
  job_description_hash: { type: String, required: true, index: true },
  job_description: { type: String, required: true },
  decision: { type: String, required: true, enum: Object.values(EvaluationDecision) },
  score: { type: Number, required: true, min: 0, max: 100 },
  evaluation_text: { type: String, required: true },
  cv_text_length: { type: Number, required: true },
  email: { type: String, index: true },
  technical_skills_score: { type: Number, min: 0, max: 25 },
  experience_score: { type: Number, min: 0, max: 25 },
  education_score: { type: Number, min: 0, max: 15 },
  soft_skills_score: { type: Number, min: 0, max: 15 },
  career_growth_score: { type: Number, min: 0, max: 10 },
  achievements_score: { type: Number, min: 0, max: 10 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date },
  processing_time_ms: { type: Number },
  created_by: { type: String, index: true }
});

CVEvaluationSchema.index({ filename: 1 });
CVEvaluationSchema.index({ decision: 1 });
CVEvaluationSchema.index({ score: -1 });
CVEvaluationSchema.index({ created_at: -1 });
CVEvaluationSchema.index({ job_description_hash: 1 });
CVEvaluationSchema.index({ email: 1 });
CVEvaluationSchema.index({ created_by: 1 });

export const CVEvaluation = mongoose.model<ICVEvaluation>("CVEvaluation", CVEvaluationSchema, "cv_evaluations");

// QuizSession Model
export interface IQuizSession extends Document {
  job_description: string;
  job_description_hash: string;
  associated_cv_filename?: string;
  candidate_email?: string;
  questions: any[];
  total_questions: number;
  time_limit_seconds: number;
  pass_threshold: number;
  status: string; // GENERATED, IN_PROGRESS, COMPLETED, EXPIRED
  started_at?: Date;
  completed_at?: Date;
  created_at: Date;
  created_by?: string;
}

const QuizSessionSchema = new Schema<IQuizSession>({
  job_description: { type: String, required: true },
  job_description_hash: { type: String, required: true, index: true },
  associated_cv_filename: { type: String },
  candidate_email: { type: String, index: true },
  questions: { type: [{}], required: true },
  total_questions: { type: Number, required: true },
  time_limit_seconds: { type: Number, default: 300 },
  pass_threshold: { type: Number, default: 7 },
  status: { type: String, default: "GENERATED", index: true },
  started_at: { type: Date },
  completed_at: { type: Date },
  created_at: { type: Date, default: Date.now },
  created_by: { type: String, index: true }
});

QuizSessionSchema.index({ job_description_hash: 1 });
QuizSessionSchema.index({ candidate_email: 1 });
QuizSessionSchema.index({ status: 1 });
QuizSessionSchema.index({ created_at: -1 });
QuizSessionSchema.index({ created_by: 1 });

export const QuizSession = mongoose.model<IQuizSession>("QuizSession", QuizSessionSchema, "quiz_sessions");

// QuizResult Model
export interface IQuizResult extends Document {
  quiz_session_id: string;
  candidate_email?: string;
  associated_cv_filename?: string;
  answers: number[];
  score: number;
  total_questions: number;
  percentage: number;
  status: string; // PASSED or FAILED
  time_taken_seconds?: number;
  submitted_at: Date;
  question_analysis?: any[];
  created_by?: string;
}

const QuizResultSchema = new Schema<IQuizResult>({
  quiz_session_id: { type: String, required: true, index: true },
  candidate_email: { type: String, index: true },
  associated_cv_filename: { type: String },
  answers: { type: [Number], required: true },
  score: { type: Number, required: true },
  total_questions: { type: Number, required: true },
  percentage: { type: Number, required: true },
  status: { type: String, required: true, index: true },
  time_taken_seconds: { type: Number },
  submitted_at: { type: Date, default: Date.now },
  question_analysis: { type: [Schema.Types.Mixed] },
  created_by: { type: String, index: true }
});

QuizResultSchema.index({ quiz_session_id: 1 });
QuizResultSchema.index({ candidate_email: 1 });
QuizResultSchema.index({ status: 1 });
QuizResultSchema.index({ score: -1 });
QuizResultSchema.index({ submitted_at: -1 });
QuizResultSchema.index({ created_by: 1 });

export const QuizResult = mongoose.model<IQuizResult>("QuizResult", QuizResultSchema, "quiz_results");

// JobPosting Model
export interface IJobPosting extends Document {
  title: string;
  description: string;
  required_skills: string[];
  additional_details?: string;
  job_id: string;
  description_hash: string;
  owner_user_id?: string;
  owner_username?: string;
  evaluation_threshold: number;
  quiz_required: boolean;
  quiz_pass_threshold: number;
  technical_skills_weight: number;
  experience_weight: number;
  education_weight: number;
  soft_skills_weight: number;
  career_growth_weight: number;
  achievements_weight: number;
  hr_email?: string;
  hr_name?: string;
  total_applications: number;
  total_accepted: number;
  total_rejected: number;
  total_quiz_passed: number;
  average_score: number;
  created_at: Date;
  updated_at?: Date;
  is_active: boolean;
}

const JobPostingSchema = new Schema<IJobPosting>({
  title: { type: String, required: true, index: true },
  description: { type: String, required: true },
  required_skills: { type: [String], default: [] },
  additional_details: { type: String },
  job_id: { type: String, required: true, unique: true, sparse: true, index: true },
  description_hash: { type: String, required: true, index: true },
  owner_user_id: { type: String, index: true },
  owner_username: { type: String, index: true },
  evaluation_threshold: { type: Number, default: 70, min: 0, max: 100 },
  quiz_required: { type: Boolean, default: true },
  quiz_pass_threshold: { type: Number, default: 7, min: 0, max: 10 },
  technical_skills_weight: { type: Number, default: 25, min: 0, max: 100 },
  experience_weight: { type: Number, default: 25, min: 0, max: 100 },
  education_weight: { type: Number, default: 15, min: 0, max: 100 },
  soft_skills_weight: { type: Number, default: 15, min: 0, max: 100 },
  career_growth_weight: { type: Number, default: 10, min: 0, max: 100 },
  achievements_weight: { type: Number, default: 10, min: 0, max: 100 },
  hr_email: { type: String },
  hr_name: { type: String },
  total_applications: { type: Number, default: 0 },
  total_accepted: { type: Number, default: 0 },
  total_rejected: { type: Number, default: 0 },
  total_quiz_passed: { type: Number, default: 0 },
  average_score: { type: Number, default: 0.0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date },
  is_active: { type: Boolean, default: true, index: true }
});

JobPostingSchema.index({ job_id: 1 }, { unique: true, sparse: true });
JobPostingSchema.index({ title: 1 });
JobPostingSchema.index({ description_hash: 1 });
JobPostingSchema.index({ is_active: 1 });
JobPostingSchema.index({ owner_user_id: 1 });
JobPostingSchema.index({ owner_username: 1 });
JobPostingSchema.index({ created_at: -1 });

export const JobPosting = mongoose.model<IJobPosting>("JobPosting", JobPostingSchema, "job_postings");

// Application Model
export interface IApplication extends Document {
  application_id: string;
  job_id: string;
  candidate_email?: string;
  candidate_name?: string;
  cv_filename: string;
  cv_score?: number;
  decision?: string;
  quiz_score?: number;
  status: string;
  submitted_at?: Date;
}

const ApplicationSchema = new Schema<IApplication>({
  application_id: { type: String, required: true, unique: true, sparse: true, index: true },
  job_id: { type: String, required: true, index: true },
  candidate_email: { type: String, index: true },
  candidate_name: { type: String },
  cv_filename: { type: String, required: true },
  cv_score: { type: Number, min: 0, max: 100, index: true },
  decision: { type: String },
  quiz_score: { type: Number, min: 0, max: 10 },
  status: { type: String, default: "SUBMITTED", index: true },
  submitted_at: { type: Date, default: Date.now, index: true }
});

ApplicationSchema.index({ application_id: 1 }, { unique: true, sparse: true });
ApplicationSchema.index({ job_id: 1 });
ApplicationSchema.index({ candidate_email: 1 });
ApplicationSchema.index({ status: 1 });
ApplicationSchema.index({ submitted_at: -1 });
ApplicationSchema.index({ cv_score: -1 });

export const Application = mongoose.model<IApplication>("Application", ApplicationSchema, "applications");

// SystemMetrics Model
export interface ISystemMetrics extends Document {
  date: string;
  evaluations_count: number;
  quizzes_generated: number;
  quizzes_completed: number;
  avg_evaluation_time_ms: number;
  avg_quiz_generation_time_ms: number;
  acceptance_rate: number;
  quiz_pass_rate: number;
  files_processed: number;
  pdf_files: number;
  docx_files: number;
  processing_errors: number;
  api_calls: number;
  api_errors: number;
  created_at: Date;
  updated_at?: Date;
}

const SystemMetricsSchema = new Schema<ISystemMetrics>({
  date: { type: String, required: true, unique: true, index: true },
  evaluations_count: { type: Number, default: 0 },
  quizzes_generated: { type: Number, default: 0 },
  quizzes_completed: { type: Number, default: 0 },
  avg_evaluation_time_ms: { type: Number, default: 0.0 },
  avg_quiz_generation_time_ms: { type: Number, default: 0.0 },
  acceptance_rate: { type: Number, default: 0.0 },
  quiz_pass_rate: { type: Number, default: 0.0 },
  files_processed: { type: Number, default: 0 },
  pdf_files: { type: Number, default: 0 },
  docx_files: { type: Number, default: 0 },
  processing_errors: { type: Number, default: 0 },
  api_calls: { type: Number, default: 0 },
  api_errors: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date }
});

SystemMetricsSchema.index({ date: 1 }, { unique: true });
SystemMetricsSchema.index({ created_at: -1 });

export const SystemMetrics = mongoose.model<ISystemMetrics>("SystemMetrics", SystemMetricsSchema, "system_metrics");

// EmailNotification Model
export interface IEmailNotification extends Document {
  recipient_email: string;
  notification_type: string; // CV_RESULT, QUIZ_RESULT, SYSTEM
  subject: string;
  body: string;
  cv_evaluation_id?: string;
  quiz_result_id?: string;
  status: string; // PENDING, SENT, FAILED
  sent_at?: Date;
  error_message?: string;
  retry_count: number;
  created_at: Date;
}

const EmailNotificationSchema = new Schema<IEmailNotification>({
  recipient_email: { type: String, required: true, index: true },
  notification_type: { type: String, required: true, index: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  cv_evaluation_id: { type: String },
  quiz_result_id: { type: String },
  status: { type: String, default: "PENDING", index: true },
  sent_at: { type: Date },
  error_message: { type: String },
  retry_count: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
});

EmailNotificationSchema.index({ recipient_email: 1 });
EmailNotificationSchema.index({ status: 1 });
EmailNotificationSchema.index({ notification_type: 1 });
EmailNotificationSchema.index({ created_at: -1 });

export const EmailNotification = mongoose.model<IEmailNotification>("EmailNotification", EmailNotificationSchema, "email_notifications");

