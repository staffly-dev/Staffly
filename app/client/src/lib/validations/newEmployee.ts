import { z } from "zod";

export const newEmployeeSchema = z.object({
  // Step 0: Personal Information
  photo: z.any().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  mobileNumber: z
    .string()
    .regex(/^\d{11}$/, "Must be a valid Mobile number (EG)"),
  email: z.string().email("Invalid email").min(1, "Email is required"),
  dateOfBirth: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Invalid date of birth"),
  maritalStatus: z.string().min(1, "Marital status is required"),
  gender: z.string().min(1, "Gender is required"),
  nationality: z.string().min(1, "Nationality is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),

  // Step 1: Professional Information
  employeeId: z.string().min(1, "Employee ID is required"),
  userName: z.string().min(1, "Username is required"),
  workEmail: z
    .string()
    .email("Invalid work email")
    .min(1, "Work email is required"),
  department: z.string().min(1, "Department is required"),
  status: z.string().min(1, "status is required"),
  joiningDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Invalid joining date"),
  officeLocation: z.string().min(1, "Office location is required"),
  designation: z.string().min(1, "Designation is required"),
  workingDays: z.string().min(1, "Working days are required"),
  employeeType: z.string().min(1, "Employee type is required"),

  // Step 2: Documents
  appointmentLetter: z.string().optional(),
  salarySlips: z.string().optional(),
  relivingLetter: z.string().optional(),
  experienceLetter: z.string().optional(),

  // Step 3: Account Access
  emailAddress: z.string().optional(),
  skypeId: z.string().optional(),
  githubId: z.string().optional(),
  slackId: z.string().optional(),
});

export type NewEmployeeFormData = z.infer<typeof newEmployeeSchema>;
