import mongoose from "mongoose";
import crypto from "crypto";
import {
  CVEvaluation, ICVEvaluation,
  QuizSession, IQuizSession,
  QuizResult, IQuizResult,
  JobPosting, IJobPosting,
  Application, IApplication,
  SystemMetrics, ISystemMetrics,
  EmailNotification, IEmailNotification
} from "../models/database.models";
import { EvaluationDecision } from "../models/evaluation.models";

export class DatabaseService {
  private mongodb_url: string;
  private database_name: string;

  constructor(mongodb_url: string, database_name: string) {
    this.mongodb_url = mongodb_url;
    this.database_name = database_name;
  }

  async connect(): Promise<void> {
    try {
      await mongoose.connect(this.mongodb_url);
      console.log(`Connected to MongoDB: ${this.database_name}`);
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      console.log("Disconnected from MongoDB");
    } catch (error) {
      console.error("Error disconnecting from MongoDB:", error);
    }
  }

  async health_check(): Promise<boolean> {
    try {
      if (!mongoose.connection.db) {
        return false;
      }
      await mongoose.connection.db.admin().ping();
      return true;
    } catch (error) {
      console.error("Database health check failed:", error);
      return false;
    }
  }

  private _generate_hash(text: string): string {
    return crypto.createHash("md5").update(text).digest("hex");
  }

  // CV Evaluation methods
  async save_cv_evaluation(
    filename: string,
    job_description: string,
    decision: EvaluationDecision,
    score: number,
    evaluation_text: string,
    cv_text_length: number,
    email?: string,
    processing_time_ms?: number,
    created_by?: string
  ): Promise<ICVEvaluation> {
    const job_description_hash = this._generate_hash(job_description);

    const evaluation = new CVEvaluation({
      filename,
      job_description_hash,
      job_description,
      decision,
      score,
      evaluation_text,
      cv_text_length,
      email,
      processing_time_ms,
      created_by,
      created_at: new Date()
    });

    return await evaluation.save();
  }

  async get_cv_evaluation_by_filename(filename: string): Promise<ICVEvaluation | null> {
    return await CVEvaluation.findOne({ filename }).exec();
  }

  // Job Posting methods
  async create_job_posting(
    title: string,
    description: string,
    required_skills: string[],
    additional_details?: string,
    hr_email?: string,
    hr_name?: string,
    evaluation_threshold: number = 70,
    quiz_required: boolean = true,
    quiz_pass_threshold: number = 7,
    owner_user_id?: string,
    owner_username?: string
  ): Promise<IJobPosting> {
    const job_id = crypto.randomBytes(4).toString("hex");
    const description_hash = this._generate_hash(description);

    const jobPosting = new JobPosting({
      title,
      description,
      required_skills,
      additional_details,
      job_id,
      description_hash,
      hr_email,
      hr_name,
      evaluation_threshold,
      quiz_required,
      quiz_pass_threshold,
      owner_user_id,
      owner_username,
      created_at: new Date(),
      is_active: true
    });

    return await jobPosting.save();
  }

  async get_job_posting_by_id(job_id: string): Promise<IJobPosting | null> {
    return await JobPosting.findOne({ job_id }).exec();
  }

  async get_all_job_postings(): Promise<IJobPosting[]> {
    return await JobPosting.find({ is_active: true }).sort({ created_at: -1 }).exec();
  }

  async update_job_posting(job_id: string, updates: Partial<IJobPosting>): Promise<IJobPosting | null> {
    updates.updated_at = new Date();
    return await JobPosting.findOneAndUpdate({ job_id }, updates, { new: true }).exec();
  }

  async delete_job_posting(job_id: string): Promise<boolean> {
    const result = await JobPosting.findOneAndUpdate(
      { job_id },
      { is_active: false, updated_at: new Date() },
      { new: true }
    ).exec();
    return result !== null;
  }

  // Application methods
  async create_application(
    application_id: string,
    job_id: string,
    cv_filename: string,
    candidate_email?: string,
    candidate_name?: string
  ): Promise<IApplication> {
    const application = new Application({
      application_id,
      job_id,
      cv_filename,
      candidate_email,
      candidate_name,
      status: "SUBMITTED",
      submitted_at: new Date()
    });

    return await application.save();
  }

  async get_application_by_id(application_id: string): Promise<IApplication | null> {
    return await Application.findOne({ application_id }).exec();
  }

  async get_applications_by_job_id(job_id: string): Promise<IApplication[]> {
    return await Application.find({ job_id }).sort({ submitted_at: -1 }).exec();
  }

  async get_all_applications(): Promise<IApplication[]> {
    return await Application.find().sort({ submitted_at: -1 }).exec();
  }

  async update_application(application_id: string, updates: Partial<IApplication>): Promise<IApplication | null> {
    return await Application.findOneAndUpdate({ application_id }, updates, { new: true }).exec();
  }

  // Quiz Session methods
  async save_quiz_session(
    job_description: string,
    questions: any[],
    associated_cv_filename?: string,
    candidate_email?: string,
    time_limit_seconds: number = 300,
    pass_threshold: number = 7,
    created_by?: string
  ): Promise<IQuizSession> {
    const job_description_hash = this._generate_hash(job_description);

    const quizSession = new QuizSession({
      job_description,
      job_description_hash,
      questions,
      total_questions: questions.length,
      associated_cv_filename,
      candidate_email,
      time_limit_seconds,
      pass_threshold,
      status: "GENERATED",
      created_at: new Date(),
      created_by
    });

    return await quizSession.save();
  }

  async get_quiz_session_by_id(quiz_id: string): Promise<IQuizSession | null> {
    if (mongoose.Types.ObjectId.isValid(quiz_id)) {
      return await QuizSession.findById(quiz_id).exec();
    }
    return null;
  }

  async get_quiz_session_for_job(job_id: string): Promise<IQuizSession | null> {
    const job = await this.get_job_posting_by_id(job_id);
    if (!job) return null;

    const job_description_hash = this._generate_hash(job.description);
    return await QuizSession.findOne({ job_description_hash })
      .sort({ created_at: -1 })
      .exec();
  }

  async update_quiz_session(quiz_id: string, updates: Partial<IQuizSession>): Promise<IQuizSession | null> {
    if (mongoose.Types.ObjectId.isValid(quiz_id)) {
      return await QuizSession.findByIdAndUpdate(quiz_id, updates, { new: true }).exec();
    }
    return null;
  }

  // Quiz Result methods
  async save_quiz_result(
    quiz_session_id: string,
    answers: number[],
    score: number,
    total_questions: number,
    percentage: number,
    status: string,
    candidate_email?: string,
    associated_cv_filename?: string,
    time_taken_seconds?: number,
    created_by?: string
  ): Promise<IQuizResult> {
    const quizResult = new QuizResult({
      quiz_session_id,
      answers,
      score,
      total_questions,
      percentage,
      status,
      candidate_email,
      associated_cv_filename,
      time_taken_seconds,
      submitted_at: new Date(),
      created_by
    });

    return await quizResult.save();
  }

  async get_quiz_result_by_session_id(quiz_session_id: string): Promise<IQuizResult | null> {
    return await QuizResult.findOne({ quiz_session_id }).sort({ submitted_at: -1 }).exec();
  }

  // Email Notification methods
  async save_email_notification(
    recipient_email: string,
    notification_type: string,
    subject: string,
    body: string,
    cv_evaluation_id?: string,
    quiz_result_id?: string
  ): Promise<IEmailNotification> {
    const notification = new EmailNotification({
      recipient_email,
      notification_type,
      subject,
      body,
      cv_evaluation_id,
      quiz_result_id,
      status: "PENDING",
      retry_count: 0,
      created_at: new Date()
    });

    return await notification.save();
  }

  async update_email_notification_status(
    notification_id: string,
    status: string,
    error_message?: string
  ): Promise<IEmailNotification | null> {
    const updates: any = { status };
    if (status === "SENT") {
      updates.sent_at = new Date();
    }
    if (error_message) {
      updates.error_message = error_message;
      updates.retry_count = { $inc: 1 };
    }

    if (mongoose.Types.ObjectId.isValid(notification_id)) {
      return await EmailNotification.findByIdAndUpdate(notification_id, updates, { new: true }).exec();
    }
    return null;
  }

  // Statistics methods
  async get_evaluation_statistics(): Promise<any> {
    const total_evaluations = await CVEvaluation.countDocuments();
    const total_accepted = await CVEvaluation.countDocuments({ decision: EvaluationDecision.ACCEPTED });
    const total_rejected = await CVEvaluation.countDocuments({ decision: EvaluationDecision.REJECTED });

    const acceptance_rate = total_evaluations > 0 ? (total_accepted / total_evaluations) * 100 : 0;

    const avgResult = await CVEvaluation.aggregate([
      { $group: { _id: null, avg_score: { $avg: "$score" } } }
    ]).exec();
    const average_score = avgResult.length > 0 ? avgResult[0].avg_score : 0;

    return {
      total_evaluations,
      total_accepted,
      total_rejected,
      acceptance_rate: Math.round(acceptance_rate * 100) / 100,
      average_score: Math.round(average_score * 100) / 100
    };
  }

  async get_job_statistics(): Promise<any> {
    const total_jobs = await JobPosting.countDocuments({ is_active: true });
    const total_applications = await Application.countDocuments();
    const total_accepted = await Application.countDocuments({ status: "ACCEPTED" });
    const total_rejected = await Application.countDocuments({ status: "REJECTED" });

    return {
      total_jobs,
      total_applications,
      total_accepted,
      total_rejected
    };
  }

  async get_quiz_statistics(): Promise<any> {
    const total_quizzes = await QuizSession.countDocuments();
    const total_completed = await QuizResult.countDocuments();
    const total_passed = await QuizResult.countDocuments({ status: "PASSED" });

    const pass_rate = total_completed > 0 ? (total_passed / total_completed) * 100 : 0;

    return {
      total_quizzes,
      total_completed,
      total_passed,
      pass_rate: Math.round(pass_rate * 100) / 100
    };
  }

  async get_all_quiz_sessions(): Promise<IQuizSession[]> {
    return await QuizSession.find().sort({ created_at: -1 }).exec();
  }
}

