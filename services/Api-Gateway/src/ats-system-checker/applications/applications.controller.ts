/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ApplicationsGatewayService } from './applications.service';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetAllApplicationsDto } from './dto/get-all-applications.dto';
import { GetOneApplicationDto } from './dto/get-one-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import { DeleteApplicationDto } from './dto/delete-application.dto';
import { ApplicationsResponseDto } from './dto/applications-response.dto';

@ApiTags('ATS Applications')
@Controller('api/v1/ats/applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsGatewayController {
  constructor(
    private readonly applicationsService: ApplicationsGatewayService,
  ) {}

  @Get('get-all-applications')
  @ApiOperation({
    summary: 'List applications',
    description:
      'Returns job applications, optionally filtered by user_id, job_id, status. Query params may include pagination. user_id if sent must match authenticated user. Use for recruiter dashboard.',
  })
  @ApiResponse({ status: 200, description: 'List of applications.' })
  @ApiResponse({ status: 403, description: 'Forbidden: user_id mismatch.' })
  async getAll(
    @Query() query: GetAllApplicationsDto,
    @Request() req: any,
  ): Promise<ApplicationsResponseDto> {
    if (query.user_id && query.user_id !== req.user._id) {
      throw new ForbiddenException('Access denied: user_id mismatch');
    }
    return firstValueFrom(this.applicationsService.getAll(query));
  }

  @Get('get-one-application')
  @ApiOperation({
    summary: 'Get one application',
    description:
      'Returns a single application by application id (and optional user_id). Use for application detail or review page. user_id if provided must match authenticated user.',
  })
  @ApiResponse({ status: 200, description: 'Application details.' })
  @ApiResponse({ status: 403, description: 'Forbidden: user_id mismatch.' })
  async getOne(
    @Query() query: GetOneApplicationDto,
    @Request() req: any,
  ): Promise<ApplicationsResponseDto> {
    if (query.user_id && query.user_id !== req.user._id) {
      throw new ForbiddenException('Access denied: user_id mismatch');
    }
    return firstValueFrom(this.applicationsService.getOne(query));
  }

  @Put('update-application')
  @ApiOperation({
    summary: 'Update application',
    description:
      'Updates an application (e.g. status, rating, notes). Body includes application id and fields to change. user_id if provided must match authenticated user.',
  })
  @ApiBody({
    type: UpdateApplicationDto,
    examples: {
      example1: {
        summary: 'Example application update',
        value: {
          app_id: 'app_12345',
          user_id: '64f1a2b3c4d5e6f7g8h9i0j1',
          status: 'under_review',
          decision: 'pending_interview',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Application updated.' })
  @ApiResponse({ status: 403, description: 'Forbidden: user_id mismatch.' })
  async update(
    @Body() body: UpdateApplicationDto,
    @Request() req: any,
  ): Promise<ApplicationsResponseDto> {
    if (body.user_id && body.user_id !== req.user._id) {
      throw new ForbiddenException('Access denied: user_id mismatch');
    }
    return firstValueFrom(this.applicationsService.update(body));
  }

  @Post('schedule-interview')
  @ApiOperation({
    summary: 'Schedule interview',
    description:
      'Schedules an interview for an application (date, time, location/link, notes). Body includes application id and schedule details. user_id must match authenticated user.',
  })
  @ApiBody({
    type: ScheduleInterviewDto,
    examples: {
      example1: {
        summary: 'Example interview scheduling',
        value: {
          app_id: 'app_12345',
          user_id: '64f1a2b3c4d5e6f7g8h9i0j1',
          interview_date: '2024-02-15',
          interview_time: '14:30',
          interview_type: 'video_call',
          location: 'https://zoom.us/j/123456789',
          notes: 'Please bring portfolio and ID verification',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Interview scheduled.' })
  @ApiResponse({ status: 403, description: 'Forbidden: user_id mismatch.' })
  async scheduleInterview(
    @Body() body: ScheduleInterviewDto,
    @Request() req: any,
  ): Promise<ApplicationsResponseDto> {
    if (body.user_id && body.user_id !== req.user._id) {
      throw new ForbiddenException('Access denied: user_id mismatch');
    }
    return firstValueFrom(this.applicationsService.scheduleInterview(body));
  }

  @Delete('delete-application')
  @ApiOperation({
    summary: 'Delete application',
    description:
      'Deletes or withdraws an application. Query params include application id and optional user_id; user_id must match authenticated user.',
  })
  @ApiResponse({ status: 200, description: 'Application deleted.' })
  @ApiResponse({ status: 403, description: 'Forbidden: user_id mismatch.' })
  async delete(
    @Query() query: DeleteApplicationDto,
    @Request() req: any,
  ): Promise<ApplicationsResponseDto> {
    if (query.user_id && query.user_id !== req.user._id) {
      throw new ForbiddenException('Access denied: user_id mismatch');
    }
    return firstValueFrom(this.applicationsService.delete(query));
  }
}
