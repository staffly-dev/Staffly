import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  StatisticsController,
  UserStatisticsController,
} from './statistics.controller';
import { StatisticsService } from './statistics.service';
import {
  JobPosting,
  JobPostingSchema,
} from '../jobs/schemas/job-posting.schema';
import {
  Application,
  ApplicationSchema,
} from '../applications/schemas/application.schema';
import {
  CVEvaluation,
  CVEvaluationSchema,
} from '../evaluation/schemas/cv-evaluation.schema';
import {
  QuizSession,
  QuizSessionSchema,
} from '../quiz/schemas/quiz-session.schema';
import {
  QuizResult,
  QuizResultSchema,
} from '../quiz/schemas/quiz-result.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: JobPosting.name, schema: JobPostingSchema },
      { name: Application.name, schema: ApplicationSchema },
      { name: CVEvaluation.name, schema: CVEvaluationSchema },
      { name: QuizSession.name, schema: QuizSessionSchema },
      { name: QuizResult.name, schema: QuizResultSchema },
    ]),
  ],
  controllers: [StatisticsController, UserStatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
