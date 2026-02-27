import { Module } from '@nestjs/common';
import { NatsClientModule } from 'src/common/nats-client/nats-client.module';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AuthGatewayModule } from '../auth/auth.module';
import { EmployeesGatewayController } from './employees.controller';
import { EmployeesGatewayService } from './employees.service';

@Module({
  imports: [NatsClientModule, AuthGatewayModule],
  controllers: [EmployeesGatewayController],
  providers: [EmployeesGatewayService, JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class EmployeesGatewayModule {}
