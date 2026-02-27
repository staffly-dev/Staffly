import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { EvaluationService } from '../evaluation/evaluation.service';
import { S3Service } from '../s3/s3.service';
import { EvaluationDecision } from '../common/evaluation-decision';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import pdfParse from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class JobsService {
  private backendUrl: string;
  private frontendQuizUrl: string;

  constructor(
    private config: ConfigService,
    private db: DatabaseService,
    private evaluation: EvaluationService,
    private s3: S3Service,
  ) {
    this.backendUrl = this.config.get<string>('BACKEND_URL') || 'http://localhost:4002';
    this.frontendQuizUrl = this.config.get<string>('FRONTEND_URL_QUIZ') || this.config.get<string>('FRONTEND_ORIGIN') || 'http://localhost:3000';
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
      throw new BadRequestException('Job title, description, and required skills are required');
    }
    const skillsList = String(required_skills)
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);
    const job = await this.db.createJobPosting(
      title,
      description,
      skillsList,
      additional_details,
      hr_email,
      hr_name,
      evaluation_threshold,
      quiz_required,
      quiz_pass_threshold,
      owner_user_id,
      owner_username,
    );
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
    const job = await this.db.getJobPostingById(jobId);
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

  async getAllJobs(ownerUserId?: string, includeInactive = false): Promise<any> {
    const jobs = await this.db.getAllJobPostings(ownerUserId, includeInactive);
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

  async updateJob(jobId: string, updates: any, ownerUserId?: string): Promise<any> {
    if (ownerUserId) {
      const existing = await this.db.getJobPostingById(jobId);
      if (!existing) throw new NotFoundException('Job posting not found');
      if (existing.owner_user_id !== ownerUserId) throw new ForbiddenException('You can only update your own job postings');
    }
    const job = await this.db.updateJobPosting(jobId, updates);
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
      const existing = await this.db.getJobPostingById(jobId);
      if (!existing) throw new NotFoundException('Job posting not found');
      if (existing.owner_user_id !== ownerUserId) throw new ForbiddenException('You can only delete your own job postings');
    }
    const ok = await this.db.deleteJobPosting(jobId);
    if (!ok) throw new NotFoundException('Job posting not found');
  }

  async applyForJob(
    jobId: string,
    candidateEmail: string,
    candidateName: string | undefined,
    file: Express.Multer.File,
  ): Promise<{ application_id: string; job_id: string; status: string; quiz_required: boolean }> {
    if (!candidateEmail?.trim()) throw new BadRequestException('candidate_email is required');
    const job = await this.db.getJobPostingById(jobId);
    if (!job || !job.is_active) throw new NotFoundException('Job posting not found or inactive');

    const uploadResult = await this.s3.uploadFile(file);
    const applicationId = uuidv4();
    const application = await this.db.createApplication(
      applicationId,
      jobId,
      uploadResult.s3_key,
      candidateEmail,
      candidateName,
    );

    const emailService = this.evaluation.getEmailService();
    const notifyEmail = job.hr_email || this.config.get<string>('EMAIL_FROM');
    if (emailService && notifyEmail) {
      emailService
        .sendNewApplicationNotification(
          notifyEmail,
          job.title || 'Job Position',
          candidateName || 'Candidate',
          candidateEmail,
          application.application_id,
          this.backendUrl,
        )
        .catch((e) => console.error('New application email error:', e));
    }

    this.processCvEvaluationAsync(file, job, application, candidateEmail, candidateName).catch((e) =>
      console.error('CV evaluation error:', e),
    );

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
  ): Promise<{ application_id: string; job_id: string; status: string; quiz_required: boolean }> {
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

      return await this.applyForJob(jobId, candidateEmail, candidateName, multerFile);
    } finally {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch { }
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
      } catch (e: any) {
        const emailService = this.evaluation.getEmailService();
        if (emailService && candidateEmail) {
          await emailService.sendEmailAsync(
            candidateEmail,
            'CV Submission Received',
            `<p>Dear ${candidateName || 'Candidate'},</p><p>Thank you for submitting your CV. Please resubmit as PDF for automated evaluation.</p><p>Best regards,<br/>Staffly Team</p>`,
            'CV_SUBMISSION',
          );
        }
        return;
      }
    }
    if (!cvText?.trim()) {
      const emailService = this.evaluation.getEmailService();
      if (emailService && candidateEmail) {
        await emailService.sendEmailAsync(
          candidateEmail,
          'CV Received - Manual Review',
          `<p>Dear ${candidateName || 'Candidate'},</p><p>We have received your application. Your file could not be evaluated automatically and will be reviewed manually.</p><p>Best regards,<br/>Staffly Team</p>`,
          'CV_RECEIVED',
        );
      }
      return;
    }

    const result = await this.evaluation.evaluateCv(
      cvText,
      job.description || '',
      job.required_skills || [],
    );
    const processingTime = Date.now() - startTime;
    await this.db.saveCvEvaluation(
      file.originalname,
      job.description || '',
      result.decision,
      result.score,
      result.evaluation_text,
      result.text_length,
      candidateEmail,
      processingTime,
      job.owner_user_id,
    );
    const isAccepted =
      result.decision === EvaluationDecision.ACCEPT || result.decision === EvaluationDecision.ACCEPTED;
    await this.db.updateApplication(application.application_id, {
      cv_score: result.score,
      decision: String(result.decision),
      status: isAccepted ? 'ACCEPTED' : 'REJECTED',
    });

    let quizLink: string | undefined;
    if (
      job.quiz_required &&
      (result.decision === EvaluationDecision.ACCEPT || result.decision === EvaluationDecision.ACCEPTED)
    ) {
      const quiz = await this.evaluation.generateQuiz(job.description || '');
      const quizSession = await this.db.saveQuizSession(
        job.description || '',
        quiz.questions || [],
        file.originalname,
        candidateEmail,
        300,
        job.quiz_pass_threshold ?? 7,
        job.owner_user_id,
        application.application_id,
      );
      quizLink = `${this.frontendQuizUrl}/quiz/${quizSession._id}`;
    }

    const emailService = this.evaluation.getEmailService();
    if (emailService && candidateEmail) {
      await emailService.sendCvResultEmail(
        candidateEmail,
        candidateName || 'Candidate',
        job.title || 'Job Position',
        String(result.decision),
        result.score,
        quizLink,
        result.evaluation_text,
      );
    }
  }
}
