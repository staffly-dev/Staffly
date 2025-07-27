"use client";
import { Job, useJob } from "@/context/JobContext";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ApplyForm } from "./ApplyForm";
import { Button } from "@/components/ui/button";

const ApplyPage = () => {
  const { id } = useParams();
  const { getJobById, error, loading, clearError } = useJob();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [open, setOpen] = useState(false);
  const [applied, setApplied] = useState(false);
  useEffect(() => {
    const getJob = async () => {
      const jobData = await getJobById(id as string);
      setJob(jobData);
    };
    getJob();
  }, [getJobById, id]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-red-500 text-lg font-bold">Error: {error}</div>
        <Button variant="outline" onClick={() => clearError()}>
          Clear Error
        </Button>
      </div>
    );
  }
  if (loading || !job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 dark:border-white border-gray-900 "></div>
      </div>
    );
  }
  if (applied) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-green-500 text-lg font-bold">
          You have already applied for this job.
        </p>
        <Button variant="outline" onClick={() => router.push("/")}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2 justify-between capitalize">
            {job.title}
            <div className="flex items-center gap-2 text-sm">
              <span
                className={`w-2 h-2 rounded-full inline-block ml-2 ${
                  job.is_active ? "bg-green-500" : "bg-red-500"
                }`}
              ></span>
              <p className="capitalize">
                {job.is_active ? "Still Open" : "Closed"}
              </p>
            </div>
          </CardTitle>
          <CardDescription>
            Posted on {new Date(job.created_at).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Description</h3>
            <p className="text-muted-foreground">{job.description}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Required Skills</h3>
            <div className="flex gap-2 flex-wrap">
              {job.required_skills.map((skill) => (
                <span
                  key={skill}
                  className="text-xs bg-primary text-white rounded-md px-3 py-1 capitalize"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="default" size="lg" onClick={() => setOpen(true)}>
            Apply Now
          </Button>
          <ApplyForm
            open={open}
            onOpenChange={setOpen}
            jobId={id as string}
            title={job.title}
            setApplied={setApplied}
          />
        </CardFooter>
      </Card>
    </div>
  );
};

export default ApplyPage;
