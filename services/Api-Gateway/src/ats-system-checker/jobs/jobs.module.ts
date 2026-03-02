import { Module } from '@nestjs/common';
import { JobsGatewayController } from './jobs.controller';
import { JobsGatewayService } from './jobs.service';
import { NatsClientModule } from 'src/common/nats-client/nats-client.module';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AuthGatewayModule } from '../../hrms/auth/auth.module';

@Module({
  imports: [NatsClientModule, AuthGatewayModule],
  controllers: [JobsGatewayController],
  providers: [JobsGatewayService, JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class JobsGatewayModule {}
