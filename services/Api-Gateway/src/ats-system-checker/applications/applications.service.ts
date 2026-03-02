import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { GetAllApplicationsDto } from './dto/get-all-applications.dto';
import { GetOneApplicationDto } from './dto/get-one-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import { DeleteApplicationDto } from './dto/delete-application.dto';
import { ApplicationsResponseDto } from './dto/applications-response.dto';

@Injectable()
export class ApplicationsGatewayService {
  constructor(
    @Inject('NATS_SERVICE')
    private readonly client: ClientProxy,
  ) {}

  getAll(query: GetAllApplicationsDto): Observable<ApplicationsResponseDto> {
    return this.client.send({ cmd: 'ats.applications.getAll' }, query);
  }

  getOne(query: GetOneApplicationDto): Observable<ApplicationsResponseDto> {
    return this.client.send({ cmd: 'ats.applications.getOne' }, query);
  }

  update(body: UpdateApplicationDto): Observable<ApplicationsResponseDto> {
    return this.client.send({ cmd: 'ats.applications.update' }, body);
  }

  scheduleInterview(
    body: ScheduleInterviewDto,
  ): Observable<ApplicationsResponseDto> {
    return this.client.send(
      { cmd: 'ats.applications.scheduleInterview' },
      body,
    );
  }

  delete(body: DeleteApplicationDto): Observable<ApplicationsResponseDto> {
    return this.client.send({ cmd: 'ats.applications.delete' }, body);
  }
}
