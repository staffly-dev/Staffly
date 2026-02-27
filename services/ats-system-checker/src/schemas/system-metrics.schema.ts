import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SystemMetricsDocument = SystemMetrics & Document;

@Schema({ collection: 'system_metrics' })
export class SystemMetrics {
  @Prop({ required: true, unique: true })
  date: string;

  @Prop({ default: 0 })
  evaluations_count: number;

  @Prop({ default: 0 })
  quizzes_generated: number;

  @Prop({ default: 0 })
  quizzes_completed: number;

  @Prop({ default: 0 })
  avg_evaluation_time_ms: number;

  @Prop({ default: 0 })
  avg_quiz_generation_time_ms: number;

  @Prop({ default: 0 })
  acceptance_rate: number;

  @Prop({ default: 0 })
  quiz_pass_rate: number;

  @Prop({ default: 0 })
  files_processed: number;

  @Prop({ default: 0 })
  pdf_files: number;

  @Prop({ default: 0 })
  docx_files: number;

  @Prop({ default: 0 })
  processing_errors: number;

  @Prop({ default: 0 })
  api_calls: number;

  @Prop({ default: 0 })
  api_errors: number;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop()
  updated_at?: Date;
}

export const SystemMetricsSchema = SchemaFactory.createForClass(SystemMetrics);
SystemMetricsSchema.index({ created_at: -1 });
