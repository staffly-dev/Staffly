import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { GetAllJobsDto } from './dto/get-all-jobs.dto';
import { CreateJobDto } from './dto/create-job.dto';
import { GetOneJobDto } from './dto/get-one-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { DeleteJobDto } from './dto/delete-job.dto';
import { ApplyJobDto } from './dto/apply-job.dto';
import { JobsResponseDto } from './dto/jobs-response.dto';

@Injectable()
export class JobsGatewayService {
  constructor(
    @Inject('NATS_SERVICE')
    private readonly client: ClientProxy,
  ) {}

  getAll(query: GetAllJobsDto): Observable<JobsResponseDto> {
    return this.client.send({ cmd: 'ats.jobs.getAll' }, query);
  }

  create(body: CreateJobDto): Observable<JobsResponseDto> {
    return this.client.send({ cmd: 'ats.jobs.create' }, body);
  }

  getOne(query: GetOneJobDto): Observable<JobsResponseDto> {
    return this.client.send({ cmd: 'ats.jobs.getOne' }, query);
  }

  update(body: UpdateJobDto): Observable<JobsResponseDto> {
    return this.client.send({ cmd: 'ats.jobs.update' }, body);
  }

  delete(body: DeleteJobDto): Observable<JobsResponseDto> {
    return this.client.send({ cmd: 'ats.jobs.delete' }, body);
  }

  apply(body: ApplyJobDto): Observable<JobsResponseDto> {
    return this.client.send({ cmd: 'ats.jobs.apply' }, body);
  }
}
