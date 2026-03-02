import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { Application, ApplicationSchema } from './schemas/application.schema';
import {
  JobPosting,
  JobPostingSchema,
} from '../jobs/schemas/job-posting.schema';
import {
  QuizResult,
  QuizResultSchema,
} from '../quiz/schemas/quiz-result.schema';
import configuration from '../common/config/configuration';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Application.name, schema: ApplicationSchema },
      { name: JobPosting.name, schema: JobPostingSchema },
      { name: QuizResult.name, schema: QuizResultSchema },
    ]),
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
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
