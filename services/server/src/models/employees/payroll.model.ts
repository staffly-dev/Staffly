import { model, Schema, Types  , Document } from "mongoose";


export interface IPayroll extends Document {
    employeeId: Types.ObjectId;
    ctc: string;
    salaryByMonth: string;
    deduction: string;
    status: 'completed' | 'pending';
}


const payrollSchema = new Schema<IPayroll>({
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee' , required: true},
    ctc: { type: String, required: true },
    salaryByMonth: { type: String, required: true },
    deduction: { type: String },
    status: { type: String, enum: ['completed', 'pending'], default: 'pending' },
});

export default model<IPayroll>('Payroll', payrollSchema);