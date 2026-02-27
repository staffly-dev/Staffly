import { Module } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { EmailModule } from '../email/email.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [EmailModule, DatabaseModule],
  providers: [EvaluationService],
  exports: [EvaluationService],
})
export class EvaluationModule { }
