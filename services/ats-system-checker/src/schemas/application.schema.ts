import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ApplicationDocument = Application & Document;

@Schema({ collection: 'applications' })
export class Application {
  @Prop({ required: true, unique: true, sparse: true })
  application_id: string;

  @Prop({ required: true })
  job_id: string;

  @Prop()
  candidate_email?: string;

  @Prop()
  candidate_name?: string;

  @Prop({ required: true })
  cv_filename: string;

  @Prop({ min: 0, max: 100 })
  cv_score?: number;

  @Prop()
  decision?: string;

  @Prop({ min: 0, max: 100 })
  quiz_score?: number;

  @Prop({ default: 'SUBMITTED' })
  status: string;

  @Prop({ default: Date.now })
  submitted_at?: Date;

  @Prop()
  interview_date?: string;

  @Prop()
  interview_time?: string;

  @Prop()
  interview_type?: string;

  @Prop()
  interview_location?: string;

  @Prop()
  interview_notes?: string;

  @Prop()
  interview_scheduled_at?: Date;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
ApplicationSchema.index({ submitted_at: -1 });
ApplicationSchema.index({ cv_score: -1 });
