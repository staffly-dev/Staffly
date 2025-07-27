"use client";

import { Card } from "@/components/ui/card";
import { Job as JobType } from "@/context/JobContext";
import { IoBriefcaseOutline } from "react-icons/io5";
// import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { FaLink } from "react-icons/fa6";
import { toast } from "sonner";
import Link from "next/link";

function Job({ job }: { job: JobType }) {
  // const { setNodeRef, attributes, listeners, transform } = useDraggable({
  //   id: job.job_id,
  // });
  // const style = transform
  //   ? {
  //       transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  //     }
  //   : undefined;
  return (
    <Card
      // ref={setNodeRef}
      className="w-full p-4 bg-hrms-gray/10 flex flex-col gap-3"
      // style={style}
      // {...listeners}
      // {...attributes}
    >
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
        <Link
          href={`/apply/${job.job_id}`}
          className="text-sm bg-hrms-gray/10 rounded-md px-3 py-1 justify-center items-center flex"
        >
          Apply Page
        </Link>
      </div>
      <div className="flex gap-2 flex-wrap">
        {job.required_skills.map((skill: string) => (
          <p
            key={skill}
            className="text-sm bg-primary rounded-md text-white px-4 py-2 capitalize"
          >
            {skill}
          </p>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div
          onClick={() => {
            navigator.clipboard.writeText(job.shareable_link);
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
