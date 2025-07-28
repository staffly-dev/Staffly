import { z } from "zod";

export const newEmployeeSchema = z.object({
  profilePicture: z.string().url("Invalid profile picture URL").optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  mobileNumber: z
    .string()
    .regex(/^\+\d{11,15}$/, "Must be a valid Mobile number with country code"),
  emailAddress: z
    .string()
    .email("Invalid email address")
    .min(1, "Email address is required"),
  dateOfBrith: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Invalid date of birth")
    .optional(),
  maritalStatus: z.string().min(1, "Marital status is required"),
  gender: z.string().min(1, "Gender is required"),
  nationality: z.string().min(1, "Nationality is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipcode: z.string().min(1, "Zipcode is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  userName: z.string().min(1, "Username is required"),
  employeeType: z.string().optional(),
  department: z.string().min(1, "Department is required"),
  designation: z.string().min(1, "Designation is required"),
  workingDays: z.string().min(1, "Working days are required"),
  joiningAt: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Invalid joining date"),
  officeLocation: z.string().optional(),
  employeeCv: z.string().url("Invalid CV URL").optional(),
  linkdeinLink: z.string().optional(),
  githubLink: z.string().optional(),
  slackUserName: z.string().optional(),
});

export type NewEmployeeFormData = z.infer<typeof newEmployeeSchema>;

// profilePicture	[...]
// firstName	[...]
// lastName	[...]
// mobileNumber	[...]
// emailAddress	[...]
// dateOfBrith	[...]
// maritalStatus	[...]
// gender	[...]
// nationality	[...]
// address	[...]
// city	[...]
// state	[...]
// zipcode	[...]
// employessId	[...]
// userName	[...]
// employeeType	[...]
// department	[...]
// designation	[...]
// workingDays	[...]
// joiningAt	[...]
// officeLocation	string
// example: New York HQ
// employeeCv	string
// nullable: true
// example: https://s3.amazonaws.com/bucket/cv.pdf
// slackId	string
// example: brooklyn_simmons
// linkdeinId	string
// example: brooklyn_simmons
// githubId	string
// example: brooklyn_simmons
