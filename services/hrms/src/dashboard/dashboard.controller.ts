import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DashboardService } from './dashboard.service';
import { UserIdDto } from './dto/user-id.dto';

@Controller()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @MessagePattern('hrms.dashboard.get')
  async getDashboard(@Payload() payload: UserIdDto) {
    const dashboard = await this.dashboardService.getStats(payload.user_id);
    return { message: 'Dashboard fetched successfully', dashboard };
  }

  @MessagePattern('hrms.dashboard.totalAttendance')
  async getTotalAttendance(@Payload() payload: UserIdDto) {
    const attendance = await this.dashboardService.getAllAttendanceForDashboard(
      payload.user_id,
    );
    return { message: 'Attendance fetched successfully', attendance };
  }
}
