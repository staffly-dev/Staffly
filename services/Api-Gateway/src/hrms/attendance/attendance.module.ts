import { Module } from '@nestjs/common';
import { NatsClientModule } from 'src/common/nats-client/nats-client.module';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AuthGatewayModule } from '../auth/auth.module';
import { AttendanceGatewayController } from './attendance.controller';
import { AttendanceGatewayService } from './attendance.service';

@Module({
  imports: [NatsClientModule, AuthGatewayModule],
  controllers: [AttendanceGatewayController],
  providers: [AttendanceGatewayService, JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class AttendanceGatewayModule {}
