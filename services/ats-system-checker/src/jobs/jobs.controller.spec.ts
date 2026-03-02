/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { GetAllJobsDto } from './dto/get-all-jobs.dto';
import { CreateJobDto } from './dto/create-job.dto';
import { JobIdDto } from './dto/job-id.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { ApplyJobDto } from './dto/apply-job.dto';

// Mock uuid to avoid Jest trying to execute its ESM exports indirectly via JobsService/S3Service
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid'),
}));

describe('JobsController', () => {
  let controller: JobsController;
  let jobsService: Record<string, jest.Mock>;

  beforeEach(async () => {
    jobsService = {
      getAllJobs: jest.fn(),
      createJob: jest.fn(),
      getJob: jest.fn(),
      updateJob: jest.fn(),
      deleteJob: jest.fn(),
      applyForJobBase64: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobsController],
      providers: [
        {
          provide: JobsService,
          useValue: jobsService,
        },
      ],
    }).compile();

    controller = module.get<JobsController>(JobsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should delegate to jobsService.getAllJobs', async () => {
      const payload: GetAllJobsDto = { user_id: '507f1f77bcf86cd799439011' };
      const expected = { total_jobs: 0, jobs: [] } as any;
      jobsService.getAllJobs.mockResolvedValue(expected);

      const result = await controller.getAll(payload);

      expect(jobsService.getAllJobs).toHaveBeenCalledWith(
        payload.user_id,
        false,
      );
      expect(result).toBe(expected);
    });
  });

  describe('create', () => {
    it('should delegate to jobsService.createJob when user_id is valid', async () => {
      const body: CreateJobDto = {
        user_id: '507f1f77bcf86cd799439011',
        title: 'Job',
        description: 'Desc',
        required_skills: ['skill1,skill2'],
      };
      const expected = { job_id: 'job1' } as any;
      jobsService.createJob.mockResolvedValue(expected);

      const result = await controller.create(body);

      expect(jobsService.createJob).toHaveBeenCalledWith(
        expect.objectContaining({
          owner_user_id: body.user_id,
        }),
      );
      expect(result).toBe(expected);
    });
  });

  describe('getOne', () => {
    it('should delegate to jobsService.getJob', async () => {
      const payload: JobIdDto = {
        job_id: 'job1',
        user_id: '507f1f77bcf86cd799439011',
      };
      const expected = { job_id: 'job1' } as any;
      jobsService.getJob.mockResolvedValue(expected);

      const result = await controller.getOne(payload);

      expect(jobsService.getJob).toHaveBeenCalledWith(
        payload.job_id,
        payload.user_id,
      );
      expect(result).toBe(expected);
    });
  });

  describe('update', () => {
    it('should delegate to jobsService.updateJob', async () => {
      const payload: UpdateJobDto = {
        job_id: 'job1',
        user_id: '507f1f77bcf86cd799439011',
        updates: { title: 'New Title' },
      };
      const expected = { job_id: 'job1', title: 'New Title' } as any;
      jobsService.updateJob.mockResolvedValue(expected);

      const result = await controller.update(payload);

      expect(jobsService.updateJob).toHaveBeenCalledWith(
        payload.job_id,
        payload.updates,
        payload.user_id,
      );
      expect(result).toBe(expected);
    });
  });

  describe('delete', () => {
    it('should delegate to jobsService.deleteJob', async () => {
      const payload: JobIdDto = {
        job_id: 'job1',
        user_id: '507f1f77bcf86cd799439011',
      };
      jobsService.deleteJob.mockResolvedValue(undefined);

      const result = await controller.delete(payload);

      expect(jobsService.deleteJob).toHaveBeenCalledWith(
        payload.job_id,
        payload.user_id,
      );
      expect(result).toEqual({
        success: true,
        message: 'Job posting deleted successfully',
      });
    });
  });

  describe('apply', () => {
    it('should delegate to jobsService.applyForJobBase64', async () => {
      const payload: ApplyJobDto = {
        job_id: 'job1',
        candidate_email: 'candidate@example.com',
        candidate_name: 'John Doe',
        file: {
          filename: 'cv.pdf',
          data_base64: 'ZGF0YQ==',
        },
      };
      const expected = {
        application_id: 'app1',
        job_id: 'job1',
        status: 'SUBMITTED',
        quiz_required: true,
      } as any;
      jobsService.applyForJobBase64.mockResolvedValue(expected);

      const result = await controller.apply(payload);

      expect(jobsService.applyForJobBase64).toHaveBeenCalledWith(
        payload.job_id,
        payload.candidate_email,
        payload.candidate_name,
        payload.file,
      );
      expect(result).toBe(expected);
    });
  });
});
