import { Module } from '@nestjs/common';
import { StatisticsGatewayController } from './statistics.controller';
import { StatisticsGatewayService } from './statistics.service';
import { NatsClientModule } from 'src/common/nats-client/nats-client.module';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AuthGatewayModule } from '../../hrms/auth/auth.module';

@Module({
  imports: [NatsClientModule, AuthGatewayModule],
  controllers: [StatisticsGatewayController],
  providers: [StatisticsGatewayService, JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class StatisticsGatewayModule {}
