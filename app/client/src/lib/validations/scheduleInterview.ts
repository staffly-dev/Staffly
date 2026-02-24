import { z } from "zod";

export const scheduleInterviewSchema = z.object({
  interview_date: z.string().min(1, "Date is required"),
  interview_time: z.string().min(1, "Time is required"),
  interview_type: z.string().min(1, "Interview type is required"),
  location: z.string().min(1, "Location is required"),
  notes: z.string().optional(),
});

export type ScheduleInterviewFormData = z.infer<typeof scheduleInterviewSchema>;
