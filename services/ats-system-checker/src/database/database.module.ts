import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CVEvaluation,
  CVEvaluationSchema,
  QuizSession,
  QuizSessionSchema,
  QuizResult,
  QuizResultSchema,
  JobPosting,
  JobPostingSchema,
  Application,
  ApplicationSchema,
  SystemMetrics,
  SystemMetricsSchema,
  EmailNotification,
  EmailNotificationSchema,
} from '../schemas';
import { DatabaseService } from './database.service';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: CVEvaluation.name, schema: CVEvaluationSchema },
        { name: QuizSession.name, schema: QuizSessionSchema },
        { name: QuizResult.name, schema: QuizResultSchema },
        { name: JobPosting.name, schema: JobPostingSchema },
        { name: Application.name, schema: ApplicationSchema },
        { name: SystemMetrics.name, schema: SystemMetricsSchema },
        { name: EmailNotification.name, schema: EmailNotificationSchema },
      ],
    ),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
