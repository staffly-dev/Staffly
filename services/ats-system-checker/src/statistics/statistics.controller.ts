import {
  BadRequestException,
  Controller,
  ForbiddenException,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserIdDto } from './dto/user-id.dto';
import { UserStatsDto } from './dto/user-stats.dto';
import { StatisticsService } from './statistics.service';

@Controller()
export class StatisticsController {
  constructor(private readonly statistics: StatisticsService) {}

  @MessagePattern('ats.statistics.get')
  async getStats() {
    const evalStats = await this.statistics.getEvaluationStatistics();
    const quizStats = await this.statistics.getQuizStatistics();
    return {
      total_applications: evalStats.total_evaluations || 0,
      total_evaluations: evalStats.total_evaluations || 0,
      acceptance_rate: evalStats.acceptance_rate || 0,
      average_score: evalStats.average_score || 0,
      quiz_pass_rate: quizStats.pass_rate,
      daily_stats: {},
    };
  }

  @MessagePattern('ats.statistics.quiz')
  async getQuizStats(@Payload() payload: UserIdDto) {
    const userId = payload?.user_id;
    if (userId && userId.length === 24 && /^[0-9a-f]{24}$/i.test(userId)) {
      const userStats = await this.statistics.getUserQuizStatistics(userId);
      const evalStats =
        await this.statistics.getUserEvaluationStatistics(userId);
      return {
        total_quizzes: userStats.total_quizzes,
        quiz_pass_rate: userStats.pass_rate,
        total_evaluations: evalStats.total_evaluations,
        acceptance_rate: evalStats.acceptance_rate,
        average_score: evalStats.average_score,
        user_id: userId,
      };
    }
    return this.statistics.getQuizStatistics();
  }

  @MessagePattern('ats.statistics.jobs')
  async getJobStats(@Payload() payload: UserIdDto) {
    const userId = payload?.user_id;
    if (userId && userId.length === 24 && /^[0-9a-f]{24}$/i.test(userId)) {
      const userJobs = await this.statistics.getAllJobPostings(userId, true);
      const applications = await this.statistics.getAllApplications(userId);
      return {
        total_jobs: userJobs.length,
        total_applications: applications.length,
        total_accepted: applications.filter((a) => a.status === 'ACCEPTED')
          .length,
        total_rejected: applications.filter((a) => a.status === 'REJECTED')
          .length,
        user_id: userId,
      };
    }
    return this.statistics.getJobStatistics();
  }

  @MessagePattern('ats.statistics.applications')
  async getAppStats(@Payload() payload: UserIdDto) {
    const userId = payload?.user_id;
    if (userId && userId.length === 24 && /^[0-9a-f]{24}$/i.test(userId)) {
      const applications = await this.statistics.getAllApplications(userId);
      return {
        total_applications: applications.length,
        total_accepted: applications.filter((a) => a.status === 'ACCEPTED')
          .length,
        total_rejected: applications.filter((a) => a.status === 'REJECTED')
          .length,
        user_id: userId,
      };
    }
    const jobStats = await this.statistics.getJobStatistics();
    return {
      total_applications: jobStats.total_applications,
      total_accepted: jobStats.total_accepted,
      total_rejected: jobStats.total_rejected,
    };
  }
}

@Controller()
export class UserStatisticsController {
  constructor(private readonly statistics: StatisticsService) {}

  @MessagePattern('ats.userStatistics.get')
  async getUserStats(@Payload() payload: UserStatsDto) {
    const userId = payload?.user_id;
    const createdBy = payload?.created_by;
    if (!userId) throw new BadRequestException('user_id is required');
    if (userId.length !== 24 || !/^[0-9a-f]{24}$/i.test(userId)) {
      throw new BadRequestException('Invalid user_id format');
    }
    if (createdBy && createdBy !== userId) {
      throw new ForbiddenException('created_by must match user_id');
    }
    const effectiveCreatedBy = createdBy || userId;
    const applications = await this.statistics.getAllApplications(userId);
    const evalStats = await this.statistics.getUserEvaluationStatistics(userId);
    const quizStats = await this.statistics.getUserQuizStatistics(userId);
    return {
      user_id: userId,
      created_by: effectiveCreatedBy,
      total_applications: applications.length,
      total_evaluations: evalStats.total_evaluations || 0,
      acceptance_rate: evalStats.acceptance_rate || 0,
      average_score: evalStats.average_score || 0,
      quiz_pass_rate: quizStats.pass_rate ?? 0,
      daily_stats: {},
    };
  }
}
