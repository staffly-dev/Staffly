import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmailNotificationDocument = EmailNotification & Document;

@Schema({ collection: 'email_notifications' })
export class EmailNotification {
  @Prop({ required: true })
  recipient_email: string;

  @Prop({ required: true })
  notification_type: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  body: string;

  @Prop()
  cv_evaluation_id?: string;

  @Prop()
  quiz_result_id?: string;

  @Prop({ default: 'PENDING' })
  status: string;

  @Prop()
  sent_at?: Date;

  @Prop()
  error_message?: string;

  @Prop({ default: 0 })
  retry_count: number;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const EmailNotificationSchema = SchemaFactory.createForClass(EmailNotification);
EmailNotificationSchema.index({ recipient_email: 1 });
EmailNotificationSchema.index({ created_at: -1 });
