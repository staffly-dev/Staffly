/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { StatisticsGatewayService } from './statistics.service';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetQuizStatsDto } from './dto/get-quiz-stats.dto';
import { GetJobStatsDto } from './dto/get-job-stats.dto';
import { GetAppStatsDto } from './dto/get-app-stats.dto';
import { GetUserStatsDto } from './dto/get-user-stats.dto';
import { StatisticsResponseDto } from './dto/statistics-response.dto';

@Controller('api/v1/ats/statistics')
@UseGuards(JwtAuthGuard)
export class StatisticsGatewayController {
  constructor(private readonly statisticsService: StatisticsGatewayService) {}

  @Get()
  async getStats(): Promise<StatisticsResponseDto> {
    return firstValueFrom(this.statisticsService.getStats());
  }

  @Get('quiz')
  async getQuizStats(
    @Query() query: GetQuizStatsDto,
    @Request() req: any,
  ): Promise<StatisticsResponseDto> {
    if (query.user_id && query.user_id !== req.user._id) {
      throw new ForbiddenException('Access denied: user_id mismatch');
    }
    return firstValueFrom(this.statisticsService.getQuizStats(query));
  }

  @Get('jobs')
  async getJobStats(
    @Query() query: GetJobStatsDto,
    @Request() req: any,
  ): Promise<StatisticsResponseDto> {
    if (query.user_id && query.user_id !== req.user._id) {
      throw new ForbiddenException('Access denied: user_id mismatch');
    }
    return firstValueFrom(this.statisticsService.getJobStats(query));
  }

  @Get('applications')
  async getAppStats(
    @Query() query: GetAppStatsDto,
    @Request() req: any,
  ): Promise<StatisticsResponseDto> {
    if (query.user_id && query.user_id !== req.user._id) {
      throw new ForbiddenException('Access denied: user_id mismatch');
    }
    return firstValueFrom(this.statisticsService.getAppStats(query));
  }

  @Get('user')
  async getUserStats(
    @Query() query: GetUserStatsDto,
    @Request() req: any,
  ): Promise<StatisticsResponseDto> {
    if (query.user_id && query.user_id !== req.user._id) {
      throw new ForbiddenException('Access denied: user_id mismatch');
    }
    return firstValueFrom(this.statisticsService.getUserStats(query));
  }
}
