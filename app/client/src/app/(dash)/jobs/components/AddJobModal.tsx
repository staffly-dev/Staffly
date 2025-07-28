import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useJob, CreateJobData } from "@/context/JobContext";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const addJobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  required_skills: z.string().min(1, "Required skills are required"),
  hr_email: z.string().optional(),
  additional_details: z.string().optional(),
  hr_name: z.string().optional(),
  evaluation_threshold: z
    .number()
    .min(70, "Evaluation threshold must be greater than 70")
    .optional(),
  quiz_required: z.boolean().default(false).optional(),
  quiz_pass_threshold: z
    .number()
    .min(7, "Quiz pass threshold must be greater than 7")
    .optional(),
  is_active: z.boolean().default(true).optional(),
});

type AddJobFormData = z.infer<typeof addJobSchema>;

interface AddJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddJobModal({ open, onOpenChange }: AddJobModalProps) {
  const { createJob, error } = useJob();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AddJobFormData>({
    resolver: zodResolver(addJobSchema),
    defaultValues: {
      evaluation_threshold: 70,
      quiz_required: false,
      quiz_pass_threshold: 7,
      is_active: true,
    },
  });

  const onFormSubmit = async (data: AddJobFormData) => {
    try {
      const jobData = new FormData();
      jobData.append("description", data.description);
      jobData.append("title", data.title);
      jobData.append("required_skills", data.required_skills);
      jobData.append("hr_email", data.hr_email);
      jobData.append("additional_details", data.additional_details);
      jobData.append("hr_name", data.hr_name);
      jobData.append(
        "evaluation_threshold",
        data.evaluation_threshold.toString()
      );
      jobData.append("quiz_required", data.quiz_required.toString());
      jobData.append(
        "quiz_pass_threshold",
        data.quiz_pass_threshold.toString()
      );
      jobData.append("is_active", data.is_active.toString());
      const newJob = await createJob(jobData as unknown as CreateJobData);
      console.log("newJob", newJob);
      onOpenChange(false);
      reset();
    } catch {
      // error handling is done in context
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Job</DialogTitle>
        </DialogHeader>
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <form onSubmit={handleSubmit(onFormSubmit)} className="grid gap-4 py-4">
          <Input
            id="title"
            placeholder="Enter Job Title"
            {...register("title")}
          />
          {errors.title && (
            <span className="text-red-500 text-xs">{errors.title.message}</span>
          )}

          <Textarea
            id="description"
            placeholder="Enter Job Description"
            {...register("description")}
          />
          {errors.description && (
            <span className="text-red-500 text-xs">
              {errors.description.message}
            </span>
          )}

          <Input
            id="required_skills"
            placeholder="Enter Required Skills (comma separated)"
            {...register("required_skills")}
          />
          {errors.required_skills && (
            <span className="text-red-500 text-xs">
              {errors.required_skills.message}
            </span>
          )}

          <Input
            id="hr_email"
            placeholder="Enter HR Email"
            {...register("hr_email")}
          />
          {errors.hr_email && (
            <span className="text-red-500 text-xs">
              {errors.hr_email.message}
            </span>
          )}

          <Input
            id="additional_details"
            placeholder="Enter Additional Details"
            {...register("additional_details")}
          />
          {errors.additional_details && (
            <span className="text-red-500 text-xs">
              {errors.additional_details.message}
            </span>
          )}
          <Input
            id="hr_name"
            placeholder="Enter HR Name"
            {...register("hr_name")}
          />
          {errors.hr_name && (
            <span className="text-red-500 text-xs">
              {errors.hr_name.message}
            </span>
          )}

          <div className="flex gap-2">
            <div className="space-y-2 flex-1">
              <Label htmlFor="quiz_pass_threshold">
                Quiz Pass Threshold (7-10)
              </Label>
              <Input
                type="number"
                min={7}
                max={10}
                id="quiz_pass_threshold"
                placeholder="Quiz Pass Threshold (7-10)"
                {...register("quiz_pass_threshold", {
                  valueAsNumber: true,
                })}
              />
              {errors.quiz_pass_threshold && (
                <span className="text-red-500 text-xs">
                  {errors.quiz_pass_threshold.message}
                </span>
              )}
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="evaluation_threshold">
                Evaluation Threshold (70-100)
              </Label>
              <Input
                type="number"
                min={70}
                max={100}
                id="evaluation_threshold"
                placeholder="Evaluation Threshold (70-100)"
                {...register("evaluation_threshold", {
                  valueAsNumber: true,
                })}
              />
              {errors.evaluation_threshold && (
                <span className="text-red-500 text-xs">
                  {errors.evaluation_threshold.message}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="quiz_required"
                {...register("quiz_required")}
              />
              <Label htmlFor="quiz_required">Quiz Required</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="checkbox"
                id="is_active"
                {...register("is_active")}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
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
              Add
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
