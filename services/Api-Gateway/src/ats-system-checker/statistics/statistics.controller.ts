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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StatisticsGatewayService } from './statistics.service';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetQuizStatsDto } from './dto/get-quiz-stats.dto';
import { GetJobStatsDto } from './dto/get-job-stats.dto';
import { GetAppStatsDto } from './dto/get-app-stats.dto';
import { GetUserStatsDto } from './dto/get-user-stats.dto';
import { StatisticsResponseDto } from './dto/statistics-response.dto';

@ApiTags('ATS Statistics')
@Controller('api/v1/ats/statistics')
@UseGuards(JwtAuthGuard)
export class StatisticsGatewayController {
  constructor(private readonly statisticsService: StatisticsGatewayService) {}

  @Get('get-stats')
  @ApiOperation({
    summary: 'Get global ATS statistics',
    description:
      'Returns overall ATS statistics (e.g. total jobs, applications, quiz attempts). Use for admin or landing dashboards. No user_id filter.',
  })
  @ApiResponse({ status: 200, description: 'Global stats returned.' })
  async getStats(): Promise<StatisticsResponseDto> {
    return firstValueFrom(this.statisticsService.getStats());
  }

  @Get('get-quiz-stats')
  @ApiOperation({
    summary: 'Get quiz statistics',
    description:
      'Returns quiz-related stats (e.g. completions, average score) for the given user_id. user_id must match authenticated user. Use for quiz analytics.',
  })
  @ApiResponse({ status: 200, description: 'Quiz stats returned.' })
  @ApiResponse({ status: 403, description: 'Forbidden: user_id mismatch.' })
  async getQuizStats(
    @Query() query: GetQuizStatsDto,
    @Request() req: any,
  ): Promise<StatisticsResponseDto> {
    if (query.user_id && query.user_id !== req.user._id) {
      throw new ForbiddenException('Access denied: user_id mismatch');
    }
    return firstValueFrom(this.statisticsService.getQuizStats(query));
  }

  @Get('get-job-stats')
  @ApiOperation({
    summary: 'Get job statistics',
    description:
      'Returns job-related stats (e.g. views, applications per job) for the given user_id. user_id must match authenticated user. Use for recruiter analytics.',
  })
  @ApiResponse({ status: 200, description: 'Job stats returned.' })
  @ApiResponse({ status: 403, description: 'Forbidden: user_id mismatch.' })
  async getJobStats(
    @Query() query: GetJobStatsDto,
    @Request() req: any,
  ): Promise<StatisticsResponseDto> {
    if (query.user_id && query.user_id !== req.user._id) {
      throw new ForbiddenException('Access denied: user_id mismatch');
    }
    return firstValueFrom(this.statisticsService.getJobStats(query));
  }

  @Get('get-app-stats')
  @ApiOperation({
    summary: 'Get application statistics',
    description:
      'Returns application stats (e.g. by status, source) for the given user_id. user_id must match authenticated user. Use for pipeline or funnel views.',
  })
  @ApiResponse({ status: 200, description: 'Application stats returned.' })
  @ApiResponse({ status: 403, description: 'Forbidden: user_id mismatch.' })
  async getAppStats(
    @Query() query: GetAppStatsDto,
    @Request() req: any,
  ): Promise<StatisticsResponseDto> {
    if (query.user_id && query.user_id !== req.user._id) {
      throw new ForbiddenException('Access denied: user_id mismatch');
    }
    return firstValueFrom(this.statisticsService.getAppStats(query));
  }

  @Get('get-user-stats')
  @ApiOperation({
    summary: 'Get user-level statistics',
    description:
      'Returns stats for a specific user (e.g. their applications, quiz results). Query includes user_id; must match authenticated user. Use for candidate or profile stats.',
  })
  @ApiResponse({ status: 200, description: 'User stats returned.' })
  @ApiResponse({ status: 403, description: 'Forbidden: user_id mismatch.' })
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
