/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EvaluationService } from '../evaluation/evaluation.service';
import { S3Service } from '../common/s3/s3.service';
import { EvaluationDecision } from '../evaluation/evaluation-decision';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as crypto from 'crypto';
import pdfParse from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';
import { JobPosting, JobPostingDocument } from './schemas/job-posting.schema';
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

@Injectable()
export class JobsService {
  private backendUrl: string;
  private frontendQuizUrl: string;

  constructor(
    private readonly config: ConfigService,
    @InjectModel(JobPosting.name)
    private readonly jobPostingModel: Model<JobPostingDocument>,
    @InjectModel(Application.name)
    private readonly applicationModel: Model<ApplicationDocument>,
    @InjectModel(CVEvaluation.name)
    private readonly cvEvaluationModel: Model<CVEvaluationDocument>,
    @InjectModel(QuizSession.name)
    private readonly quizSessionModel: Model<QuizSessionDocument>,
    private readonly evaluation: EvaluationService,
    private readonly s3: S3Service,
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {
    this.backendUrl =
      this.config.get<string>('BACKEND_URL') || 'http://localhost:4002';
    this.frontendQuizUrl =
      this.config.get<string>('FRONTEND_URL_QUIZ') ||
      this.config.get<string>('FRONTEND_ORIGIN') ||
      'http://localhost:3000';
  }

  async createJob(body: any): Promise<any> {
    const {
      title,
      description,
      required_skills,
      additional_details,
      hr_email,
      hr_name,
      owner_user_id,
      owner_username,
      evaluation_threshold = 70,
      quiz_required = true,
      quiz_pass_threshold = 7,
    } = body;
    if (!title?.trim() || !description?.trim() || !required_skills?.trim()) {
      throw new BadRequestException(
        'Job title, description, and required skills are required',
      );
    }
    const skillsList = String(required_skills)
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);
    const jobId = crypto.randomBytes(4).toString('hex');
    const descriptionHash = this.generateHash(description);
    const job = new this.jobPostingModel({
      title,
      description,
      required_skills: skillsList,
      additional_details,
      job_id: jobId,
      description_hash: descriptionHash,
      hr_email,
      hr_name,
      evaluation_threshold,
      quiz_required,
      quiz_pass_threshold,
      owner_user_id,
      owner_username,
      created_at: new Date(),
      is_active: true,
    });
    await job.save();
    return {
      job_id: job.job_id,
      title: job.title,
      description: job.description,
      required_skills: job.required_skills,
      shareable_link: `${this.backendUrl}/apply/${job.job_id}`,
      created_at: job.created_at,
      is_active: job.is_active,
      hr_email: job.hr_email,
      hr_name: job.hr_name,
      created_by: job.owner_user_id,
      owner_username: job.owner_username,
    };
  }

  async getJob(jobId: string, xUserId?: string): Promise<any> {
    const job = await this.jobPostingModel.findOne({ job_id: jobId }).exec();
    if (!job) throw new NotFoundException('Job posting not found');
    if (!job.is_active && (!xUserId || job.owner_user_id !== xUserId)) {
      throw new NotFoundException('Job posting not found');
    }
    return {
      job_id: job.job_id,
      title: job.title,
      description: job.description,
      required_skills: job.required_skills,
      shareable_link: `${this.backendUrl}/apply/${job.job_id}`,
      created_at: job.created_at,
      is_active: job.is_active,
      hr_email: job.hr_email,
      hr_name: job.hr_name,
      created_by: job.owner_user_id,
      owner_username: job.owner_username,
    };
  }

  async getAllJobs(
    ownerUserId?: string,
    includeInactive = false,
  ): Promise<any> {
    const filter: any = {};
    if (!includeInactive) filter.is_active = true;
    if (ownerUserId) filter.owner_user_id = ownerUserId;
    const jobs = await this.jobPostingModel
      .find(filter)
      .sort({ created_at: -1 })
      .exec();
    return {
      total_jobs: jobs.length,
      jobs: jobs.map((j) => ({
        job_id: j.job_id,
        title: j.title,
        description: j.description,
        required_skills: j.required_skills,
        shareable_link: `${this.backendUrl}/apply/${j.job_id}`,
        created_at: j.created_at,
        is_active: j.is_active,
        hr_email: j.hr_email,
        hr_name: j.hr_name,
        created_by: j.owner_user_id,
        owner_username: j.owner_username,
      })),
    };
  }

  async updateJob(
    jobId: string,
    updates: any,
    ownerUserId?: string,
  ): Promise<any> {
    if (ownerUserId) {
      const existing = await this.jobPostingModel
        .findOne({ job_id: jobId })
        .exec();
      if (!existing) throw new NotFoundException('Job posting not found');
      if (existing.owner_user_id !== ownerUserId)
        throw new ForbiddenException(
          'You can only update your own job postings',
        );
    }
    const job = await this.jobPostingModel
      .findOneAndUpdate(
        { job_id: jobId },
        { ...updates, updated_at: new Date() },
        { new: true },
      )
      .exec();
    if (!job) throw new NotFoundException('Job posting not found');
    return {
      job_id: job.job_id,
      title: job.title,
      description: job.description,
      required_skills: job.required_skills,
      shareable_link: `${this.backendUrl}/apply/${job.job_id}`,
      created_at: job.created_at,
      is_active: job.is_active,
      hr_email: job.hr_email,
      hr_name: job.hr_name,
      created_by: job.owner_user_id,
      owner_username: job.owner_username,
    };
  }

  async deleteJob(jobId: string, ownerUserId?: string): Promise<void> {
    if (ownerUserId) {
      const existing = await this.jobPostingModel
        .findOne({ job_id: jobId })
        .exec();
      if (!existing) throw new NotFoundException('Job posting not found');
      if (existing.owner_user_id !== ownerUserId)
        throw new ForbiddenException(
          'You can only delete your own job postings',
        );
    }
    const result = await this.jobPostingModel
      .findOneAndUpdate(
        { job_id: jobId },
        { is_active: false, updated_at: new Date() },
        { new: true },
      )
      .exec();
    if (!result) throw new NotFoundException('Job posting not found');
  }

  async applyForJob(
    jobId: string,
    candidateEmail: string,
    candidateName: string | undefined,
    file: Express.Multer.File,
  ): Promise<{
    application_id: string;
    job_id: string;
    status: string;
    quiz_required: boolean;
  }> {
    if (!candidateEmail?.trim())
      throw new BadRequestException('candidate_email is required');
    const job = await this.jobPostingModel.findOne({ job_id: jobId }).exec();
    if (!job || !job.is_active)
      throw new NotFoundException('Job posting not found or inactive');

    const uploadResult = await this.s3.uploadFile(file);
    const applicationId = uuidv4();
    const application = new this.applicationModel({
      application_id: applicationId,
      job_id: jobId,
      cv_filename: uploadResult.s3_key,
      candidate_email: candidateEmail,
      candidate_name: candidateName,
      status: 'SUBMITTED',
      submitted_at: new Date(),
    });
    await application.save();

    const notifyEmail = job.hr_email || this.config.get<string>('EMAIL_FROM');
    if (notifyEmail) {
      // Notify HRMS notification service about new application
      this.natsClient.emit('notification.ats.new_application', {
        toEmail: notifyEmail,
        jobTitle: job.title || 'Job Position',
        candidateName: candidateName || 'Candidate',
        candidateEmail,
        applicationId: application.application_id,
      });
    }

    this.processCvEvaluationAsync(
      file,
      job,
      application,
      candidateEmail,
      candidateName,
    ).catch((e) => console.error('CV evaluation error:', e));

    return {
      application_id: application.application_id,
      job_id: application.job_id,
      status: application.status,
      quiz_required: job.quiz_required,
    };
  }

  async applyForJobBase64(
    jobId: string,
    candidateEmail: string,
    candidateName: string | undefined,
    file: { filename: string; mimetype?: string; data_base64: string },
  ): Promise<{
    application_id: string;
    job_id: string;
    status: string;
    quiz_required: boolean;
  }> {
    const buf = Buffer.from(file.data_base64, 'base64');

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ats-apply-'));
    const tmpPath = path.join(tmpDir, file.filename);
    fs.writeFileSync(tmpPath, buf);

    try {
      const multerFile = {
        originalname: file.filename,
        mimetype: file.mimetype || 'application/octet-stream',
        size: buf.length,
        path: tmpPath,
      } as unknown as Express.Multer.File;

      return await this.applyForJob(
        jobId,
        candidateEmail,
        candidateName,
        multerFile,
      );
    } finally {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {
        console.error('Failed to remove temporary directory:', tmpDir);
      }
    }
  }

  private async processCvEvaluationAsync(
    file: Express.Multer.File,
    job: any,
    application: any,
    candidateEmail: string,
    candidateName: string | undefined,
  ): Promise<void> {
    const startTime = Date.now();
    let cvText = '';
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf') {
      const buf = fs.readFileSync(file.path);
      const data = await pdfParse(buf);
      cvText = data.text;
    } else if (ext === '.docx') {
      try {
        const mammoth = await import('mammoth');
        const buf = fs.readFileSync(file.path);
        const result = await mammoth.extractRawText({ buffer: buf });
        cvText = result.value;
      } catch {
        // For now, skip sending a specific failure email; ATS HRMS
        // notification flow focuses on CV result and new application.
        return;
      }
    }
    if (!cvText?.trim()) {
      // No text could be extracted; treat as manual review without
      // sending a separate email from ATS. HRMS can handle any
      // generic notifications if needed.
      return;
    }

    const result = await this.evaluation.evaluateCv(
      cvText,
      job.description || '',
      job.required_skills || [],
    );
    const processingTime = Date.now() - startTime;
    const jobDescriptionHash = this.generateHash(job.description || '');
    const cvEval = new this.cvEvaluationModel({
      filename: file.originalname,
      job_description_hash: jobDescriptionHash,
      job_description: job.description || '',
      decision: result.decision,
      score: result.score,
      evaluation_text: result.evaluation_text,
      cv_text_length: result.text_length,
      email: candidateEmail,
      processing_time_ms: processingTime,
      created_by: job.owner_user_id,
      created_at: new Date(),
    });
    await cvEval.save();
    const isAccepted =
      result.decision === EvaluationDecision.ACCEPT ||
      result.decision === EvaluationDecision.ACCEPTED;
    await this.applicationModel
      .findOneAndUpdate(
        { application_id: application.application_id },
        {
          cv_score: result.score,
          decision: String(result.decision),
          status: isAccepted ? 'ACCEPTED' : 'REJECTED',
        },
      )
      .exec();

    let quizLink: string | undefined;
    if (
      job.quiz_required &&
      (result.decision === EvaluationDecision.ACCEPT ||
        result.decision === EvaluationDecision.ACCEPTED)
    ) {
      const quiz = await this.evaluation.generateQuiz(job.description || '');
      const jobDescriptionHash = this.generateHash(job.description || '');
      const quizSession = new this.quizSessionModel({
        job_description: job.description || '',
        job_description_hash: jobDescriptionHash,
        questions: quiz.questions || [],
        total_questions: (quiz.questions || []).length,
        associated_cv_filename: file.originalname,
        candidate_email: candidateEmail,
        application_id: application.application_id,
        time_limit_seconds: 300,
        pass_threshold: job.quiz_pass_threshold ?? 7,
        status: 'GENERATED',
        created_at: new Date(),
        created_by: job.owner_user_id,
      });
      await quizSession.save();
      quizLink = `${this.frontendQuizUrl}/quiz/${quizSession._id.toString()}`;
    }

    if (candidateEmail) {
      // Notify HRMS notification service about CV evaluation result
      this.natsClient.emit('notification.ats.cv_result', {
        toEmail: candidateEmail,
        candidateName: candidateName || 'Candidate',
        jobTitle: job.title || 'Job Position',
        decision: String(result.decision),
        score: result.score,
        quizLink,
        evaluationText: result.evaluation_text,
      });
    }
  }

  private generateHash(text: string): string {
    return crypto.createHash('md5').update(text).digest('hex');
  }
}
