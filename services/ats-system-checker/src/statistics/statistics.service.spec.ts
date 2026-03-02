import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { StatisticsService } from './statistics.service';
import { JobPosting } from '../jobs/schemas/job-posting.schema';
import { Application } from '../applications/schemas/application.schema';
import { CVEvaluation } from '../evaluation/schemas/cv-evaluation.schema';
import { QuizSession } from '../quiz/schemas/quiz-session.schema';
import { QuizResult } from '../quiz/schemas/quiz-result.schema';

describe('StatisticsService', () => {
  let service: StatisticsService;

  let cvEvaluationModel: jest.Mock & {
    countDocuments: jest.Mock;
    aggregate: jest.Mock;
  };

  let quizResultModel: jest.Mock & {
    countDocuments: jest.Mock;
  };

  let quizSessionModel: jest.Mock & {
    find: jest.Mock;
  };

  let jobPostingModel: jest.Mock & {
    countDocuments: jest.Mock;
    find: jest.Mock;
  };

  let applicationModel: jest.Mock & {
    countDocuments: jest.Mock;
    find: jest.Mock;
  };

  beforeEach(async () => {
    cvEvaluationModel = Object.assign(jest.fn(), {
      countDocuments: jest.fn(),
      aggregate: jest.fn(),
    });

    quizResultModel = Object.assign(jest.fn(), {
      countDocuments: jest.fn(),
    });

    quizSessionModel = Object.assign(jest.fn(), {
      find: jest.fn(),
    });

    jobPostingModel = Object.assign(jest.fn(), {
      countDocuments: jest.fn(),
      find: jest.fn(),
    });

    applicationModel = Object.assign(jest.fn(), {
      countDocuments: jest.fn(),
      find: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        { provide: getModelToken(JobPosting.name), useValue: jobPostingModel },
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
        { provide: getModelToken(QuizResult.name), useValue: quizResultModel },
      ],
    }).compile();

    service = module.get<StatisticsService>(StatisticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getEvaluationStatistics', () => {
    it('should return zeros when no evaluations', async () => {
      cvEvaluationModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      const result = await service.getEvaluationStatistics();

      expect(result).toEqual({
        total_evaluations: 0,
        acceptance_rate: 0,
        average_score: 0,
      });
    });

    it('should compute acceptance rate and average score', async () => {
      cvEvaluationModel.countDocuments.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(10),
      });

      cvEvaluationModel.countDocuments.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(7),
      });

      cvEvaluationModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ _id: null, avgScore: 80 }]),
      });

      const result = await service.getEvaluationStatistics();

      expect(result.total_evaluations).toBe(10);
      expect(result.acceptance_rate).toBe((7 / 10) * 100);
      expect(result.average_score).toBe(80);
    });
  });

  describe('getQuizStatistics', () => {
    it('should return zeros when no quiz results', async () => {
      quizResultModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      const result = await service.getQuizStatistics();

      expect(result).toEqual({ total_quizzes: 0, pass_rate: 0 });
    });

    it('should compute pass rate', async () => {
      quizResultModel.countDocuments
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(5) })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(3) });

      const result = await service.getQuizStatistics();

      expect(result.total_quizzes).toBe(5);
      expect(result.pass_rate).toBe((3 / 5) * 100);
    });
  });

  describe('getJobStatistics', () => {
    it('should return aggregated job and application stats', async () => {
      jobPostingModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(4),
      });
      applicationModel.countDocuments
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(20) })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(8) })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(5) });

      const result = await service.getJobStatistics();

      expect(result.total_jobs).toBe(4);
      expect(result.total_applications).toBe(20);
      expect(result.total_accepted).toBe(8);
      expect(result.total_rejected).toBe(5);
    });
  });

  describe('getUserEvaluationStatistics', () => {
    it('should return zeros when user has no evaluations', async () => {
      cvEvaluationModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      const result = await service.getUserEvaluationStatistics('user1');

      expect(result.total_evaluations).toBe(0);
    });

    it('should compute user acceptance rate and average score', async () => {
      cvEvaluationModel.countDocuments
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(5) })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(3) });

      cvEvaluationModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ _id: null, avgScore: 75 }]),
      });

      const result = await service.getUserEvaluationStatistics('user1');

      expect(result.total_evaluations).toBe(5);
      expect(result.acceptance_rate).toBe((3 / 5) * 100);
      expect(result.average_score).toBe(75);
    });
  });

  describe('getUserQuizStatistics', () => {
    it('should return zeros when user has no quiz sessions', async () => {
      quizSessionModel.find.mockReturnValue({
        select: jest
          .fn()
          .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
      });

      const result = await service.getUserQuizStatistics('user1');

      expect(result).toEqual({ total_quizzes: 0, pass_rate: 0 });
    });
  });
});
