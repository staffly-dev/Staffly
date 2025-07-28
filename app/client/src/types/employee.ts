export interface Employee {
  _id?: string;
  profilePicture?: string | null;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  emailAddress: string;
  dateOfBrith: Date | string;
  maritalStatus: string;
  gender: string;
  nationality: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  employeeId: string;
  userName: string;
  employeeType: string;
  department: string;
  designation: string;
  workingDays: string;
  joiningAt: Date | string;
  officeLocation: string;
  employeeCv?: string | null;
  linkdeinLink?: string;
  githubLink?: string;
  slackUserName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CreateEmployeeData = Omit<
  Employee,
  "_id" | "createdAt" | "updatedAt"
>;

export type UpdateEmployeeData = Partial<
  Omit<Employee, "_id" | "createdAt" | "updatedAt">
>;

// Server response types (actual structure returned by the server)
export interface EmployeeResponse {
  message: string;
  employee: Employee;
}

export interface EmployeesResponse {
  message: string;
  employees: Employee[];
}

// Legacy types (keeping for backward compatibility if needed)
export interface EmployeeResponseLegacy {
  success: boolean;
  data: Employee;
  message?: string;
}

export interface EmployeesResponseLegacy {
  success: boolean;
  data: Employee[];
  message?: string;
}

export interface EmployeeError {
  success: false;
  message: string;
  error?: unknown;
}
