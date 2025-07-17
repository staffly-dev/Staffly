import mongoose, { Document, model, Schema } from 'mongoose';

export interface IAttendance extends Document {
  employeeId: mongoose.Types.ObjectId;
  date: Date;
  checkInTime?: Date;
  checkOutTime?: Date;
  status: "On Time" | "Late";
}

const attendanceSchema: Schema = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: Date, default: Date.now },
  checkInTime: { type: Date },
  checkOutTime: { type: Date },
  status: { type: String, enum: ["On Time", "Late"], default: 'On Time' }
});

const Attendance = model<IAttendance>('Attendance', attendanceSchema);
export default Attendance;