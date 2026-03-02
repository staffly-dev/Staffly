/* eslint-disable @typescript-eslint/no-unsafe-return */
import { BadRequestException, Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { JobsService } from './jobs.service';
import { GetAllJobsDto } from './dto/get-all-jobs.dto';
import { CreateJobDto } from './dto/create-job.dto';
import { JobIdDto } from './dto/job-id.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { ApplyJobDto } from './dto/apply-job.dto';

@Controller()
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @MessagePattern('ats.jobs.getAll')
  async getAll(@Payload() payload: GetAllJobsDto) {
    return this.jobsService.getAllJobs(
      payload?.user_id,
      !!payload?.include_inactive,
    );
  }

  @MessagePattern('ats.jobs.create')
  async create(@Payload() body: CreateJobDto) {
    const userId = body?.user_id;
    if (!userId)
      throw new BadRequestException({
        success: false,
        error: true,
        message: 'user_id is required',
      });
    if (userId.length !== 24 || !/^[0-9a-f]{24}$/i.test(userId)) {
      throw new BadRequestException({
        success: false,
        error: true,
        message: 'Invalid user_id format',
      });
    }
    (body as Record<string, unknown>).owner_user_id = userId;
    return this.jobsService.createJob(body as any);
  }

  @MessagePattern('ats.jobs.getOne')
  async getOne(@Payload() payload: JobIdDto) {
    if (!payload?.job_id?.trim())
      throw new BadRequestException('job_id is required');
    return this.jobsService.getJob(payload.job_id, payload.user_id);
  }

  @MessagePattern('ats.jobs.update')
  async update(@Payload() payload: UpdateJobDto) {
    if (!payload?.job_id?.trim())
      throw new BadRequestException('job_id is required');
    return this.jobsService.updateJob(
      payload.job_id,
      payload.updates,
      payload.user_id,
    );
  }

  @MessagePattern('ats.jobs.delete')
  async delete(@Payload() payload: JobIdDto) {
    if (!payload?.job_id?.trim())
      throw new BadRequestException('job_id is required');
    await this.jobsService.deleteJob(payload.job_id, payload.user_id);
    return { success: true, message: 'Job posting deleted successfully' };
  }

  @MessagePattern('ats.jobs.apply')
  async apply(@Payload() payload: ApplyJobDto) {
    if (!payload?.job_id?.trim())
      throw new BadRequestException('job_id is required');
    if (!payload?.candidate_email?.trim()) {
      throw new BadRequestException({
        success: false,
        error: true,
        message: 'candidate_email is required',
      });
    }
    if (
      !payload?.file?.filename?.trim() ||
      !payload?.file?.data_base64?.trim()
    ) {
      throw new BadRequestException({
        success: false,
        error: true,
        message: 'file (filename, data_base64) is required',
      });
    }
    return this.jobsService.applyForJobBase64(
      payload.job_id,
      payload.candidate_email,
      payload.candidate_name,
      payload.file,
    );
  }
}
