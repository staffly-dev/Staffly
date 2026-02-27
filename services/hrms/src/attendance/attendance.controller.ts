import {
  Controller,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AttendanceService } from './attendance.service';
import { CheckInDto } from './dto/checkin.dto';

type AttendanceCheckinPayload = {
  dto: CheckInDto;
  user_id: string;
};

type AttendanceFindAllPayload = {
  user_id: string;
};

type AttendanceFindOnePayload = {
  id: string;
  user_id: string;
};

type AttendanceSearchPayload = {
  user_id: string;
  firstName?: string;
  lastName?: string;
};

@Controller()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) { }

  @MessagePattern('hrms.attendance.checkin')
  async checkIn(@Payload() payload: AttendanceCheckinPayload) {
    const dto = payload?.dto;
    const userId = payload?.user_id;
    const checkInTime = dto?.checkInTime ? new Date(dto.checkInTime) : undefined;
    const attendance = await this.attendanceService.recordCheckIn(
      dto.employeeId,
      userId,
      checkInTime,
    );
    return { message: 'Attendance created successfully', attendance };
  }

  @MessagePattern('hrms.attendance.findAll')
  async findAll(@Payload() payload: AttendanceFindAllPayload) {
    const attendance = await this.attendanceService.findAll(payload.user_id);
    return { message: 'Attendance fetched successfully', attendance };
  }

  @MessagePattern('hrms.attendance.findOne')
  async findOne(@Payload() payload: AttendanceFindOnePayload) {
    const attendance = await this.attendanceService.findOne(payload.id, payload.user_id);
    return { message: 'Attendance fetched successfully', attendance };
  }

  @MessagePattern('hrms.attendance.search')
  async search(@Payload() payload: AttendanceSearchPayload) {
    const attendance = await this.attendanceService.search(
      payload.user_id,
      payload.firstName,
      payload.lastName,
    );
    return { message: 'Attendance fetched successfully', attendance };
  }
}
