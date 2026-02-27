import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QuizResultDocument = QuizResult & Document;

@Schema({ collection: 'quiz_results' })
export class QuizResult {
  @Prop({ required: true })
  quiz_session_id: string;

  @Prop()
  candidate_email?: string;

  @Prop()
  associated_cv_filename?: string;

  @Prop({ type: [Number], required: true })
  answers: number[];

  @Prop({ required: true })
  score: number;

  @Prop({ required: true })
  total_questions: number;

  @Prop({ required: true })
  percentage: number;

  @Prop({ required: true })
  status: string;

  @Prop()
  time_taken_seconds?: number;

  @Prop({ default: Date.now })
  submitted_at: Date;

  @Prop({ type: [Object] })
  question_analysis?: any[];

  @Prop()
  created_by?: string;
}

export const QuizResultSchema = SchemaFactory.createForClass(QuizResult);
QuizResultSchema.index({ score: -1 });
QuizResultSchema.index({ submitted_at: -1 });
