import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountModule } from './account/account.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { AttendanceModule } from './attendance/attendance.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EmployeesModule } from './employees/employees.module';
import { PayrollModule } from './payroll/payroll.module';
import { BillingModule } from './billing/billing.module';
import configuration from './common/config/configuration';
import { SettingsModule } from './settings/settings.module';
import { getMongoConfig } from './common/config/mongo.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
    }),
    // MongooseModule.forRoot(configuration().MONGO_URI_RMOTE!),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getMongoConfig,
    }),
    //? HRMS Models
    AuthModule,
    EmployeesModule,
    AttendanceModule,
    PayrollModule,
    DashboardModule,
    SettingsModule,
    AccountModule,
    BillingModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule { }
