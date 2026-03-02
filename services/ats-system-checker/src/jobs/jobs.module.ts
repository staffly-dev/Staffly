import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { EvaluationModule } from '../evaluation/evaluation.module';
import { S3Module } from '../common/s3/s3.module';
import { JobPosting, JobPostingSchema } from './schemas/job-posting.schema';
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
import configuration from '../common/config/configuration';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: JobPosting.name, schema: JobPostingSchema },
      { name: Application.name, schema: ApplicationSchema },
      { name: CVEvaluation.name, schema: CVEvaluationSchema },
      { name: QuizSession.name, schema: QuizSessionSchema },
    ]),
    EvaluationModule,
    S3Module,
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
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
