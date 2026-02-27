import { Module } from '@nestjs/common';
import { DebugController, HealthTestController } from './debug.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [DebugController, HealthTestController],
})
export class DebugModule {}
