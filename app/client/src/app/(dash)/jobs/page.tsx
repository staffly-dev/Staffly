"use client";

import { Card } from "@/components/ui/card";
import Column from "./components/Column";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/searchInput";
import { CiCirclePlus } from "react-icons/ci";
import { AddJobModal } from "./components/AddJobModal";

const columns = [
  {
    id: "active",
    title: "Active Jobs",
  },
  {
    id: "in-active",
    title: "InActive Jobs",
  },
  {
    id: "completed",
    title: "Completed Jobs",
  },
];

export type JobType = {
  id: string;
  title: string;
  department: string;
  description: string;
  status: "active" | "in-active" | "completed";
  location: string;
  tags: string[];
  salary: number;
};

const initialJobs: JobType[] = [
  {
    id: "1",
    title: "Job 1",
    department: "HR",
    description: "Job 1 description",
    status: "active",
    location: "Sohag, Egypt",
    tags: ["Full Time", "Remote"],
    salary: 1000,
  },
  {
    id: "2",
    title: "Job 2",
    department: "HR",
    description: "Job 2 description",
    status: "in-active",
    location: "Assuit, Egypt",
    tags: ["HR", "Part Time", "Remote"],
    salary: 500,
  },
  {
    id: "3",
    title: "React Developer",
    department: "IT",
    description: "React Developer description",
    status: "completed",
    location: "Bahij, Egypt",
    tags: ["React", "Part Time", "Remote"],
    salary: 2000,
  },
  {
    id: "4",
    title: "Java Developer",
    department: "IT",
    description: "Java Developer description",
    status: "completed",
    location: "Bahij, Egypt",
    tags: ["Java", "Part Time", "Remote"],
    salary: 2000,
  },
];

export default function Page() {
  const [jobs, setJobs] = useState<JobType[]>(initialJobs);
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const jobId = active.id as string;
    const newStatus = over.id as JobType["status"];

    const job = jobs.find((job) => job.id === jobId);
    if (!job) return;

    setJobs(
      jobs.map((job) =>
        job.id === jobId ? { ...job, status: newStatus } : job
      )
    );
  }

  const handleAddJob = (data: {
    department: string;
    title: string;
    location: string;
    amount: number;
    type: "office" | "remote";
  }) => {
    const newJob: JobType = {
      id: (jobs.length + 1).toString(),
      title: data.title,
      department: data.department,
      description: `${data.title} description`,
      status: "active",
      location: data.location,
      tags: [data.type === "office" ? "Office" : "Remote"],
      salary: data.amount,
    };
    setJobs([...jobs, newJob]);
  };

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
      <div className="mt-4 flex gap-4">
        <DndContext onDragEnd={handleDragEnd}>
          {columns.map((column) => (
            <Column key={column.title} column={column} jobs={jobs} />
          ))}
        </DndContext>
      </div>
      <AddJobModal
        open={isAddJobOpen}
        onOpenChange={setIsAddJobOpen}
        onSubmit={handleAddJob}
      />
    </Card>
  );
}
