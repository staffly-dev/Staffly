import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import configuration from './common/config/configuration';
import { NatsClientModule } from './common/nats-client/nats-client.module';
import { CorsMiddleware } from './common/middleware/cors.middleware';
import { BotProtectionMiddleware } from './common/middleware/bot-protection.middleware';
import { SwaggerService } from './common/services/swagger.service';
import { LoggerService } from './common/services/logger.service';
import { AccountGatewayModule } from './hrms/account/account.module';
import { AuthGatewayModule } from './hrms/auth/auth.module';
import { BillingGatewayModule } from './hrms/billing/billing.module';
import { SettingsGatewayModule } from './hrms/settings/settings.module';
import { AttendanceGatewayModule } from './hrms/attendance/attendance.module';
import { DashboardGatewayModule } from './hrms/dashboard/dashboard.module';
import { EmployeesGatewayModule } from './hrms/employees/employees.module';
import { PayrollGatewayModule } from './hrms/payroll/payroll.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
    }),
    // Nats Client
    NatsClientModule,
    //* HRMS Services
    AccountGatewayModule,
    AttendanceGatewayModule,
    AuthGatewayModule,
    BillingGatewayModule,
    DashboardGatewayModule,
    EmployeesGatewayModule,
    PayrollGatewayModule,
    SettingsGatewayModule,
    //* Generative AI Services
  ],
  controllers: [AppController],
  providers: [SwaggerService, LoggerService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware).forRoutes('*');

    consumer
      .apply(BotProtectionMiddleware)
      .exclude(
        { path: 'health', method: RequestMethod.GET },
        { path: 'app/health', method: RequestMethod.GET },
      )
      .forRoutes('*');
  }
}
