"use client";

import { Card } from "@/components/ui/card";
import Job from "./Job";
import { JobType } from "../page";
import { useDroppable } from "@dnd-kit/core";

const colors = {
  active: "bg-green-500",
  "in-active": "bg-yellow-500",
  completed: "bg-red-500",
};

function Column({
  column,
  jobs,
}: {
  column: { title: string; id: string };
  jobs: JobType[];
}) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });
  return (
    <Card ref={setNodeRef} className="w-full p-4 flex flex-col gap-3">
      <h1 className="font-bold flex gap-2 items-center text-lg">
        <span
          className={`rounded-full w-2 h-2 ${
            colors[column.id as keyof typeof colors]
          }`}
        ></span>
        {column.title}
      </h1>
      {jobs.map((job) => {
        if (job.status === column.id) {
          return <Job key={job.id} job={job} />;
        }
      })}
    </Card>
  );
}

export default Column;
