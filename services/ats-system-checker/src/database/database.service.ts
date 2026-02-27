import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import {
  CVEvaluation,
  CVEvaluationDocument,
  QuizSession,
  QuizSessionDocument,
  QuizResult,
  QuizResultDocument,
  JobPosting,
  JobPostingDocument,
  Application,
  ApplicationDocument,
  SystemMetrics,
  SystemMetricsDocument,
  EmailNotification,
  EmailNotificationDocument,
} from '../schemas';
import { EvaluationDecision } from '../common/evaluation-decision';

@Injectable()
export class DatabaseService {
  private readonly _applicationNotDeletedFilter = { status: { $ne: 'DELETED' } as any };

  constructor(
    @InjectModel(CVEvaluation.name) private cvEvaluationModel: Model<CVEvaluationDocument>,
    @InjectModel(QuizSession.name) private quizSessionModel: Model<QuizSessionDocument>,
    @InjectModel(QuizResult.name) private quizResultModel: Model<QuizResultDocument>,
    @InjectModel(JobPosting.name) private jobPostingModel: Model<JobPostingDocument>,
    @InjectModel(Application.name) private applicationModel: Model<ApplicationDocument>,
    @InjectModel(SystemMetrics.name) private systemMetricsModel: Model<SystemMetricsDocument>,
    @InjectModel(EmailNotification.name) private emailNotificationModel: Model<EmailNotificationDocument>,
  ) { }

  private _generateHash(text: string): string {
    return crypto.createHash('md5').update(text).digest('hex');
  }

  async saveCvEvaluation(
    filename: string,
    jobDescription: string,
    decision: string,
    score: number,
    evaluationText: string,
    cvTextLength: number,
    email?: string,
    processingTimeMs?: number,
    createdBy?: string,
  ): Promise<CVEvaluationDocument> {
    const jobDescriptionHash = this._generateHash(jobDescription);
    const evaluation = new this.cvEvaluationModel({
      filename,
      job_description_hash: jobDescriptionHash,
      job_description: jobDescription,
      decision,
      score,
      evaluation_text: evaluationText,
      cv_text_length: cvTextLength,
      email,
      processing_time_ms: processingTimeMs,
      created_by: createdBy,
      created_at: new Date(),
    });
    return evaluation.save();
  }

  async getCvEvaluationByFilename(filename: string): Promise<CVEvaluationDocument | null> {
    return this.cvEvaluationModel.findOne({ filename }).exec();
  }

  async createJobPosting(
    title: string,
    description: string,
    requiredSkills: string[],
    additionalDetails?: string,
    hrEmail?: string,
    hrName?: string,
    evaluationThreshold = 70,
    quizRequired = true,
    quizPassThreshold = 7,
    ownerUserId?: string,
    ownerUsername?: string,
  ): Promise<JobPostingDocument> {
    const jobId = crypto.randomBytes(4).toString('hex');
    const descriptionHash = this._generateHash(description);
    const job = new this.jobPostingModel({
      title,
      description,
      required_skills: requiredSkills,
      additional_details: additionalDetails,
      job_id: jobId,
      description_hash: descriptionHash,
      hr_email: hrEmail,
      hr_name: hrName,
      evaluation_threshold: evaluationThreshold,
      quiz_required: quizRequired,
      quiz_pass_threshold: quizPassThreshold,
      owner_user_id: ownerUserId,
      owner_username: ownerUsername,
      created_at: new Date(),
      is_active: true,
    });
    return job.save();
  }

  async getJobPostingById(jobId: string): Promise<JobPostingDocument | null> {
    return this.jobPostingModel.findOne({ job_id: jobId }).exec();
  }

  async getAllJobPostings(ownerUserId?: string, includeInactive = false): Promise<JobPostingDocument[]> {
    const filter: any = {};
    if (!includeInactive) filter.is_active = true;
    if (ownerUserId) filter.owner_user_id = ownerUserId;
    return this.jobPostingModel.find(filter).sort({ created_at: -1 }).exec();
  }

  async updateJobPosting(jobId: string, updates: Partial<JobPosting>): Promise<JobPostingDocument | null> {
    return this.jobPostingModel
      .findOneAndUpdate({ job_id: jobId }, { ...updates, updated_at: new Date() }, { new: true })
      .exec();
  }

  async deleteJobPosting(jobId: string): Promise<boolean> {
    const result = await this.jobPostingModel
      .findOneAndUpdate({ job_id: jobId }, { is_active: false, updated_at: new Date() }, { new: true })
      .exec();
    return result !== null;
  }

  async createApplication(
    applicationId: string,
    jobId: string,
    cvFilename: string,
    candidateEmail?: string,
    candidateName?: string,
  ): Promise<ApplicationDocument> {
    const app = new this.applicationModel({
      application_id: applicationId,
      job_id: jobId,
      cv_filename: cvFilename,
      candidate_email: candidateEmail,
      candidate_name: candidateName,
      status: 'SUBMITTED',
      submitted_at: new Date(),
    });
    return app.save();
  }

  async getApplicationById(applicationId: string): Promise<ApplicationDocument | null> {
    return this.applicationModel.findOne({ application_id: applicationId, ...this._applicationNotDeletedFilter }).exec();
  }

  async getApplicationsByJobId(jobId: string): Promise<ApplicationDocument[]> {
    return this.applicationModel
      .find({ job_id: jobId, ...this._applicationNotDeletedFilter })
      .sort({ submitted_at: -1 })
      .exec();
  }

  async getApplicationByCandidateEmailAndCv(
    candidateEmail: string,
    cvFilename?: string,
  ): Promise<ApplicationDocument | null> {
    const filter: any = { ...this._applicationNotDeletedFilter, candidate_email: candidateEmail };
    if (cvFilename) filter.cv_filename = cvFilename;
    return this.applicationModel.findOne(filter).sort({ submitted_at: -1 }).exec();
  }

  async getAllApplications(ownerUserId?: string): Promise<ApplicationDocument[]> {
    if (ownerUserId) {
      const userJobs = await this.jobPostingModel.find({ owner_user_id: ownerUserId }).select('job_id').exec();
      const jobIds = userJobs.map((j) => j.job_id);
      return this.applicationModel
        .find({ job_id: { $in: jobIds }, ...this._applicationNotDeletedFilter })
        .sort({ submitted_at: -1 })
        .exec();
    }
    return this.applicationModel.find(this._applicationNotDeletedFilter).sort({ submitted_at: -1 }).exec();
  }

  async updateApplication(applicationId: string, updates: Partial<Application>): Promise<ApplicationDocument | null> {
    return this.applicationModel.findOneAndUpdate({ application_id: applicationId }, updates, { new: true }).exec();
  }

  async saveQuizSession(
    jobDescription: string,
    questions: any[],
    associatedCvFilename?: string,
    candidateEmail?: string,
    timeLimitSeconds = 300,
    passThreshold = 7,
    createdBy?: string,
    applicationId?: string,
  ): Promise<QuizSessionDocument> {
    const jobDescriptionHash = this._generateHash(jobDescription);
    const session = new this.quizSessionModel({
      job_description: jobDescription,
      job_description_hash: jobDescriptionHash,
      questions,
      total_questions: questions.length,
      associated_cv_filename: associatedCvFilename,
      candidate_email: candidateEmail,
      application_id: applicationId,
      time_limit_seconds: timeLimitSeconds,
      pass_threshold: passThreshold,
      status: 'GENERATED',
      created_at: new Date(),
      created_by: createdBy,
    });
    return session.save();
  }

  async getQuizSessionById(quizId: string): Promise<QuizSessionDocument | null> {
    const mongoose = await import('mongoose');
    if (mongoose.isValidObjectId(quizId)) {
      return this.quizSessionModel.findById(quizId).exec();
    }
    return null;
  }

  async getQuizSessionForJob(jobId: string): Promise<QuizSessionDocument | null> {
    const job = await this.getJobPostingById(jobId);
    if (!job) return null;
    const jobDescriptionHash = this._generateHash(job.description);
    return this.quizSessionModel.findOne({ job_description_hash: jobDescriptionHash }).sort({ created_at: -1 }).exec();
  }

  async updateQuizSession(quizId: string, updates: Partial<QuizSession>): Promise<QuizSessionDocument | null> {
    const mongoose = await import('mongoose');
    if (mongoose.isValidObjectId(quizId)) {
      return this.quizSessionModel.findByIdAndUpdate(quizId, updates, { new: true }).exec();
    }
    return null;
  }

  async saveQuizResult(
    quizSessionId: string,
    answers: number[],
    score: number,
    totalQuestions: number,
    percentage: number,
    status: string,
    candidateEmail?: string,
    associatedCvFilename?: string,
    timeTakenSeconds?: number,
    createdBy?: string,
  ): Promise<QuizResultDocument> {
    const result = new this.quizResultModel({
      quiz_session_id: quizSessionId,
      answers,
      score,
      total_questions: totalQuestions,
      percentage,
      status,
      candidate_email: candidateEmail,
      associated_cv_filename: associatedCvFilename,
      time_taken_seconds: timeTakenSeconds,
      submitted_at: new Date(),
      created_by: createdBy,
    });
    return result.save();
  }

  async getQuizResultBySessionId(quizSessionId: string): Promise<QuizResultDocument | null> {
    return this.quizResultModel.findOne({ quiz_session_id: quizSessionId }).sort({ submitted_at: -1 }).exec();
  }

  async getQuizResultByApplicationId(applicationId: string): Promise<QuizResultDocument | null> {
    const session = await this.quizSessionModel.findOne({ application_id: applicationId }).sort({ created_at: -1 }).exec();
    if (!session) return null;
    return this.getQuizResultBySessionId(session._id.toString());
  }

  async saveEmailNotification(
    recipientEmail: string,
    notificationType: string,
    subject: string,
    body: string,
    cvEvaluationId?: string,
    quizResultId?: string,
  ): Promise<EmailNotificationDocument> {
    const notification = new this.emailNotificationModel({
      recipient_email: recipientEmail,
      notification_type: notificationType,
      subject,
      body,
      cv_evaluation_id: cvEvaluationId,
      quiz_result_id: quizResultId,
      status: 'PENDING',
      retry_count: 0,
      created_at: new Date(),
    });
    return notification.save();
  }

  async updateEmailNotificationStatus(
    notificationId: string,
    status: string,
    errorMessage?: string,
  ): Promise<EmailNotificationDocument | null> {
    const mongoose = await import('mongoose');
    if (!mongoose.isValidObjectId(notificationId)) return null;
    const updates: any = { status };
    if (status === 'SENT') updates.sent_at = new Date();
    if (errorMessage) {
      updates.error_message = errorMessage;
    }
    return this.emailNotificationModel
      .findByIdAndUpdate(
        notificationId,
        errorMessage ? { ...updates, $inc: { retry_count: 1 } } : updates,
        { new: true },
      )
      .exec();
  }

  async getEvaluationStatistics(): Promise<any> {
    const totalEvaluations = await this.cvEvaluationModel.countDocuments();
    const totalAccepted = await this.cvEvaluationModel.countDocuments({ decision: EvaluationDecision.ACCEPTED });
    const totalRejected = await this.cvEvaluationModel.countDocuments({ decision: EvaluationDecision.REJECTED });
    const acceptanceRate = totalEvaluations > 0 ? (totalAccepted / totalEvaluations) * 100 : 0;
    const avgResult = await this.cvEvaluationModel.aggregate([{ $group: { _id: null, avg_score: { $avg: '$score' } } }]).exec();
    const averageScore = avgResult.length > 0 ? avgResult[0].avg_score : 0;
    return {
      total_evaluations: totalEvaluations,
      total_accepted: totalAccepted,
      total_rejected: totalRejected,
      acceptance_rate: Math.round(acceptanceRate * 100) / 100,
      average_score: Math.round(averageScore * 100) / 100,
    };
  }

  async getJobStatistics(): Promise<any> {
    const totalJobs = await this.jobPostingModel.countDocuments({ is_active: true });
    const totalApplications = await this.applicationModel.countDocuments();
    const totalAccepted = await this.applicationModel.countDocuments({ status: 'ACCEPTED' });
    const totalRejected = await this.applicationModel.countDocuments({ status: 'REJECTED' });
    return {
      total_jobs: totalJobs,
      total_applications: totalApplications,
      total_accepted: totalAccepted,
      total_rejected: totalRejected,
    };
  }

  async getQuizStatistics(): Promise<any> {
    const totalQuizzes = await this.quizSessionModel.countDocuments();
    const totalCompleted = await this.quizResultModel.countDocuments();
    const totalPassed = await this.quizResultModel.countDocuments({ status: 'PASSED' });
    const passRate = totalCompleted > 0 ? (totalPassed / totalCompleted) * 100 : 0;
    return { total_quizzes: totalQuizzes, total_completed: totalCompleted, total_passed: totalPassed, pass_rate: Math.round(passRate * 100) / 100 };
  }

  async getAllQuizSessions(ownerUserId?: string): Promise<QuizSessionDocument[]> {
    if (ownerUserId) {
      const userJobs = await this.jobPostingModel.find({ owner_user_id: ownerUserId }).select('job_id').exec();
      const jobIds = userJobs.map((j) => j.job_id);
      const applications = await this.applicationModel.find({ job_id: { $in: jobIds } }).select('application_id').exec();
      const applicationIds = applications.map((a) => a.application_id);
      return this.quizSessionModel.find({ application_id: { $in: applicationIds } }).sort({ created_at: -1 }).exec();
    }
    return this.quizSessionModel.find().sort({ created_at: -1 }).exec();
  }

  async getUserEvaluationStatistics(ownerUserId: string): Promise<any> {
    const userJobs = await this.jobPostingModel.find({ owner_user_id: ownerUserId }).select('job_id').exec();
    const jobIds = userJobs.map((j) => j.job_id);
    const applications = await this.applicationModel.find({ job_id: { $in: jobIds } }).select('application_id').exec();
    const applicationIds = applications.map((a) => a.application_id);
    const totalEvaluations = await this.cvEvaluationModel.countDocuments({ application_id: { $in: applicationIds } } as any);
    const totalAccepted = await this.cvEvaluationModel.countDocuments({ application_id: { $in: applicationIds }, decision: EvaluationDecision.ACCEPTED } as any);
    const totalRejected = await this.cvEvaluationModel.countDocuments({ application_id: { $in: applicationIds }, decision: EvaluationDecision.REJECTED } as any);
    const acceptanceRate = totalEvaluations > 0 ? (totalAccepted / totalEvaluations) * 100 : 0;
    const avgResult = await this.cvEvaluationModel
      .aggregate([{ $match: { application_id: { $in: applicationIds } } }, { $group: { _id: null, avg_score: { $avg: '$score' } } }])
      .exec();
    const averageScore = avgResult.length > 0 ? avgResult[0].avg_score : 0;
    return {
      total_evaluations: totalEvaluations,
      total_accepted: totalAccepted,
      total_rejected: totalRejected,
      acceptance_rate: Math.round(acceptanceRate * 100) / 100,
      average_score: Math.round(averageScore * 100) / 100,
    };
  }

  async getUserQuizStatistics(ownerUserId: string): Promise<any> {
    const userJobs = await this.jobPostingModel.find({ owner_user_id: ownerUserId }).select('job_id').exec();
    const jobIds = userJobs.map((j) => j.job_id);
    const applications = await this.applicationModel.find({ job_id: { $in: jobIds } }).select('application_id').exec();
    const applicationIds = applications.map((a) => a.application_id);
    const totalQuizzes = await this.quizSessionModel.countDocuments({ application_id: { $in: applicationIds } });
    const sessions = await this.quizSessionModel.find({ application_id: { $in: applicationIds } }).select('_id').exec();
    const sessionIds = sessions.map((s) => s._id.toString());
    const totalCompleted = await this.quizResultModel.countDocuments({ quiz_session_id: { $in: sessionIds } });
    const totalPassed = await this.quizResultModel.countDocuments({ quiz_session_id: { $in: sessionIds }, status: 'PASSED' });
    const passRate = totalCompleted > 0 ? (totalPassed / totalCompleted) * 100 : 0;
    return { total_quizzes: totalQuizzes, total_completed: totalCompleted, total_passed: totalPassed, pass_rate: Math.round(passRate * 100) / 100 };
  }

  async getSampleData(limit: number): Promise<any> {
    const [cvEvals, quizSessions, quizResults, jobs, apps, metrics, emails] = await Promise.all([
      this.cvEvaluationModel.find().limit(limit).lean().exec(),
      this.quizSessionModel.find().limit(limit).lean().exec(),
      this.quizResultModel.find().limit(limit).lean().exec(),
      this.jobPostingModel.find().limit(limit).lean().exec(),
      this.applicationModel.find().limit(limit).lean().exec(),
      this.systemMetricsModel.find().limit(limit).lean().exec(),
      this.emailNotificationModel.find().limit(limit).lean().exec(),
    ]);
    const [cvCount, quizSessionCount, quizResultCount, jobCount, appCount, metricsCount, emailCount] = await Promise.all([
      this.cvEvaluationModel.countDocuments(),
      this.quizSessionModel.countDocuments(),
      this.quizResultModel.countDocuments(),
      this.jobPostingModel.countDocuments(),
      this.applicationModel.countDocuments(),
      this.systemMetricsModel.countDocuments(),
      this.emailNotificationModel.countDocuments(),
    ]);
    return {
      success: true,
      sample_size: limit,
      data: {
        cv_evaluations: { total: cvCount, samples: cvEvals },
        quiz_sessions: { total: quizSessionCount, samples: quizSessions },
        quiz_results: { total: quizResultCount, samples: quizResults },
        job_postings: { total: jobCount, samples: jobs },
        applications: { total: appCount, samples: apps },
        system_metrics: { total: metricsCount, samples: metrics },
        email_notifications: { total: emailCount, samples: emails },
      },
      timestamp: new Date().toISOString(),
    };
  }
}
