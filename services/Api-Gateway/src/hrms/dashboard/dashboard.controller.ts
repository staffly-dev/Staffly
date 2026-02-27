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
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DashboardGatewayService } from './dashboard.service';

@Controller('api/v1/hrms/dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardGatewayController {
  constructor(private readonly dashboardService: DashboardGatewayService) { }

  @Get('user/:userId')
  async getDashboard(@Param('userId') userId: string, @Request() req: any) {
    if (req.user._id !== userId) {
      throw new ForbiddenException(
        'Access denied: You can only access your own dashboard',
      );
    }
    return firstValueFrom(this.dashboardService.getDashboard(userId));
  }

  @Get('user/:userId/attendance')
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
