import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Employee {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: String, default: null })
  profilePicture: string | null;

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true, trim: true })
  mobileNumber: string;

  @Prop({ required: true, trim: true, lowercase: true })
  emailAddress: string;

  @Prop({ required: true })
  dateOfBrith: Date;

  @Prop({ required: true })
  maritalStatus: string;

  @Prop({ required: true })
  gender: string;

  @Prop({ required: true })
  nationality: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true })
  employeeType: string;

  @Prop({ required: true })
  department: string;

  @Prop({ required: true })
  designation: string;

  @Prop({ required: true })
  workingDays: string;

  @Prop({ required: true })
  joiningAt: Date;

  @Prop({ required: true })
  officeLocation: string;

  @Prop({ type: String, default: null })
  employeeCv: string | null;

  @Prop({ default: '' })
  linkdeinLink: string;

  @Prop({ default: '' })
  githubLink: string;

  @Prop({ default: '' })
  slackUserName: string;
}

export type EmployeeDocument = Employee & Document;
export const EmployeeSchema = SchemaFactory.createForClass(Employee);
