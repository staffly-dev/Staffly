import { Module } from '@nestjs/common';
import { NatsClientModule } from 'src/common/nats-client/nats-client.module';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AuthGatewayModule } from '../auth/auth.module';
import { PayrollGatewayController } from './payroll.controller';
import { PayrollGatewayService } from './payroll.service';

@Module({
  imports: [NatsClientModule, AuthGatewayModule],
  controllers: [PayrollGatewayController],
  providers: [PayrollGatewayService, JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class PayrollGatewayModule {}
