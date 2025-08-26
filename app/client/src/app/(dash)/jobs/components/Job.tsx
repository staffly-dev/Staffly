"use client";

import { Card } from "@/components/ui/card";
import { Job as JobType, useDeleteJob } from "@/hooks/useJobs";
import { IoBriefcaseOutline } from "react-icons/io5";
import { cn } from "@/lib/utils";
import { FaLink, FaSpinner, FaTrash } from "react-icons/fa6";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useState } from "react";

function Job({ job }: { job: JobType }) {
  const { mutate: deleteJob, isPending: deleteLoading } = useDeleteJob();
  const [id, setId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setId(id);
    toast.warning("Are you sure you want to delete this job?", {
      action: {
        label: "Delete",
        onClick: () => {
          deleteJob(id, {
            onSuccess: () => {
              toast.success("Job deleted successfully", {
                position: "top-center",
              });
            },
            onError: (error) => {
              toast.error("Failed to delete job", {
                position: "top-center",
              });
              console.log("Delete error:", error);
            },
          });
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
      position: "top-center",
    });
  };

  const shareLink = `${process.env.NEXT_PUBLIC_APP_URL}/apply/${job.job_id}`;

  return (
    <Card className="w-full p-4 bg-hrms-gray/10 flex flex-col gap-3">
      <div className="flex justify-between">
        <div className="flex gap-3 items-center">
          <div className="bg-hrms-gray/10 rounded-md p-2 ">
            <span>
              <IoBriefcaseOutline />
            </span>
          </div>
          <div>
            <h2 className="font-bold">{job.title}</h2>
            <p className="text-sm text-hrms-gray flex gap-1 items-center">
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  job.is_active ? "bg-green-500" : "bg-red-500"
                )}
              ></span>
              {job.is_active ? "Active" : "Inactive"}
            </p>
          </div>
        </div>
        <Button
          onClick={() => handleDelete(job.job_id)}
          disabled={deleteLoading && id === job.job_id}
          className="text-sm bg-red-500 hover:bg-red-700 rounded-md px-3 py-1 justify-center items-center flex"
        >
          {deleteLoading && id === job.job_id ? (
            <FaSpinner className="w-4 h-4 animate-spin" />
          ) : (
            <div className="flex items-center gap-2">
              <FaTrash />
              Delete
            </div>
          )}
        </Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {job.required_skills.map((skill: string, index: number) => (
          <p
            key={index}
            className="text-sm bg-primary rounded-md text-white px-4 py-2 capitalize"
          >
            {skill}
          </p>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div
          onClick={() => {
            navigator.clipboard.writeText(shareLink);
            toast.success("Share link copied to clipboard");
          }}
          className="flex gap-1 items-center text-sm bg-hrms-gray/10 rounded-md px-3 py-2 cursor-pointer w-fit"
        >
          <span>
            <FaLink />
          </span>
          Copy Share Link
        </div>
        <p className="text-xs text-hrms-gray">
          {new Date(job.created_at).toLocaleDateString()}
        </p>
      </div>
    </Card>
  );
}

export default Job;
