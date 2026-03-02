/* eslint-disable @typescript-eslint/no-unsafe-return */
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
import { ApplicationsGatewayService } from './applications.service';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetAllApplicationsDto } from './dto/get-all-applications.dto';
import { GetOneApplicationDto } from './dto/get-one-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import { DeleteApplicationDto } from './dto/delete-application.dto';
import { ApplicationsResponseDto } from './dto/applications-response.dto';

@Controller('api/v1/ats/applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsGatewayController {
  constructor(
    private readonly applicationsService: ApplicationsGatewayService,
  ) {}

  @Get()
  async getAll(
    @Query() query: GetAllApplicationsDto,
    @Request() req: any,
  ): Promise<ApplicationsResponseDto> {
    if (query.user_id && query.user_id !== req.user._id) {
      throw new ForbiddenException('Access denied: user_id mismatch');
    }
    return firstValueFrom(this.applicationsService.getAll(query));
  }

  @Get('one')
  async getOne(
    @Query() query: GetOneApplicationDto,
    @Request() req: any,
  ): Promise<ApplicationsResponseDto> {
    if (query.user_id && query.user_id !== req.user._id) {
      throw new ForbiddenException('Access denied: user_id mismatch');
    }
    return firstValueFrom(this.applicationsService.getOne(query));
  }

  @Put()
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
  async scheduleInterview(
    @Body() body: ScheduleInterviewDto,
    @Request() req: any,
  ): Promise<ApplicationsResponseDto> {
    if (body.user_id && body.user_id !== req.user._id) {
      throw new ForbiddenException('Access denied: user_id mismatch');
    }
    return firstValueFrom(this.applicationsService.scheduleInterview(body));
  }

  @Delete()
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
