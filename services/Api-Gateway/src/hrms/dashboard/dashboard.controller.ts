/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Param,
  Request,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DashboardGatewayService } from './dashboard.service';

@ApiTags('HRMS Dashboard')
@Controller('api/v1/hrms/dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardGatewayController {
  constructor(private readonly dashboardService: DashboardGatewayService) { }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get dashboard data',
    description:
      'Returns aggregated dashboard data for the user (e.g. summary stats, recent activity, quick links). Use for the main HR dashboard after login. User can only access their own dashboard.',
  })
  @ApiResponse({ status: 200, description: 'Dashboard data returned.' })
  @ApiResponse({ status: 403, description: 'Forbidden: can only access own dashboard.' })
  async getDashboard(@Param('userId') userId: string, @Request() req: any) {
    if (req.user._id !== userId) {
      throw new ForbiddenException(
        'Access denied: You can only access your own dashboard',
      );
    }
    return firstValueFrom(this.dashboardService.getDashboard(userId));
  }

  @Get('user/:userId/attendance')
  @ApiOperation({
    summary: 'Get total attendance stats',
    description:
      'Returns attendance summary for the user (e.g. total hours, days present, trend). Use for dashboard widgets or reports. User can only access their own stats.',
  })
  @ApiResponse({ status: 200, description: 'Attendance summary returned.' })
  @ApiResponse({ status: 403, description: 'Forbidden: can only access own stats.' })
  async getTotalAttendance(
    @Param('userId') userId: string,
    @Request() req: any,
  ) {
    if (req.user._id !== userId) {
      throw new ForbiddenException(
        'Access denied: You can only access your own attendance stats',
      );
    }
    return firstValueFrom(this.dashboardService.getTotalAttendance(userId));
  }
}
