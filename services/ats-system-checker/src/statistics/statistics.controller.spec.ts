/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import {
  StatisticsController,
  UserStatisticsController,
} from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { UserIdDto } from './dto/user-id.dto';
import { UserStatsDto } from './dto/user-stats.dto';

describe('StatisticsController', () => {
  let controller: StatisticsController;
  let statisticsService: Record<string, jest.Mock>;

  beforeEach(async () => {
    statisticsService = {
      getEvaluationStatistics: jest.fn(),
      getQuizStatistics: jest.fn(),
      getUserQuizStatistics: jest.fn(),
      getUserEvaluationStatistics: jest.fn(),
      getAllJobPostings: jest.fn(),
      getAllApplications: jest.fn(),
      getJobStatistics: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatisticsController],
      providers: [
        {
          provide: StatisticsService,
          useValue: statisticsService,
        },
      ],
    }).compile();

    controller = module.get<StatisticsController>(StatisticsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStats', () => {
    it('should combine evaluation and quiz stats', async () => {
      statisticsService.getEvaluationStatistics.mockResolvedValue({
        total_evaluations: 10,
        acceptance_rate: 50,
        average_score: 80,
      });
      statisticsService.getQuizStatistics.mockResolvedValue({
        total_quizzes: 5,
        pass_rate: 60,
      });

      const result = await controller.getStats();

      expect(statisticsService.getEvaluationStatistics).toHaveBeenCalled();
      expect(statisticsService.getQuizStatistics).toHaveBeenCalled();
      expect(result.total_evaluations).toBe(10);
      expect(result.quiz_pass_rate).toBe(60);
    });
  });

  describe('getQuizStats', () => {
    it('should call user-specific stats when user_id is valid', async () => {
      const payload: UserIdDto = { user_id: '507f1f77bcf86cd799439011' };
      statisticsService.getUserQuizStatistics.mockResolvedValue({
        total_quizzes: 3,
        pass_rate: 50,
      });
      statisticsService.getUserEvaluationStatistics.mockResolvedValue({
        total_evaluations: 5,
        acceptance_rate: 40,
        average_score: 70,
      });

      const result = await controller.getQuizStats(payload);

      expect(statisticsService.getUserQuizStatistics).toHaveBeenCalledWith(
        payload.user_id,
      );
      expect(
        statisticsService.getUserEvaluationStatistics,
      ).toHaveBeenCalledWith(payload.user_id);
      expect((result as any).user_id).toBe(payload.user_id);
    });
  });

  describe('getJobStats', () => {
    it('should call user-specific job stats when user_id is valid', async () => {
      const payload: UserIdDto = { user_id: '507f1f77bcf86cd799439011' };
      statisticsService.getAllJobPostings.mockResolvedValue([{}, {}]);
      statisticsService.getAllApplications.mockResolvedValue([
        { status: 'ACCEPTED' },
        { status: 'REJECTED' },
      ]);

      const result = await controller.getJobStats(payload);

      expect(statisticsService.getAllJobPostings).toHaveBeenCalledWith(
        payload.user_id,
        true,
      );
      expect(statisticsService.getAllApplications).toHaveBeenCalledWith(
        payload.user_id,
      );
      expect((result as any).user_id).toBe(payload.user_id);
    });
  });

  describe('getAppStats', () => {
    it('should call user-specific applications stats when user_id is valid', async () => {
      const payload: UserIdDto = { user_id: '507f1f77bcf86cd799439011' };
      statisticsService.getAllApplications.mockResolvedValue([
        { status: 'ACCEPTED' },
        { status: 'REJECTED' },
      ]);

      const result = await controller.getAppStats(payload);

      expect(statisticsService.getAllApplications).toHaveBeenCalledWith(
        payload.user_id,
      );
      expect(result.user_id).toBe(payload.user_id);
    });
  });
});

describe('UserStatisticsController', () => {
  let controller: UserStatisticsController;
  let statisticsService: Record<string, jest.Mock>;

  beforeEach(async () => {
    statisticsService = {
      getAllApplications: jest.fn(),
      getUserEvaluationStatistics: jest.fn(),
      getUserQuizStatistics: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserStatisticsController],
      providers: [
        {
          provide: StatisticsService,
          useValue: statisticsService,
        },
      ],
    }).compile();

    controller = module.get<UserStatisticsController>(UserStatisticsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserStats', () => {
    it('should delegate to statisticsService and return combined stats', async () => {
      const payload: UserStatsDto = {
        user_id: '507f1f77bcf86cd799439011',
      };

      statisticsService.getAllApplications.mockResolvedValue([
        { status: 'ACCEPTED' },
        { status: 'REJECTED' },
      ]);
      statisticsService.getUserEvaluationStatistics.mockResolvedValue({
        total_evaluations: 5,
        acceptance_rate: 40,
        average_score: 70,
      });
      statisticsService.getUserQuizStatistics.mockResolvedValue({
        total_quizzes: 3,
        pass_rate: 50,
      });

      const result = await controller.getUserStats(payload);

      expect(statisticsService.getAllApplications).toHaveBeenCalledWith(
        payload.user_id,
      );
      expect(
        statisticsService.getUserEvaluationStatistics,
      ).toHaveBeenCalledWith(payload.user_id);
      expect(statisticsService.getUserQuizStatistics).toHaveBeenCalledWith(
        payload.user_id,
      );
      expect(result.user_id).toBe(payload.user_id);
    });
  });
});
