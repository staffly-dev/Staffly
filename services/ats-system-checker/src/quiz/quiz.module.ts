import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizController } from './quiz.controller';
import { EvaluationModule } from '../evaluation/evaluation.module';
import { QuizService } from './quiz.service';
import { QuizSession, QuizSessionSchema } from './schemas/quiz-session.schema';
import { QuizResult, QuizResultSchema } from './schemas/quiz-result.schema';
import {
  JobPosting,
  JobPostingSchema,
} from '../jobs/schemas/job-posting.schema';
import {
  Application,
  ApplicationSchema,
} from '../applications/schemas/application.schema';
import configuration from '../common/config/configuration';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: QuizSession.name, schema: QuizSessionSchema },
      { name: QuizResult.name, schema: QuizResultSchema },
      { name: JobPosting.name, schema: JobPostingSchema },
      { name: Application.name, schema: ApplicationSchema },
    ]),
    EvaluationModule,
    ClientsModule.registerAsync([
      {
        name: 'NATS_SERVICE',
        useFactory: () => ({
          transport: Transport.NATS,
          options: {
            servers: [configuration().NATS_URL || ''],
          },
        }),
      },
    ]),
  ],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule {}
