import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class DashboardGatewayService {
  constructor(
    @Inject('NATS_SERVICE')
    private readonly client: ClientProxy,
  ) {}

  getDashboard(userId: string) {
    return this.client.send('hrms.dashboard.get', { user_id: userId });
  }

  getTotalAttendance(userId: string) {
    return this.client.send('hrms.dashboard.totalAttendance', {
      user_id: userId,
    });
  }
}
