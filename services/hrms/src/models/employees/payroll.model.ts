import mongoose, { model, Schema, Types, Document } from "mongoose";

export interface IPayroll extends Document {
  createdBy: mongoose.Schema.Types.ObjectId;
  employeeId: Types.ObjectId;
  ctc: string;
  salaryByMonth: string;
  deduction: string;
  status: 'completed' | 'pending';
}

const payrollSchema = new Schema<IPayroll>({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  ctc: { type: String, required: true },
  salaryByMonth: { type: String, required: true },
  deduction: { type: String },
  status: { type: String, enum: ['completed', 'pending'], default: 'pending' },
});

export default model<IPayroll>('Payroll', payrollSchema);