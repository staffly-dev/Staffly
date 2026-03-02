/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AttendanceGatewayService } from './attendance.service';
import { CheckInDto } from './dto/checkin.dto';

@Controller('api/v1/hrms/attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceGatewayController {
  constructor(private readonly attendanceService: AttendanceGatewayService) {}

  @Post('user/:userId/checkin')
  async checkIn(
    @Param('userId') userId: string,
    @Body() dto: CheckInDto,
    @Request() req: any,
  ) {
    if (req.user._id !== userId) {
      throw new ForbiddenException(
        'Access denied: You can only record attendance for your own employees',
      );
    }
    return firstValueFrom(this.attendanceService.checkIn(userId, dto));
  }

  @Get('user/:userId')
  async getEmployeeAccount(
    @Param('userId') userId: string,
    @Request() req: any,
  ): Promise<EmployeeAccount> {
    if (req.user._id !== userId) {
      throw new ForbiddenException(
        'Access denied: You can only access your own employee account',
      );
    }
    return firstValueFrom(this.attendanceService.getEmployeeAccount(userId));
  }

  @Get('user/:userId/search')
  async search(
    @Param('userId') userId: string,
    @Query('firstName') firstName: string | undefined,
    @Query('lastName') lastName: string | undefined,
    @Request() req: any,
  ) {
    if (req.user._id !== userId) {
      throw new ForbiddenException(
        'Access denied: You can only search your own attendance records',
      );
    }
    return firstValueFrom(
      this.attendanceService.search(userId, firstName, lastName),
    );
  }
}
