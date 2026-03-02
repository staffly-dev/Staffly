import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GetAllApplicationsDto } from './dto/get-all-applications.dto';
import { GetOneApplicationDto } from './dto/get-one-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import { DeleteApplicationDto } from './dto/delete-application.dto';
import { ApplicationsService } from './applications.service';

@Controller()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @MessagePattern('ats.applications.getAll')
  async getAll(@Payload() payload: GetAllApplicationsDto) {
    return this.applicationsService.getAll(payload);
  }

  @MessagePattern('ats.applications.getOne')
  async getOne(@Payload() payload: GetOneApplicationDto) {
    return this.applicationsService.getOne(payload);
  }

  @MessagePattern('ats.applications.update')
  async update(@Payload() payload: UpdateApplicationDto) {
    return this.applicationsService.update(payload);
  }

  @MessagePattern('ats.applications.scheduleInterview')
  async scheduleInterview(@Payload() payload: ScheduleInterviewDto) {
    return this.applicationsService.scheduleInterview(payload);
  }

  @MessagePattern('ats.applications.delete')
  async delete(@Payload() payload: DeleteApplicationDto) {
    return this.applicationsService.delete(payload);
  }
}
