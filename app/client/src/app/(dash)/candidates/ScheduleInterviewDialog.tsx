"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  scheduleInterviewSchema,
  type ScheduleInterviewFormData,
} from "@/lib/validations/scheduleInterview";
import { useScheduleInterview, type Candidate } from "@/hooks/useJobs";
import { toast } from "sonner";

interface ScheduleInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate | null;
}

const INTERVIEW_TYPES = [
  { value: "video", label: "Video" },
  { value: "phone", label: "Phone" },
  { value: "onsite", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
];

export function ScheduleInterviewDialog({
  open,
  onOpenChange,
  candidate,
}: ScheduleInterviewDialogProps) {
  const { mutate: scheduleInterview, isPending } = useScheduleInterview();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ScheduleInterviewFormData>({
    resolver: zodResolver(scheduleInterviewSchema),
    defaultValues: {
      interview_date: "",
      interview_time: "",
      interview_type: "video",
      location: "",
      notes: "",
    },
  });

  const interviewType = watch("interview_type");

  const onSubmit = (data: ScheduleInterviewFormData) => {
    if (!candidate) return;
    scheduleInterview(
      {
        applicationId: candidate.application_id,
        data: {
          interview_date: data.interview_date,
          interview_time: data.interview_time,
          interview_type: data.interview_type,
          location: data.location,
          notes: data.notes ?? "",
        },
      },
      {
        onSuccess: () => {
          toast.success("Interview scheduled successfully");
          reset();
          onOpenChange(false);
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || (err as Error)?.message || "Failed to schedule interview";
          toast.error(msg);
        },
      }
    );
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Schedule Interview
            {candidate && (
              <span className="block text-sm font-normal text-muted-foreground mt-1">
                {candidate.candidate_name}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="interview_date">Date</Label>
              <Input
                id="interview_date"
                type="date"
                {...register("interview_date")}
              />
              {errors.interview_date && (
                <p className="text-sm text-red-500 mt-0.5">
                  {errors.interview_date.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="interview_time">Time</Label>
              <Input
                id="interview_time"
                type="time"
                {...register("interview_time")}
              />
              {errors.interview_time && (
                <p className="text-sm text-red-500 mt-0.5">
                  {errors.interview_time.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="interview_type">Interview Type</Label>
            <Select
              value={interviewType}
              onValueChange={(v) => setValue("interview_type", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {INTERVIEW_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.interview_type && (
              <p className="text-sm text-red-500 mt-0.5">
                {errors.interview_type.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g. Zoom Meeting Room"
              {...register("location")}
            />
            {errors.location && (
              <p className="text-sm text-red-500 mt-0.5">
                {errors.location.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="e.g. Technical interview with senior engineer"
              rows={3}
              {...register("notes")}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Scheduling..." : "Schedule Interview"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
