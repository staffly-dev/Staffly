/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { ApplicationsService } from './applications.service';
import { Application } from './schemas/application.schema';
import { JobPosting } from '../jobs/schemas/job-posting.schema';
import { QuizResult } from '../quiz/schemas/quiz-result.schema';
import { GetAllApplicationsDto } from './dto/get-all-applications.dto';
import { GetOneApplicationDto } from './dto/get-one-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import { DeleteApplicationDto } from './dto/delete-application.dto';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let applicationModel: any;
  let jobPostingModel: any;
  let quizResultModel: any;
  let natsClient: { emit: jest.Mock };

  beforeEach(async () => {
    applicationModel = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
    };
    jobPostingModel = {
      find: jest.fn(),
      findOne: jest.fn(),
    };
    quizResultModel = {
      findOne: jest.fn(),
    };
    natsClient = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:4002'),
          },
        },
        {
          provide: getModelToken(Application.name),
          useValue: applicationModel,
        },
        {
          provide: getModelToken(JobPosting.name),
          useValue: jobPostingModel,
        },
        {
          provide: getModelToken(QuizResult.name),
          useValue: quizResultModel,
        },
        {
          provide: 'NATS_SERVICE',
          useValue: natsClient,
        },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return all applications without user filter', async () => {
      const payload: GetAllApplicationsDto = {} as any;
      applicationModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([
            {
              application_id: 'app1',
              candidate_email: 'c@example.com',
              candidate_name: 'Candidate',
              cv_score: 80,
              cv_filename: 'file.pdf',
              decision: 'ACCEPTED',
              job_id: 'job1',
              quiz_score: 10,
              status: 'SUBMITTED',
            },
          ]),
        }),
      });

      const result = await service.getAll(payload);

      expect(result.total_applications).toBe(1);
      expect(result.applications[0].application_id).toBe('app1');
    });
  });

  describe('getOne', () => {
    it('should throw if app_id is missing', async () => {
      const payload = { app_id: '  ' } as GetOneApplicationDto;
      await expect(service.getOne(payload)).rejects.toThrow(
        'app_id is required',
      );
    });

    it('should resolve quizScore from QuizResult if missing on application', async () => {
      const payload = { app_id: 'app1' } as GetOneApplicationDto;
      applicationModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue({
          application_id: 'app1',
          job_id: 'job1',
        }),
      });
      jobPostingModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ owner_user_id: 'owner1' }),
      });

      applicationModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue({
          application_id: 'app1',
          job_id: 'job1',
          cv_filename: 'file.pdf',
          cv_score: 80,
          decision: 'ACCEPTED',
          status: 'SUBMITTED',
          quiz_score: undefined,
        }),
      });

      quizResultModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ score: 10 }),
      });

      const result = await service.getOne(payload);

      expect(result.quiz_score).toBe(10);
    });
  });

  describe('update', () => {
    it('should update application when user owns job', async () => {
      const payload: UpdateApplicationDto = {
        app_id: 'app1',
        user_id: 'user1',
        updates: { status: 'ACCEPTED' },
      } as any;

      applicationModel.findOne.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ application_id: 'app1', job_id: 'job1' }),
      });
      jobPostingModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ owner_user_id: 'user1' }),
      });
      applicationModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          application_id: 'app1',
          job_id: 'job1',
          cv_filename: 'file.pdf',
          status: 'ACCEPTED',
        }),
      });

      const result = await service.update(payload);

      expect(result.success).toBe(true);
    });
  });

  describe('scheduleInterview', () => {
    it('should emit notification event when candidate_email exists', async () => {
      const payload: ScheduleInterviewDto = {
        app_id: 'app1',
        user_id: 'user1',
        interview_date: '2024-01-01',
        interview_time: '10:00',
        interview_type: 'video',
        location: 'Zoom',
        notes: 'Be on time',
      } as any;

      applicationModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          application_id: 'app1',
          job_id: 'job1',
          candidate_email: 'c@example.com',
          candidate_name: 'Candidate',
        }),
      });
      jobPostingModel.findOne.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ owner_user_id: 'user1', title: 'Dev' }),
      });
      applicationModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          application_id: 'app1',
          interview_date: payload.interview_date,
          interview_time: payload.interview_time,
          interview_type: payload.interview_type,
          interview_location: payload.location,
          status: 'INTERVIEW_SCHEDULED',
        }),
      });

      const result = await service.scheduleInterview(payload);

      expect(result.success).toBe(true);
      expect(natsClient.emit).toHaveBeenCalledWith(
        'notification.ats.interview_scheduled',
        expect.objectContaining({
          toEmail: 'c@example.com',
          candidateName: 'Candidate',
          jobTitle: 'Dev',
        }),
      );
    });
  });

  describe('delete', () => {
    it('should mark application as deleted when user owns job', async () => {
      const payload: DeleteApplicationDto = {
        app_id: 'app1',
        user_id: 'user1',
      } as any;

      applicationModel.findOne.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ application_id: 'app1', job_id: 'job1' }),
      });
      jobPostingModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ owner_user_id: 'user1' }),
      });
      applicationModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ application_id: 'app1' }),
      });

      const result = await service.delete(payload);

      expect(result.success).toBe(true);
    });
  });
});
