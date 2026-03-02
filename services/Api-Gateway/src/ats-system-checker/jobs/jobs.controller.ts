/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
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

@Controller('api/v1/ats/jobs')
@UseGuards(JwtAuthGuard)
export class JobsGatewayController {
  constructor(private readonly jobsService: JobsGatewayService) {}

  @Get()
  async getAll(
    @Query() query: GetAllJobsDto,
    @Request() req: any,
  ): Promise<JobsResponseDto> {
    if (query.user_id && query.user_id !== req.user._id) {
      throw new ForbiddenException('Access denied: user_id mismatch');
    }
    return firstValueFrom(this.jobsService.getAll(query));
  }

  @Post()
  async create(
    @Body() body: CreateJobDto,
    @Request() req: any,
  ): Promise<JobsResponseDto> {
    if (body.user_id && body.user_id !== req.user._id) {
      throw new ForbiddenException('Access denied: user_id mismatch');
    }
    return firstValueFrom(this.jobsService.create(body));
  }

  @Get('one')
  async getOne(
    @Query() query: GetOneJobDto,
    @Request() req: any,
  ): Promise<JobsResponseDto> {
    if (query.user_id && query.user_id !== req.user._id) {
      throw new ForbiddenException('Access denied: user_id mismatch');
    }
    return firstValueFrom(this.jobsService.getOne(query));
  }

  @Put()
  async update(
    @Body() body: UpdateJobDto,
    @Request() req: any,
  ): Promise<JobsResponseDto> {
    if (body.user_id && body.user_id !== req.user._id) {
      throw new ForbiddenException('Access denied: user_id mismatch');
    }
    return firstValueFrom(this.jobsService.update(body));
  }

  @Delete()
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
  async apply(
    @Body() body: ApplyJobDto,
    @Request() req: any,
  ): Promise<JobsResponseDto> {
    // Apply does not require user_id match; it's a public endpoint for candidates
    return firstValueFrom(this.jobsService.apply(body));
  }
}
