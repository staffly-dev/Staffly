import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Payroll {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: String, required: true })
  ctc: string;

  @Prop({ type: String, required: true })
  salaryByMonth: string;

  @Prop({ type: String, default: '' })
  deduction: string;

  @Prop({ enum: ['completed', 'pending'], default: 'pending' })
  status: string;
}

export type PayrollDocument = Payroll & Document;
export const PayrollSchema = SchemaFactory.createForClass(Payroll);
