import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { JobApplicationData, useJob } from "@/context/JobContext";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const applySchema = z.object({
  candidate_name: z.string().min(1, "Name is required"),
  cv_file: z
    .any()
    .refine((files) => files?.length > 0, "CV file is required")
    .refine(
      (files) => files?.[0]?.size <= 5000000,
      "File size should be less than 5MB"
    ),
  candidate_email: z.string().email("Invalid email address"),
});

type AddJobFormData = z.infer<typeof applySchema>;

interface ApplyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  title: string;
  setApplied: (applied: boolean) => void;
}

export function ApplyForm({
  open,
  onOpenChange,
  jobId,
  title,
  setApplied,
}: ApplyFormProps) {
  const { applyForJob, error } = useJob();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AddJobFormData>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      candidate_name: "",
      candidate_email: "",
      cv_file: null,
    },
  });

  const onFormSubmit = async (formData: AddJobFormData) => {
    try {
      const applicationData = new FormData();
      applicationData.append("candidate_name", formData.candidate_name);
      applicationData.append("candidate_email", formData.candidate_email);

      if (formData.cv_file && formData.cv_file.length > 0) {
        applicationData.append("cv_file", formData.cv_file[0]);
      }
      applicationData.append("job_id", jobId);

      await applyForJob(
        jobId,
        applicationData as unknown as JobApplicationData
      );
      setApplied(true);
      toast.success("Application submitted successfully", {
        description:
          "You will receive an email with the next steps in your application",
        position: "top-center",
        duration: 4000,
      });
      onOpenChange(false);
      reset();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error("Application submission failed", {
        description: error?.message || "An error occurred",
        position: "top-center",
        duration: 4000,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="apply-form">
        <DialogHeader>
          <DialogTitle>Apply for {title}</DialogTitle>
          <DialogDescription>
            Please fill in the following details to apply for the job
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <form onSubmit={handleSubmit(onFormSubmit)} className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="candidate_name">Name</Label>
            <Input
              id="candidate_name"
              placeholder="Enter Your Name"
              {...register("candidate_name")}
            />
            {errors.candidate_name && (
              <span className="text-red-500 text-xs">
                {errors.candidate_name.message}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="candidate_email">Email</Label>
            <Input
              id="candidate_email"
              type="email"
              placeholder="Enter Your Email"
              {...register("candidate_email")}
            />
            {errors.candidate_email && (
              <span className="text-red-500 text-xs">
                {errors.candidate_email.message}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cv_file">CV</Label>
            <Input
              type="file"
              id="cv_file"
              accept=".pdf,.doc,.docx"
              {...register("cv_file")}
            />
            {errors.cv_file && (
              <span className="text-red-500 text-xs">
                {errors.cv_file.message as string}
              </span>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Applying..." : "Apply"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
