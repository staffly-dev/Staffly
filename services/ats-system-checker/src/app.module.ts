import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from './database/database.module';
import { EmailModule } from './email/email.module';
import { EvaluationModule } from './evaluation/evaluation.module';
import { S3Module } from './common/s3/s3.module';
import { JobsModule } from './jobs/jobs.module';
import { ApplicationsModule } from './applications/applications.module';
import { QuizModule } from './quiz/quiz.module';
import { StatisticsModule } from './statistics/statistics.module';
import { DebugModule } from './common/debug/debug.module';
import { AppController } from './app.controller';
import configuration from './common/config/configuration';
import { ConfigService } from '@nestjs/config';
import { getMongoConfig } from './common/config/mongo.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
    }),
    // MongooseModule.forRoot(configuration().MONGO_URI_LOCAL!),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getMongoConfig,
    }),
    // ATS System Checker Models
    DatabaseModule,
    EmailModule,
    EvaluationModule,
    S3Module,
    JobsModule,
    ApplicationsModule,
    QuizModule,
    StatisticsModule,
    DebugModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
