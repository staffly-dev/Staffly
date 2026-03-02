import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  JobPosting,
  JobPostingDocument,
} from '../jobs/schemas/job-posting.schema';
import {
  Application,
  ApplicationDocument,
} from '../applications/schemas/application.schema';
import {
  CVEvaluation,
  CVEvaluationDocument,
} from '../evaluation/schemas/cv-evaluation.schema';
import {
  QuizSession,
  QuizSessionDocument,
} from '../quiz/schemas/quiz-session.schema';
import {
  QuizResult,
  QuizResultDocument,
} from '../quiz/schemas/quiz-result.schema';
import { EvaluationDecision } from '../evaluation/evaluation-decision';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(JobPosting.name)
    private readonly jobPostingModel: Model<JobPostingDocument>,
    @InjectModel(Application.name)
    private readonly applicationModel: Model<ApplicationDocument>,
    @InjectModel(CVEvaluation.name)
    private readonly cvEvaluationModel: Model<CVEvaluationDocument>,
    @InjectModel(QuizSession.name)
    private readonly quizSessionModel: Model<QuizSessionDocument>,
    @InjectModel(QuizResult.name)
    private readonly quizResultModel: Model<QuizResultDocument>,
  ) {}

  async getEvaluationStatistics(): Promise<{
    total_evaluations: number;
    acceptance_rate: number;
    average_score: number;
  }> {
    const total = await this.cvEvaluationModel.countDocuments({}).exec();
    if (total === 0) {
      return { total_evaluations: 0, acceptance_rate: 0, average_score: 0 };
    }

    const accepted = await this.cvEvaluationModel
      .countDocuments({
        decision: {
          $in: [EvaluationDecision.ACCEPT, EvaluationDecision.ACCEPTED],
        },
      })
      .exec();

    const avg = await this.cvEvaluationModel
      .aggregate<{
        _id: null;
        avgScore: number;
      }>([{ $group: { _id: null, avgScore: { $avg: '$score' } } }])
      .exec();

    const averageScore = avg[0]?.avgScore ?? 0;
    const acceptanceRate = (accepted / total) * 100;

    return {
      total_evaluations: total,
      acceptance_rate: acceptanceRate,
      average_score: averageScore,
    };
  }

  async getQuizStatistics(): Promise<{
    total_quizzes: number;
    pass_rate: number;
  }> {
    const total = await this.quizResultModel.countDocuments({}).exec();
    if (total === 0) return { total_quizzes: 0, pass_rate: 0 };

    const passed = await this.quizResultModel
      .countDocuments({ status: 'PASSED' })
      .exec();

    return {
      total_quizzes: total,
      pass_rate: (passed / total) * 100,
    };
  }

  async getUserEvaluationStatistics(userId: string): Promise<{
    total_evaluations: number;
    acceptance_rate: number;
    average_score: number;
  }> {
    const filter = { created_by: userId } as const;
    const total = await this.cvEvaluationModel.countDocuments(filter).exec();
    if (total === 0) {
      return { total_evaluations: 0, acceptance_rate: 0, average_score: 0 };
    }

    const accepted = await this.cvEvaluationModel
      .countDocuments({
        ...filter,
        decision: {
          $in: [EvaluationDecision.ACCEPT, EvaluationDecision.ACCEPTED],
        },
      })
      .exec();

    const avg = await this.cvEvaluationModel
      .aggregate<{
        _id: null;
        avgScore: number;
      }>([
        { $match: filter },
        { $group: { _id: null, avgScore: { $avg: '$score' } } },
      ])
      .exec();

    const averageScore = avg[0]?.avgScore ?? 0;
    const acceptanceRate = (accepted / total) * 100;

    return {
      total_evaluations: total,
      acceptance_rate: acceptanceRate,
      average_score: averageScore,
    };
  }

  async getUserQuizStatistics(userId: string): Promise<{
    total_quizzes: number;
    pass_rate: number;
  }> {
    // Count quiz sessions created by this user and their results
    const sessions = await this.quizSessionModel
      .find({ created_by: userId })
      .select('_id')
      .exec();
    if (!sessions.length) return { total_quizzes: 0, pass_rate: 0 };

    const sessionIds = sessions.map((s) => s._id.toString());
    const total = await this.quizResultModel
      .countDocuments({ quiz_session_id: { $in: sessionIds } })
      .exec();
    if (total === 0) return { total_quizzes: 0, pass_rate: 0 };

    const passed = await this.quizResultModel
      .countDocuments({
        quiz_session_id: { $in: sessionIds },
        status: 'PASSED',
      })
      .exec();

    return {
      total_quizzes: total,
      pass_rate: (passed / total) * 100,
    };
  }

  async getAllJobPostings(
    ownerUserId: string,
    includeInactive = false,
  ): Promise<JobPostingDocument[]> {
    const filter: Record<string, unknown> = { owner_user_id: ownerUserId };
    if (!includeInactive) filter.is_active = true;
    return this.jobPostingModel.find(filter).sort({ created_at: -1 }).exec();
  }

  async getAllApplications(
    ownerUserId: string,
  ): Promise<ApplicationDocument[]> {
    const jobs = await this.jobPostingModel
      .find({ owner_user_id: ownerUserId })
      .select('job_id')
      .exec();
    const jobIds = jobs.map((j) => j.job_id);
    if (!jobIds.length) return [];

    return this.applicationModel
      .find({ job_id: { $in: jobIds } })
      .sort({ submitted_at: -1 })
      .exec();
  }

  async getJobStatistics(): Promise<{
    total_jobs: number;
    total_applications: number;
    total_accepted: number;
    total_rejected: number;
  }> {
    const totalJobs = await this.jobPostingModel.countDocuments({}).exec();
    const totalApplications = await this.applicationModel
      .countDocuments({})
      .exec();
    const totalAccepted = await this.applicationModel
      .countDocuments({ status: 'ACCEPTED' })
      .exec();
    const totalRejected = await this.applicationModel
      .countDocuments({ status: 'REJECTED' })
      .exec();

    return {
      total_jobs: totalJobs,
      total_applications: totalApplications,
      total_accepted: totalAccepted,
      total_rejected: totalRejected,
    };
  }
}
