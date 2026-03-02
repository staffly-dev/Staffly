import { Module } from '@nestjs/common';
import { ApplicationsGatewayController } from './applications.controller';
import { ApplicationsGatewayService } from './applications.service';
import { NatsClientModule } from 'src/common/nats-client/nats-client.module';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AuthGatewayModule } from '../../hrms/auth/auth.module';

@Module({
  imports: [NatsClientModule, AuthGatewayModule],
  controllers: [ApplicationsGatewayController],
  providers: [ApplicationsGatewayService, JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class ApplicationsGatewayModule {}
