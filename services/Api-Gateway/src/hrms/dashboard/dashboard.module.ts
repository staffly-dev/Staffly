import { Module } from '@nestjs/common';
import { NatsClientModule } from 'src/common/nats-client/nats-client.module';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AuthGatewayModule } from '../auth/auth.module';
import { DashboardGatewayController } from './dashboard.controller';
import { DashboardGatewayService } from './dashboard.service';

@Module({
  imports: [NatsClientModule, AuthGatewayModule],
  controllers: [DashboardGatewayController],
  providers: [DashboardGatewayService, JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class DashboardGatewayModule {}
