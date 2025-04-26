"use client";

import { Card } from "@/components/ui/card";
import { JobType } from "../page";
import { IoBriefcaseOutline, IoLocationOutline } from "react-icons/io5";
import { useDraggable } from "@dnd-kit/core";

function Job({ job }: { job: JobType }) {
  const { setNodeRef, attributes, listeners, transform } = useDraggable({
    id: job.id,
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;
  return (
    <Card
      ref={setNodeRef}
      className="w-full p-4 bg-hrms-gray/10 flex flex-col gap-3"
      style={style}
      {...listeners}
      {...attributes}
    >
      <div className="flex gap-3 items-center">
        <div className="bg-hrms-gray/10 rounded-md p-2 ">
          <span>
            <IoBriefcaseOutline />
          </span>
        </div>
        <div>
          <h2 className="font-bold">{job.title}</h2>
          <p className="text-sm text-hrms-gray">{job.department}</p>
        </div>
      </div>
      <div className="flex gap-2">
        {job.tags.map((tag) => (
          <p
            key={tag}
            className="text-sm bg-primary rounded-md text-white px-4 py-2"
          >
            {tag}
          </p>
        ))}
      </div>
      <div className="flex gap-2 justify-between">
        <p className="font-thin flex gap-2 items-center">
          <span>
            <IoLocationOutline />
          </span>
          {job.location}
        </p>
        <p>
          $<span className="font-bold">{job.salary}</span>
          /Month
        </p>
      </div>
    </Card>
  );
}

export default Job;
