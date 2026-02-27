import { Module } from '@nestjs/common';
import { StatisticsController, UserStatisticsController } from './statistics.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [StatisticsController, UserStatisticsController],
})
export class StatisticsModule {}
