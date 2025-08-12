import { z } from "zod";

export const newPayrollSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  salaryByMonth: z.number().min(1, "Salary per month is required"),
  deduction: z.number().optional(),
  ctc: z.number().min(1, "CTC is required"),
});

export type NewPayrollFormData = z.infer<typeof newPayrollSchema>;
