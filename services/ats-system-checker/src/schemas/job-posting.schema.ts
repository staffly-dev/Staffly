import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type JobPostingDocument = JobPosting & Document;

@Schema({ collection: 'job_postings' })
export class JobPosting {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  required_skills: string[];

  @Prop()
  additional_details?: string;

  @Prop({ required: true, unique: true, sparse: true })
  job_id: string;

  @Prop({ required: true })
  description_hash: string;

  @Prop()
  owner_user_id?: string;

  @Prop()
  owner_username?: string;

  @Prop({ default: 70, min: 0, max: 100 })
  evaluation_threshold: number;

  @Prop({ default: true })
  quiz_required: boolean;

  @Prop({ default: 7, min: 0, max: 10 })
  quiz_pass_threshold: number;

  @Prop({ default: 25 })
  technical_skills_weight: number;

  @Prop({ default: 25 })
  experience_weight: number;

  @Prop({ default: 15 })
  education_weight: number;

  @Prop({ default: 15 })
  soft_skills_weight: number;

  @Prop({ default: 10 })
  career_growth_weight: number;

  @Prop({ default: 10 })
  achievements_weight: number;

  @Prop()
  hr_email?: string;

  @Prop()
  hr_name?: string;

  @Prop({ default: 0 })
  total_applications: number;

  @Prop({ default: 0 })
  total_accepted: number;

  @Prop({ default: 0 })
  total_rejected: number;

  @Prop({ default: 0 })
  total_quiz_passed: number;

  @Prop({ default: 0 })
  average_score: number;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop()
  updated_at?: Date;

  @Prop({ default: true })
  is_active: boolean;
}

export const JobPostingSchema = SchemaFactory.createForClass(JobPosting);
JobPostingSchema.index({ created_at: -1 });
