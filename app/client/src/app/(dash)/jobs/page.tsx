"use client";

import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/searchInput";
import { CiCirclePlus } from "react-icons/ci";
import { AddJobModal } from "./components/AddJobModal";
import { useJobs } from "@/hooks/useJobs";
import Job from "./components/Job";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";

export default function Page() {
  const { data: jobs = [], isLoading: loading, error } = useJobs();
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);

  if (error) {
    return <ErrorComponent error="Failed to load jobs" />;
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
