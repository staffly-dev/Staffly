"use client";
import { CustomTableContainer } from "./CustomTableContainer";
import UnderDevelopment from "@/components/global/UnderDevelopment";

type Project = {
  id: string;
  name: string;
  status: string;
  startDate: string;
  finishDate: string;
};

const mazinProjects: Project[] = [
  {
    id: "1",
    name: "Project 1",
    status: "active",
    startDate: "2021-01-01",
    finishDate: "2021-01-05",
  },
  {
    id: "2",
    name: "Project 2",
    status: "completed",
    startDate: "2021-01-06",
    finishDate: "2021-01-10",
  },
  {
    id: "3",
    name: "Project 3",
    status: "pending",
    startDate: "2021-01-11",
    finishDate: "2021-01-15",
  },
  {
    id: "4",
    name: "Project 4",
    status: "late",
    startDate: "2021-01-16",
    finishDate: "2021-01-20",
  },
  {
    id: "5",
    name: "Project 5",
    status: "cancelled",
    startDate: "2021-01-21",
    finishDate: "2021-01-25",
  },
  {
    id: "6",
    name: "Project 6",
    status: "late",
    startDate: "2021-01-26",
    finishDate: "2021-01-30",
  },
  {
    id: "7",
    name: "Project 7",
    status: "cancelled",
    startDate: "2021-01-31",
    finishDate: "2021-02-05",
  },
];

const projectStatusColors: Record<string, string> = {
  active: "bg-green-500/20 text-green-500",
  completed: "bg-blue-500/20 text-blue-500",
  pending: "bg-yellow-500/20 text-yellow-500",
  late: "bg-red-500/20 text-red-500",
  cancelled: "bg-red-500/20 text-red-500",
};

export function Projects() {
  return (
    <div className="relative">
      <CustomTableContainer>
        <thead className="sticky top-0 bg-background shadow-sm">
          <tr className="*:px-6 *:py-4 *:text-left *:text-xs *:font-medium *:text-gray-500 *:uppercase border-b border-hrms-gray/20">
            <th>Sr.No</th>
            <th>Project Name</th>
            <th>Start Date</th>
            <th>Finish Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hrms-gray/20">
          {mazinProjects.map((project) => (
            <tr
              key={project.id}
              className="hover:bg-hrms-gray/20 *:px-6 *:py-3"
            >
              <td>{project.id}</td>
              <td>{project.name}</td>
              <td>{project.startDate}</td>
              <td>{project.finishDate}</td>
              <td>
                <span
                  className={`capitalize rounded-md px-2 py-1 ${
                    projectStatusColors[project.status]
                  }`}
                >
                  {project.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </CustomTableContainer>
      <UnderDevelopment />
    </div>
  );
}
