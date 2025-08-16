import mongoose, { Document, Schema } from "mongoose";

export interface EmployeeDocument extends Document {
  createdBy: mongoose.Schema.Types.ObjectId;
  profilePicture: string | null;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  emailAddress: string;
  dateOfBrith: Date;
  maritalStatus: string;
  gender: string;
  nationality: string;
  address: string;
  city: string;
  state: string;
  userName: string;
  employeeType: string;
  department: string;
  designation: string;
  workingDays: string;
  joiningAt: Date;
  officeLocation: string;
  employeeCv: string | null;
  linkdeinLink: string;
  githubLink: string;
  slackUserName: string;
  createdAt: Date;
  updatedAt: Date;
}

const employeeSchema = new Schema<EmployeeDocument>({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  profilePicture: {
    type: String,
    default: null
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  mobileNumber: {
    type: String,
    required: true,
    trim: true
  },
  emailAddress: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  dateOfBrith: {
    type: Date,
    required: true
  },
  maritalStatus: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  nationality: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  employeeType: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  workingDays: {
    type: String,
    required: true
  },
  joiningAt: {
    type: Date,
    required: true
  },
  officeLocation: {
    type: String,
    required: true
  },
  employeeCv: {
    type: String,
    default: null
  },
  linkdeinLink: {
    type: String,
    default: ""
  },
  githubLink: {
    type: String,
    default: ""
  },
  slackUserName: {
    type: String,
    default: ""
  },
}, { timestamps: true });

const EmployeeModel = mongoose.model<EmployeeDocument>("Employee", employeeSchema);

export default EmployeeModel; 