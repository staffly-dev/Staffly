import { Module } from '@nestjs/common';
import { ApplicationsController } from './applications.controller';
import { DatabaseModule } from '../database/database.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [DatabaseModule, EmailModule],
  controllers: [ApplicationsController],
})
export class ApplicationsModule {}
