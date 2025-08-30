"use client";
import UnderDevelopment from "@/components/global/UnderDevelopment";
import { CustomTableContainer } from "./CustomTableContainer";

type Leave = {
  id: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  reportingManager: string;
  days: number;
  duration: string;
};

const mazinLeaves: Leave[] = [
  {
    id: "1",
    date: "2021-01-01",
    status: "pending",
    reportingManager: "Mazin Emad",
    days: 3,
    duration: "July 05 - July 08",
  },
  {
    id: "2",
    date: "2021-01-09",
    status: "approved",
    reportingManager: "Mazin Emad",
    days: 1,
    duration: "July 05 - July 06",
  },
  {
    id: "3",
    date: "2021-01-10",
    status: "rejected",
    reportingManager: "Mazin Emad",
    days: 1,
    duration: "July 05 - July 06",
  },
  {
    id: "4",
    date: "2021-01-09",
    status: "approved",
    reportingManager: "Mazin Emad",
    days: 1,
    duration: "July 05 - July 06",
  },
  {
    id: "5",
    date: "2021-01-10",
    status: "rejected",
    reportingManager: "Mazin Emad",
    days: 1,
    duration: "July 05 - July 06",
  },
];

const leaveStatusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-500",
  approved: "bg-green-500/20 text-green-500",
  rejected: "bg-red-500/20 text-red-500",
};

export function Leave() {
  return (
    <div className="relative">
      <UnderDevelopment />
      <CustomTableContainer>
        <thead className="sticky top-0 bg-background shadow-sm">
          <tr className="*:px-6 *:py-4 *:text-left *:text-xs *:font-medium *:text-gray-500 *:uppercase border-b border-hrms-gray/20">
            <th>Date</th>
            <th>Status</th>
            <th>Reporting Manager</th>
            <th>Days</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hrms-gray/20">
          {mazinLeaves.map((leave) => (
            <tr
              key={leave.id}
              className="hover:bg-hrms-gray/20 *:px-6 *:py-3 *:capitalize"
            >
              <td>{leave.date}</td>
              <td>{leave.duration}</td>
              <td>{leave.days} days</td>
              <td>{leave.reportingManager}</td>
              <td>
                <span
                  className={`rounded-md px-2 py-1 ${
                    leaveStatusColors[leave.status]
                  }`}
                >
                  {leave.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </CustomTableContainer>
    </div>
  );
}
