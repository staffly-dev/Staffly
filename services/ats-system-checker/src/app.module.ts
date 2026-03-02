import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JobsModule } from './jobs/jobs.module';
import { ApplicationsModule } from './applications/applications.module';
import { QuizModule } from './quiz/quiz.module';
import { StatisticsModule } from './statistics/statistics.module';
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
    JobsModule,
    ApplicationsModule,
    QuizModule,
    StatisticsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
