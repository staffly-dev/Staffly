import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { Application, ApplicationDocument } from './schemas/application.schema';
import {
  JobPosting,
  JobPostingDocument,
} from '../jobs/schemas/job-posting.schema';
import {
  QuizResult,
  QuizResultDocument,
} from '../quiz/schemas/quiz-result.schema';
import { GetAllApplicationsDto } from './dto/get-all-applications.dto';
import { GetOneApplicationDto } from './dto/get-one-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import { DeleteApplicationDto } from './dto/delete-application.dto';

function extractS3Key(cvFilename: string): string {
  if (!cvFilename) return '';
  if (cvFilename.startsWith('http')) {
    if (cvFilename.includes('/s3/file/'))
      return cvFilename.split('/s3/file/')[1];
    if (cvFilename.includes('cv_uploads/'))
      return cvFilename.match(/cv_uploads\/[^/]+$/)?.[0] || cvFilename;
  }
  if (cvFilename.includes('cv_uploads/')) return cvFilename;
  return `cv_uploads/${cvFilename}`;
}

@Injectable()
export class ApplicationsService {
  private readonly backendUrl: string;

  private readonly applicationNotDeletedFilter = { status: { $ne: 'DELETED' } };

  constructor(
    private readonly config: ConfigService,
    @InjectModel(Application.name)
    private readonly applicationModel: Model<ApplicationDocument>,
    @InjectModel(JobPosting.name)
    private readonly jobPostingModel: Model<JobPostingDocument>,
    @InjectModel(QuizResult.name)
    private readonly quizResultModel: Model<QuizResultDocument>,
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {
    this.backendUrl =
      this.config.get<string>('BACKEND_URL') || 'http://localhost:4002';
  }

  private fixCvUrl(cvFilename: string): string {
    if (!cvFilename) return '';
    if (cvFilename.startsWith('http')) return cvFilename;
    return `${this.backendUrl}/ats-checker/s3/file/${extractS3Key(cvFilename)}`;
  }

  async getAll(payload: GetAllApplicationsDto) {
    const effective = payload?.user_id;
    if (
      effective &&
      (effective.length !== 24 || !/^[0-9a-f]{24}$/i.test(effective))
    ) {
      throw new BadRequestException('Invalid user_id format');
    }

    let applications: ApplicationDocument[];
    if (effective) {
      const userJobs = await this.jobPostingModel
        .find({ owner_user_id: effective })
        .select('job_id')
        .exec();
      const jobIds = userJobs.map((j) => j.job_id);
      applications = await this.applicationModel
        .find({
          job_id: { $in: jobIds },
          ...this.applicationNotDeletedFilter,
        })
        .sort({ submitted_at: -1 })
        .exec();
    } else {
      applications = await this.applicationModel
        .find(this.applicationNotDeletedFilter)
        .sort({ submitted_at: -1 })
        .exec();
    }

    return {
      total_applications: applications.length,
      applications: applications.map((app) => ({
        application_id: app.application_id,
        candidate_email: app.candidate_email,
        candidate_name: app.candidate_name,
        cv_score: app.cv_score,
        cv_filename: this.fixCvUrl(app.cv_filename),
        s3_key: extractS3Key(app.cv_filename),
        decision: app.decision,
        job_id: app.job_id,
        quiz_score: app.quiz_score,
        status: app.status,
      })),
    };
  }

  async getOne(payload: GetOneApplicationDto) {
    const appId = payload?.app_id;
    if (!appId?.trim()) throw new BadRequestException('app_id is required');
    const userId = payload?.user_id;

    if (userId) {
      const app = await this.applicationModel
        .findOne({
          application_id: appId,
          ...this.applicationNotDeletedFilter,
        })
        .exec();
      if (!app) throw new NotFoundException('Application not found');
      const job = await this.jobPostingModel
        .findOne({ job_id: app.job_id })
        .exec();
      if (!job || job.owner_user_id !== userId)
        throw new ForbiddenException(
          'You can only view applications for your own job postings',
        );
    }

    const application = await this.applicationModel
      .findOne({ application_id: appId, ...this.applicationNotDeletedFilter })
      .exec();
    if (!application) throw new NotFoundException('Application not found');

    let quizScore: number | undefined = application.quiz_score;
    if (quizScore == null) {
      const quizResult = await this.quizResultModel
        .findOne({ application_id: application.application_id })
        .exec();
      quizScore = quizResult?.score ?? undefined;
    }

    return {
      application_id: application.application_id,
      candidate_email: application.candidate_email || '',
      candidate_name: application.candidate_name || '',
      cv_score: application.cv_score || 0,
      cv_filename: this.fixCvUrl(application.cv_filename),
      s3_key: extractS3Key(application.cv_filename),
      decision: application.decision || 'PENDING',
      job_id: application.job_id,
      quiz_score: quizScore,
      status: application.status,
    };
  }

  async update(payload: UpdateApplicationDto) {
    const appId = payload?.app_id;
    const userId = payload?.user_id;
    if (!appId?.trim()) throw new BadRequestException('app_id is required');
    if (!userId?.trim()) throw new BadRequestException('user_id is required');

    const app = await this.applicationModel
      .findOne({ application_id: appId, ...this.applicationNotDeletedFilter })
      .exec();
    if (!app) throw new NotFoundException('Application not found');
    const job = await this.jobPostingModel
      .findOne({ job_id: app.job_id })
      .exec();
    if (!job || job.owner_user_id !== userId)
      throw new ForbiddenException(
        'You can only update applications for your own job postings',
      );

    const updated = await this.applicationModel
      .findOneAndUpdate({ application_id: appId }, payload.updates, {
        new: true,
      })
      .exec();
    if (!updated) throw new NotFoundException('Application not found');

    return {
      success: true,
      message: 'Application updated successfully',
      data: {
        application_id: updated.application_id,
        candidate_email: updated.candidate_email || '',
        candidate_name: updated.candidate_name || '',
        cv_score: updated.cv_score || 0,
        cv_filename: this.fixCvUrl(updated.cv_filename),
        s3_key: extractS3Key(updated.cv_filename),
        decision: updated.decision || 'PENDING',
        job_id: updated.job_id,
        quiz_score: updated.quiz_score,
        status: updated.status,
      },
    };
  }

  async scheduleInterview(payload: ScheduleInterviewDto) {
    const appId = payload?.app_id;
    const userId = payload?.user_id;
    const { interview_date, interview_time, interview_type, location, notes } =
      payload || ({} as any);
    if (!appId?.trim()) throw new BadRequestException('app_id is required');
    if (!userId?.trim()) throw new BadRequestException('user_id is required');
    if (!interview_date || !interview_time) {
      throw new BadRequestException(
        'interview_date and interview_time are required',
      );
    }

    const application = await this.applicationModel
      .findOne({ application_id: appId, ...this.applicationNotDeletedFilter })
      .exec();
    if (!application) throw new NotFoundException('Application not found');
    const job = await this.jobPostingModel
      .findOne({ job_id: application.job_id })
      .exec();
    if (!job || job.owner_user_id !== userId)
      throw new ForbiddenException(
        'You can only schedule interviews for your own job postings',
      );

    const updated = await this.applicationModel
      .findOneAndUpdate(
        { application_id: appId },
        {
          interview_date,
          interview_time,
          interview_type: interview_type || 'video',
          interview_location: location,
          interview_notes: notes,
          interview_scheduled_at: new Date(),
          status: 'INTERVIEW_SCHEDULED',
        },
        { new: true },
      )
      .exec();
    if (!updated) throw new NotFoundException('Application not found');

    if (application.candidate_email) {
      const jobTitle = job?.title || 'Job Position';
      this.natsClient.emit('notification.ats.interview_scheduled', {
        toEmail: application.candidate_email,
        candidateName: application.candidate_name || 'Candidate',
        jobTitle,
        interviewDate: interview_date,
        interviewTime: interview_time,
        interviewType: interview_type || 'video',
        location,
        notes,
      });
    }

    return {
      success: true,
      message: 'Interview scheduled successfully',
      data: {
        application_id: updated.application_id,
        interview_date: updated.interview_date,
        interview_time: updated.interview_time,
        interview_type: updated.interview_type,
        interview_location: updated.interview_location,
        status: updated.status,
      },
    };
  }

  async delete(payload: DeleteApplicationDto) {
    const appId = payload?.app_id;
    const userId = payload?.user_id;
    if (!appId?.trim()) throw new BadRequestException('app_id is required');
    if (!userId?.trim()) throw new BadRequestException('user_id is required');

    const app = await this.applicationModel
      .findOne({ application_id: appId, ...this.applicationNotDeletedFilter })
      .exec();
    if (!app) throw new NotFoundException('Application not found');
    const job = await this.jobPostingModel
      .findOne({ job_id: app.job_id })
      .exec();
    if (!job || job.owner_user_id !== userId)
      throw new ForbiddenException(
        'You can only delete applications for your own job postings',
      );

    await this.applicationModel
      .findOneAndUpdate(
        { application_id: appId },
        { status: 'DELETED' },
        { new: true },
      )
      .exec();

    return { success: true, message: 'Application deleted successfully' };
  }
}
