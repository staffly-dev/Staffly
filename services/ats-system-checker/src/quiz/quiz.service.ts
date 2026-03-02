/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { QuizUsersDto } from './dto/quiz-users.dto';
import { QuizSessionDto } from './dto/quiz-session.dto';
import {
  QuizSession,
  QuizSessionDocument,
} from './schemas/quiz-session.schema';
import { QuizResult, QuizResultDocument } from './schemas/quiz-result.schema';
import {
  JobPosting,
  JobPostingDocument,
} from '../jobs/schemas/job-posting.schema';
import {
  Application,
  ApplicationDocument,
} from '../applications/schemas/application.schema';

@Injectable()
export class QuizService {
  private readonly frontendQuizUrl: string;

  constructor(
    private readonly config: ConfigService,
    @InjectModel(QuizSession.name)
    private readonly quizSessionModel: Model<QuizSessionDocument>,
    @InjectModel(QuizResult.name)
    private readonly quizResultModel: Model<QuizResultDocument>,
    @InjectModel(JobPosting.name)
    private readonly jobPostingModel: Model<JobPostingDocument>,
    @InjectModel(Application.name)
    private readonly applicationModel: Model<ApplicationDocument>,
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {
    this.frontendQuizUrl =
      this.config.get<string>('FRONTEND_URL_QUIZ') ||
      this.config.get<string>('FRONTEND_ORIGIN') ||
      'http://localhost:3000';
  }

  async submit(body: SubmitQuizDto) {
    const { answers, quiz_session_id, email } = body;
    if (!answers || !quiz_session_id || !email) {
      throw new BadRequestException(
        'answers, quiz_session_id, and email are required',
      );
    }

    let answerArray: number[];
    if (Array.isArray(answers)) {
      answerArray = answers.map((a) => Number(a));
    } else if (typeof answers === 'string') {
      try {
        const parsed = JSON.parse(answers);
        answerArray = Array.isArray(parsed)
          ? parsed.map((a: unknown) => Number(a))
          : [Number(answers)];
      } catch {
        throw new BadRequestException(
          'answers must be a valid JSON array of numbers',
        );
      }
    } else {
      answerArray = Object.values(answers).map((a: unknown) => Number(a));
    }

    const session = await this.getQuizSessionById(quiz_session_id);
    if (!session) throw new NotFoundException('Quiz session not found');
    if (session.candidate_email && session.candidate_email !== email) {
      throw new ForbiddenException('Email does not match quiz session');
    }

    const questions = session.questions;
    let score = 0;
    for (let i = 0; i < questions.length && i < answerArray.length; i++) {
      if (questions[i].correct_answer === answerArray[i]) score++;
    }
    const percentage = (score / questions.length) * 100;
    const status = score >= session.pass_threshold ? 'PASSED' : 'FAILED';

    await this.saveQuizResult({
      quizSessionId: quiz_session_id,
      answers: answerArray,
      score,
      totalQuestions: questions.length,
      percentage,
      status,
      candidateEmail: email,
      associatedCvFilename: session.associated_cv_filename,
    });

    await this.updateQuizSession(quiz_session_id, {
      status: 'COMPLETED',
      completed_at: new Date(),
    });

    const applicationId = session.application_id;
    if (applicationId) {
      await this.updateApplication(applicationId, { quiz_score: score });
    }

    // Derive job title & candidate name for notifications
    let jobTitle = 'Job Position';
    try {
      const jobs = await this.jobPostingModel
        .find({})
        .select('title description')
        .exec();
      const match = jobs.find((j) => j.description === session.job_description);
      if (match) jobTitle = match.title;
    } catch {
      // ignore lookup errors
    }

    let candidateName = 'Candidate';
    try {
      const app = await this.getApplicationByCandidateEmailAndCv(
        email,
        session.associated_cv_filename,
      );
      if (app?.candidate_name) candidateName = app.candidate_name;
    } catch {
      // ignore lookup errors
    }

    if (email) {
      // Fire-and-forget notification to HRMS notification service
      this.natsClient.emit('notification.ats.quiz_result', {
        toEmail: email,
        candidateName,
        jobTitle,
        score,
        totalQuestions: questions.length,
        passed: status === 'PASSED',
      });
    }

    return {
      success: true,
      message: `Quiz evaluation complete: ${score}/${questions.length}`,
      data: {
        quiz_id: quiz_session_id,
        score,
        total_questions: questions.length,
        percentage,
        passed: status === 'PASSED',
      },
    };
  }

  async getUsers(payload: QuizUsersDto) {
    const userId = payload?.user_id;
    if (userId && (userId.length !== 24 || !/^[0-9a-f]{24}$/i.test(userId))) {
      throw new BadRequestException('Invalid user_id format');
    }

    const sessions = await this.getAllQuizSessions(userId);
    const quizUsers: any[] = [];

    for (const session of sessions) {
      const result = await this.getQuizResultBySessionId(
        session._id.toString(),
      );
      quizUsers.push({
        quiz_session_id: session._id.toString(),
        candidate_email: session.candidate_email,
        quiz_link: `${this.frontendQuizUrl}/quiz/${session._id.toString()}`,
        quiz_status: session.status,
        created_at: session.created_at,
        started_at: session.started_at,
        completed_at: session.completed_at,
        score: result?.score,
        total_questions: result?.total_questions,
        percentage: result?.percentage,
        passed: result?.status === 'PASSED',
      });
    }

    return { total_quizzes: quizUsers.length, quiz_users: quizUsers };
  }

  async getBySession(payload: QuizSessionDto) {
    const sessionId = payload?.session_id;
    if (!sessionId?.trim()) {
      throw new BadRequestException('session_id is required');
    }

    const session = await this.getQuizSessionById(sessionId);
    if (!session) throw new NotFoundException('Quiz session not found');

    if (session.status === 'GENERATED') {
      await this.updateQuizSession(sessionId, {
        status: 'IN_PROGRESS',
        started_at: new Date(),
      });
    }

    const questionsForClient = session.questions.map((q: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { correct_answer: _omit, ...rest } = q;
      return rest;
    });

    return {
      quiz_session_id: sessionId,
      questions: questionsForClient,
      total_questions: session.total_questions,
      time_limit_seconds: session.time_limit_seconds,
      pass_threshold: session.pass_threshold,
      status: session.status,
      created_at: session.created_at,
      started_at: session.started_at,
    };
  }
  // ======== Private helpers using Mongoose models (quiz domain only) ========

  private async getQuizSessionById(
    quizId: string,
  ): Promise<QuizSessionDocument | null> {
    if (!isValidObjectId(quizId)) return null;
    return this.quizSessionModel.findById(quizId).exec();
  }

  private async updateQuizSession(
    quizId: string,
    updates: Partial<QuizSession>,
  ): Promise<QuizSessionDocument | null> {
    if (!isValidObjectId(quizId)) return null;
    return this.quizSessionModel
      .findByIdAndUpdate(quizId, updates, { new: true })
      .exec();
  }

  private async saveQuizResult(args: {
    quizSessionId: string;
    answers: number[];
    score: number;
    totalQuestions: number;
    percentage: number;
    status: string;
    candidateEmail?: string;
    associatedCvFilename?: string;
    timeTakenSeconds?: number;
    createdBy?: string;
  }): Promise<QuizResultDocument> {
    const {
      quizSessionId,
      answers,
      score,
      totalQuestions,
      percentage,
      status,
      candidateEmail,
      associatedCvFilename,
      timeTakenSeconds,
      createdBy,
    } = args;

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

  private async getQuizResultBySessionId(
    quizSessionId: string,
  ): Promise<QuizResultDocument | null> {
    return this.quizResultModel
      .findOne({ quiz_session_id: quizSessionId })
      .sort({ submitted_at: -1 })
      .exec();
  }

  private async getApplicationByCandidateEmailAndCv(
    candidateEmail: string,
    cvFilename?: string,
  ): Promise<ApplicationDocument | null> {
    const filter: Record<string, unknown> = { candidate_email: candidateEmail };
    if (cvFilename) filter.cv_filename = cvFilename;
    return this.applicationModel
      .findOne(filter)
      .sort({ submitted_at: -1 })
      .exec();
  }

  private async updateApplication(
    applicationId: string,
    updates: Partial<Application>,
  ): Promise<ApplicationDocument | null> {
    return this.applicationModel
      .findOneAndUpdate({ application_id: applicationId }, updates, {
        new: true,
      })
      .exec();
  }

  private async getAllQuizSessions(
    ownerUserId?: string,
  ): Promise<QuizSessionDocument[]> {
    if (!ownerUserId) {
      return this.quizSessionModel.find().sort({ created_at: -1 }).exec();
    }

    const userJobs = await this.jobPostingModel
      .find({ owner_user_id: ownerUserId })
      .select('job_id')
      .exec();
    const jobIds = userJobs.map((j) => j.job_id);

    const applications = await this.applicationModel
      .find({ job_id: { $in: jobIds } })
      .select('application_id')
      .exec();
    const applicationIds = applications.map((a) => a.application_id);

    return this.quizSessionModel
      .find({ application_id: { $in: applicationIds } })
      .sort({ created_at: -1 })
      .exec();
  }
}
