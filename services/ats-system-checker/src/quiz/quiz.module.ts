import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { DatabaseModule } from '../database/database.module';
import { EvaluationModule } from '../evaluation/evaluation.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [DatabaseModule, EvaluationModule, EmailModule],
  controllers: [QuizController],
})
export class QuizModule {}
