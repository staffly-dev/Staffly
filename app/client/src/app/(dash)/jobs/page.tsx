"use client";

import { Card } from "@/components/ui/card";
// import Column from "./components/Column";
// import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/searchInput";
import { CiCirclePlus } from "react-icons/ci";
import { AddJobModal } from "./components/AddJobModal";
import { useJob } from "@/context/JobContext";
import Job from "./components/Job";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";

// const columns = [
//   {
//     id: "active",
//     title: "Active Jobs",
//   },
//   {
//     id: "inActive",
//     title: "InActive Jobs",
//   },
// ];

// export type JobType = {
//   job_id: string;
//   title: string;
//   hr_name?: string;
//   description: string;
//   required_skills: string[];
//   hr_email?: string;
//   additional_details?: string;
//   evaluation_threshold?: number;
//   quiz_required?: boolean;
//   quiz_pass_threshold?: number;
//   is_active?: boolean;
// };

export default function Page() {
  const { jobs, loading, error, getAllJobs, clearError } = useJob();
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);

  useEffect(() => {
    if (jobs.length === 0) {
      getAllJobs();
    }
  }, [getAllJobs, jobs.length]);

  // function handleDragEnd(event: DragEndEvent) {
  //   const { active, over } = event;
  //   if (!over) return;

  //   const jobId = active.id as string;
  //   const newStatus = over.id === "active" ? true : false;

  //   const job = jobs.find((job) => job.job_id === jobId);
  //   if (!job) return;

  //   setJobs(
  //     jobs.map((job) =>
  //       job.job_id === jobId ? { ...job, is_active: newStatus } : job
  //     )
  //   );
  // }

  if (error) {
    return <ErrorComponent error={error} clearError={clearError} />;
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between">
        <SearchInput placeholder="Search for a job" />
        <Button onClick={() => setIsAddJobOpen(true)}>
          <span>
            <CiCirclePlus />
          </span>
          Add New Job
        </Button>
      </div>
      {/* {loading ? (
        <p className="text-center text-2xl">Loading...</p>
      ) : (
        <div className="mt-4 flex gap-4">
          <DndContext onDragEnd={handleDragEnd}>
            {columns.map((column) => (
              <Column key={column.title} column={column} jobs={jobs} />
            ))}
          </DndContext>
        </div>
      )} */}
      {loading ? (
        <LoadingComponent />
      ) : (
        <Card className="p-4 m-4 flex flex-col gap-4">
          <h2 className="text-2xl font-bold">All Jobs</h2>
          <div className="grid xl:grid-cols-3 grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <Job key={job.job_id} job={job} />
            ))}
          </div>
        </Card>
      )}
      <AddJobModal open={isAddJobOpen} onOpenChange={setIsAddJobOpen} />
    </Card>
  );
}
