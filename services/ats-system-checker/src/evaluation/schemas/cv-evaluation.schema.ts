import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CVEvaluationDocument = CVEvaluation & Document;

@Schema({ collection: 'cv_evaluations', timestamps: true })
export class CVEvaluation {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  job_description_hash: string;

  @Prop({ required: true })
  job_description: string;

  @Prop({
    required: true,
    enum: ['ACCEPT', 'REJECT', 'REVIEW', 'ACCEPTED', 'REJECTED', 'UNKNOWN'],
  })
  decision: string;

  @Prop({ required: true, min: 0, max: 100 })
  score: number;

  @Prop({ required: true })
  evaluation_text: string;

  @Prop({ required: true })
  cv_text_length: number;

  @Prop()
  email?: string;

  @Prop()
  application_id?: string;

  @Prop({ min: 0, max: 25 })
  technical_skills_score?: number;

  @Prop({ min: 0, max: 25 })
  experience_score?: number;

  @Prop({ min: 0, max: 15 })
  education_score?: number;

  @Prop({ min: 0, max: 15 })
  soft_skills_score?: number;

  @Prop({ min: 0, max: 10 })
  career_growth_score?: number;

  @Prop({ min: 0, max: 10 })
  achievements_score?: number;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop()
  updated_at?: Date;

  @Prop()
  processing_time_ms?: number;

  @Prop()
  created_by?: string;
}

export const CVEvaluationSchema = SchemaFactory.createForClass(CVEvaluation);
CVEvaluationSchema.index({ decision: 1 });
CVEvaluationSchema.index({ score: -1 });
CVEvaluationSchema.index({ created_at: -1 });
