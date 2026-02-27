import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CheckInDto } from './dto/checkin.dto';

@Injectable()
export class AttendanceGatewayService {
  constructor(
    @Inject('NATS_SERVICE')
    private readonly client: ClientProxy,
  ) {}

  checkIn(userId: string, dto: CheckInDto) {
    return this.client.send('hrms.attendance.checkin', {
      dto,
      user_id: userId,
    });
  }

  findAll(userId: string) {
    return this.client.send('hrms.attendance.findAll', { user_id: userId });
  }

  findOne(userId: string, id: string) {
    return this.client.send('hrms.attendance.findOne', {
      id,
      user_id: userId,
    });
  }

  search(userId: string, firstName?: string, lastName?: string) {
    return this.client.send('hrms.attendance.search', {
      user_id: userId,
      firstName,
      lastName,
    });
  }
}
