/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { JobsGatewayService } from './jobs.service';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetAllJobsDto } from './dto/get-all-jobs.dto';
import { CreateJobDto } from './dto/create-job.dto';
import { GetOneJobDto } from './dto/get-one-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { DeleteJobDto } from './dto/delete-job.dto';
import { ApplyJobDto } from './dto/apply-job.dto';
import { JobsResponseDto } from './dto/jobs-response.dto';

@ApiTags('ATS Jobs')
@Controller('api/v1/ats/jobs')
@UseGuards(JwtAuthGuard)
export class JobsGatewayController {
  constructor(private readonly jobsService: JobsGatewayService) { }

  @Get('get-all-jobs')
  @ApiOperation({
    summary: 'List job postings',
    description:
      'Returns a paginated/filtered list of job postings. Query params may include user_id, page, limit, status, search. If user_id is sent it must match the authenticated user. Use for job boards or employer job list.',
  })
  @ApiResponse({ status: 200, description: 'List of jobs returned.' })
  @ApiResponse({ status: 403, description: 'Forbidden: user_id mismatch.' })
  async getAll(
    @Query() query: GetAllJobsDto,
    @Request() req: any,
  ): Promise<JobsResponseDto> {
    if (query.user_id && query.user_id !== req.user._id) {
      throw new ForbiddenException('Access denied: user_id mismatch');
    }
    return firstValueFrom(this.jobsService.getAll(query));
  }

  @Post('create-job')
  @ApiOperation({
    summary: 'Create job posting',
    description:
      'Creates a new job posting (title, description, location, requirements, etc.). Optional user_id in body must match authenticated user. Returns the created job.',
  })
  @ApiBody({
    type: CreateJobDto,
    examples: {
      example1: {
        summary: 'Example job posting',
        value: {
          user_id: '64f1a2b3c4d5e6f7g8h9i0j1',
          title: 'Senior Software Engineer',
          description:
            'We are looking for an experienced software engineer to join our team and help build innovative solutions.',
          required_skills: 'JavaScript, TypeScript, Node.js, React, MongoDB',
          hr_email: 'hr@company.com',
          hr_name: 'John Doe',
          quiz_required: true,
          quiz_pass_threshold: 8,
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Job created.' })
  @ApiResponse({ status: 403, description: 'Forbidden: user_id mismatch.' })
  async create(
    @Body() body: CreateJobDto,
    @Request() req: any,
  ): Promise<JobsResponseDto> {
    if (body.user_id && body.user_id !== req.user._id) {
      throw new ForbiddenException('Access denied: user_id mismatch');
    }
    return firstValueFrom(this.jobsService.create(body));
  }

  @Get('get-one-job')
  @ApiOperation({
    summary: 'Get one job by ID',
    description:
      'Returns a single job posting by job id (and optional user_id in query). Use for job detail page. user_id if provided must match authenticated user.',
  })
  @ApiResponse({ status: 200, description: 'Job details returned.' })
  @ApiResponse({ status: 403, description: 'Forbidden: user_id mismatch.' })
  async getOne(
    @Query() query: GetOneJobDto,
    @Request() req: any,
  ): Promise<JobsResponseDto> {
    if (query.user_id && query.user_id !== req.user._id) {
      throw new ForbiddenException('Access denied: user_id mismatch');
    }
    return firstValueFrom(this.jobsService.getOne(query));
  }

  @Put('update-job')
  @ApiOperation({
    summary: 'Update job posting',
    description:
      'Updates an existing job. Send job id and fields to change in body. user_id if provided must match authenticated user.',
  })
  @ApiResponse({ status: 200, description: 'Job updated.' })
  @ApiResponse({ status: 403, description: 'Forbidden: user_id mismatch.' })
  async update(
    @Body() body: UpdateJobDto,
    @Request() req: any,
  ): Promise<JobsResponseDto> {
    if (body.user_id && body.user_id !== req.user._id) {
      throw new ForbiddenException('Access denied: user_id mismatch');
    }
    return firstValueFrom(this.jobsService.update(body));
  }

  @Delete('delete-job')
  @ApiOperation({
    summary: 'Delete job posting',
    description:
      'Deletes a job by id. Query params include job id and optional user_id; user_id must match authenticated user.',
  })
  @ApiResponse({ status: 200, description: 'Job deleted.' })
  @ApiResponse({ status: 403, description: 'Forbidden: user_id mismatch.' })
  async delete(
    @Query() query: DeleteJobDto,
    @Request() req: any,
  ): Promise<JobsResponseDto> {
    if (query.user_id && query.user_id !== req.user._id) {
      throw new ForbiddenException('Access denied: user_id mismatch');
    }
    return firstValueFrom(this.jobsService.delete(query));
  }

  @Post('apply')
  @ApiOperation({
    summary: 'Apply to a job',
    description:
      'Submits a job application (candidate). Send job id, candidate info, resume/CV (e.g. file key or base64). Does not require user_id match; used by applicants. Returns application confirmation.',
  })
  @ApiResponse({ status: 201, description: 'Application submitted.' })
  @ApiResponse({
    status: 400,
    description: 'Invalid payload or missing resume.',
  })
  async apply(
    @Body() body: ApplyJobDto,
    @Request() req: any,
  ): Promise<JobsResponseDto> {
    // Apply does not require user_id match; it's a public endpoint for candidates
    return firstValueFrom(this.jobsService.apply(body));
  }
}
