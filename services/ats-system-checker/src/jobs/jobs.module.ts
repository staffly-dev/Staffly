import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { DatabaseModule } from '../database/database.module';
import { EvaluationModule } from '../evaluation/evaluation.module';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [DatabaseModule, EvaluationModule, S3Module],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
