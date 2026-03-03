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
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AttendanceGatewayService } from './attendance.service';
import { CheckInDto } from './dto/checkin.dto';

@ApiTags('HRMS Attendance')
@Controller('api/v1/hrms/attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceGatewayController {
  constructor(private readonly attendanceService: AttendanceGatewayService) { }

  @Post('user/:userId/checkin')
  @ApiOperation({
    summary: 'Record check-in or check-out',
    description:
      'Records an attendance event (check-in or check-out) for the given user. Authenticated user can only record for themselves. Body typically includes type (check_in/check_out), timestamp, and optional location or notes.',
  })
  @ApiBody({
    type: CheckInDto,
    examples: {
      example1: {
        summary: 'Example check-in',
        value: {
          employeeId: '64f1a2b3c4d5e6f7g8h9i0j1',
          checkInTime: '2024-02-01T09:00:00Z',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Attendance record created.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: can only record own attendance.',
  })
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
  @ApiOperation({
    summary: 'Get attendance records for user',
    description:
      'Returns attendance records (check-in/check-out history) for the given user. Authenticated user can only access their own data. Use for timesheets or attendance reports.',
  })
  @ApiResponse({ status: 200, description: 'List of attendance records.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: can only access own records.',
  })
  async getEmployeeAccount(
    @Param('userId') userId: string,
    @Request() req: any,
  ) {
    if (req.user._id !== userId) {
      throw new ForbiddenException(
        'Access denied: You can only access your own employee account',
      );
    }
    return firstValueFrom(this.attendanceService.getEmployeeAccount(userId));
  }

  @Get('user/:userId/search')
  @ApiOperation({
    summary: 'Search attendance by name',
    description:
      'Searches attendance records for the user by optional firstName and lastName query params. Useful for filtering or finding records. User can only search their own attendance.',
  })
  @ApiResponse({ status: 200, description: 'Filtered attendance records.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: can only search own records.',
  })
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
