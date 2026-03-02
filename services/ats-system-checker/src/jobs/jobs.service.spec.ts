/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { JobsService } from './jobs.service';
import { JobPosting } from './schemas/job-posting.schema';
import { Application } from '../applications/schemas/application.schema';
import { CVEvaluation } from '../evaluation/schemas/cv-evaluation.schema';
import { QuizSession } from '../quiz/schemas/quiz-session.schema';
import { EvaluationService } from '../evaluation/evaluation.service';
import { S3Service } from '../common/s3/s3.service';

// Avoid loading the real S3Service (which pulls in ESM-only uuid) in tests
jest.mock('../common/s3/s3.service', () => ({
  S3Service: jest.fn().mockImplementation(() => ({
    uploadFile: jest.fn(),
  })),
}));

// Mock uuid to avoid Jest trying to execute its ESM exports
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid'),
}));

describe('JobsService', () => {
  let service: JobsService;

  let jobPostingModel: jest.Mock & {
    find: jest.Mock;
    findOne: jest.Mock;
    findOneAndUpdate: jest.Mock;
  };

  let applicationModel: jest.Mock & {
    findOneAndUpdate: jest.Mock;
  };

  let cvEvaluationModel: jest.Mock;

  let quizSessionModel: jest.Mock;

  const natsClient: Partial<ClientProxy> = {
    emit: jest.fn(),
  };

  const s3Service: Partial<S3Service> = {
    uploadFile: jest.fn(),
  };

  const evaluationService: Partial<EvaluationService> = {
    evaluateCv: jest.fn(),
    generateQuiz: jest.fn(),
  };

  const configService: Partial<ConfigService> = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'BACKEND_URL') return 'http://localhost:4002';
      if (key === 'FRONTEND_URL_QUIZ') return 'http://localhost:3000';
      if (key === 'FRONTEND_ORIGIN') return 'http://localhost:3000';
      if (key === 'EMAIL_FROM') return 'no-reply@example.com';
      return undefined;
    }),
  };

  beforeEach(async () => {
    jobPostingModel = Object.assign(jest.fn(), {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
    });

    applicationModel = Object.assign(jest.fn(), {
      findOneAndUpdate: jest.fn(),
    });

    cvEvaluationModel = Object.assign(jest.fn(), {
      prototype: {},
    });

    quizSessionModel = Object.assign(jest.fn(), {
      prototype: {},
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        { provide: ConfigService, useValue: configService },
        { provide: EvaluationService, useValue: evaluationService },
        { provide: S3Service, useValue: s3Service },
        { provide: 'NATS_SERVICE', useValue: natsClient },
        {
          provide: getModelToken(JobPosting.name),
          useValue: jobPostingModel,
        },
        {
          provide: getModelToken(Application.name),
          useValue: applicationModel,
        },
        {
          provide: getModelToken(CVEvaluation.name),
          useValue: cvEvaluationModel,
        },
        {
          provide: getModelToken(QuizSession.name),
          useValue: quizSessionModel,
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createJob', () => {
    it('should create a job with parsed skills and return summary', async () => {
      const body = {
        title: 'Software Engineer',
        description: 'Job description',
        required_skills: 'Node.js, TypeScript',
        hr_email: 'hr@example.com',
        hr_name: 'HR',
        owner_user_id: '507f1f77bcf86cd799439011',
        owner_username: 'owner',
      };

      const saveMock = jest.fn().mockResolvedValue(undefined);
      const jobDoc = {
        ...body,
        required_skills: ['Node.js', 'TypeScript'],
        job_id: 'abcd1234',
        created_at: new Date(),
        is_active: true,
      } as any;

      jobPostingModel.mockImplementation(() => ({ ...jobDoc, save: saveMock }));

      const result = await service.createJob(body);

      expect(jobPostingModel).toHaveBeenCalled();
      expect(saveMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual(
        expect.objectContaining({
          job_id: jobDoc.job_id,
          title: body.title,
          required_skills: ['Node.js', 'TypeScript'],
        }),
      );
    });
  });

  describe('getJob', () => {
    it('should throw NotFoundException when job does not exist', async () => {
      jobPostingModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getJob('job1')).rejects.toThrow(
        'Job posting not found',
      );
    });
  });

  describe('getAllJobs', () => {
    it('should return jobs list with total count', async () => {
      const jobs = [
        {
          job_id: 'job1',
          title: 'Job 1',
          description: 'Desc',
          required_skills: ['a'],
          created_at: new Date(),
          is_active: true,
          hr_email: 'hr@example.com',
          hr_name: 'HR',
          owner_user_id: 'u1',
          owner_username: 'owner',
        },
      ];

      jobPostingModel.find.mockReturnValue({
        sort: jest
          .fn()
          .mockReturnValue({ exec: jest.fn().mockResolvedValue(jobs) }),
      });

      const result = await service.getAllJobs();

      expect(jobPostingModel.find).toHaveBeenCalled();
      expect(result.total_jobs).toBe(1);
      expect(result.jobs[0].job_id).toBe('job1');
    });
  });

  describe('updateJob', () => {
    it('should update and return job summary', async () => {
      const existingJob = {
        job_id: 'job1',
        owner_user_id: 'owner1',
      } as any;

      jobPostingModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingJob),
      });

      const updatedJob = {
        ...existingJob,
        title: 'Updated',
        description: 'Desc',
        required_skills: ['a'],
        created_at: new Date(),
        is_active: true,
        hr_email: 'hr@example.com',
        hr_name: 'HR',
        owner_username: 'owner',
      };

      jobPostingModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedJob),
      });

      const result = await service.updateJob(
        'job1',
        { title: 'Updated' },
        'owner1',
      );

      expect(jobPostingModel.findOneAndUpdate).toHaveBeenCalled();
      expect(result.job_id).toBe('job1');
      expect(result.title).toBe('Updated');
    });
  });

  describe('deleteJob', () => {
    it('should mark job as inactive', async () => {
      const existingJob = {
        job_id: 'job1',
        owner_user_id: 'owner1',
      } as any;

      jobPostingModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingJob),
      });

      jobPostingModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...existingJob, is_active: false }),
      });

      await service.deleteJob('job1', 'owner1');

      expect(jobPostingModel.findOneAndUpdate).toHaveBeenCalledWith(
        { job_id: 'job1' },
        { is_active: false, updated_at: expect.any(Date) },
        { new: true },
      );
    });
  });

  describe('applyForJob', () => {
    it('should validate and create application, returning summary', async () => {
      const job = {
        job_id: 'job1',
        title: 'Job 1',
        is_active: true,
        quiz_required: true,
        quiz_pass_threshold: 7,
        required_skills: ['a'],
        description: 'Desc',
        owner_user_id: 'owner1',
        hr_email: 'hr@example.com',
      } as any;

      jobPostingModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(job),
      });

      (s3Service.uploadFile as jest.Mock).mockResolvedValue({
        s3_key: 'cv-key.pdf',
      });

      const saveMock = jest.fn().mockResolvedValue(undefined);
      const appDoc = {
        application_id: 'app1',
        job_id: 'job1',
        status: 'SUBMITTED',
      } as any;
      applicationModel.mockImplementation(() => ({
        ...appDoc,
        save: saveMock,
      }));

      // Avoid executing heavy CV evaluation path
      jest
        .spyOn<any, any>(service as any, 'processCvEvaluationAsync')
        .mockResolvedValue(undefined);

      const result = await service.applyForJob(
        'job1',
        'candidate@example.com',
        'John Doe',
        {
          originalname: 'cv.pdf',
          mimetype: 'application/pdf',
          size: 123,
          path: '/tmp/cv.pdf',
        } as any,
      );

      expect(saveMock).toHaveBeenCalledTimes(1);
      expect(result.job_id).toBe('job1');
      expect(result.status).toBe('SUBMITTED');
      expect(natsClient.emit as jest.Mock).toHaveBeenCalledWith(
        'notification.ats.new_application',
        expect.objectContaining({
          toEmail: 'hr@example.com',
          jobTitle: 'Job 1',
        }),
      );
    });
  });
});
