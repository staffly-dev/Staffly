import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QuizSessionDocument = QuizSession & Document;

@Schema({ collection: 'quiz_sessions' })
export class QuizSession {
  @Prop({ required: true })
  job_description: string;

  @Prop({ required: true })
  job_description_hash: string;

  @Prop()
  associated_cv_filename?: string;

  @Prop()
  candidate_email?: string;

  @Prop()
  application_id?: string;

  @Prop({ type: [Object], required: true })
  questions: any[];

  @Prop({ required: true })
  total_questions: number;

  @Prop({ default: 300 })
  time_limit_seconds: number;

  @Prop({ default: 7 })
  pass_threshold: number;

  @Prop({ default: 'GENERATED' })
  status: string;

  @Prop()
  started_at?: Date;

  @Prop()
  completed_at?: Date;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop()
  created_by?: string;
}

export const QuizSessionSchema = SchemaFactory.createForClass(QuizSession);
QuizSessionSchema.index({ created_at: -1 });
