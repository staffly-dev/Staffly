import { z } from "zod";

export const employeeBaseSchema = {
  profilePicture: z.string().url().nullable().optional(),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  mobileNumber: z.string().min(7).max(20),
  emailAddress: z.string().email().toLowerCase().trim(),
  dateOfBrith: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  maritalStatus: z.string().min(2).max(20),
  gender: z.string().min(1).max(20),
  nationality: z.string().min(2).max(50),
  address: z.string().min(2).max(100),
  city: z.string().min(2).max(50),
  state: z.string().min(2).max(50),
  zipcode: z.string().min(2).max(20),
  employessId: z.string().min(2).max(30),
  userName: z.string().min(2).max(30),
  employeeType: z.string().min(2).max(30),
  department: z.string().min(2).max(50),
  designation: z.string().min(2).max(50),
  workingDays: z.string().min(2).max(50),
  joiningAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  officeLocation: z.string().min(2).max(100),
  employeeCv: z.string().url().nullable().optional(),
  slackId: z.string().max(50).optional(),
  linkdeinId: z.string().max(50).optional(),
  githubId: z.string().max(50).optional(),
};

export const addEmployeeSchema = z.object({
  ...employeeBaseSchema,
});

export const updateEmployeeSchema = z.object({
  ...employeeBaseSchema,
}); 