"use client";
import { SearchInput } from "@/components/searchInput";
import { Card } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { CustomTableContainer } from "../all-employees/components/CustomTableContainer";
import Image from "next/image";
import { Pagination } from "@/components/Pagination";

type Leave = {
  id: string;
  employee: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  reportingManager: string;
  days: number;
  duration: string;
  avatar: string;
};

const data: Leave[] = [
  {
    id: "1",
    employee: "Mazin Emad",
    date: "2021-01-01",
    status: "pending",
    reportingManager: "Mazin Emad",
    days: 3,
    duration: "July 05 - July 08",
    avatar: "/imgs/avatar.png",
  },
  {
    id: "2",
    employee: "Mazin Emad",
    date: "2021-01-09",
    status: "approved",
    reportingManager: "Mazin Emad",
    days: 1,
    duration: "July 05 - July 06",
    avatar: "/imgs/avatar.png",
  },
  {
    id: "3",
    employee: "Mazin Emad",
    date: "2021-01-10",
    status: "rejected",
    reportingManager: "Mazin Emad",
    avatar: "/imgs/avatar.png",
    days: 1,
    duration: "July 05 - July 06",
  },
];

const colors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-500",
  approved: "bg-green-500/20 text-green-500",
  rejected: "bg-red-500/20 text-red-500",
};

export default function LeavesPages() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [candidates, setCandidates] = useState(data);

  useEffect(() => {
    setCandidates(
      data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    );
  }, [currentPage, itemsPerPage]);

  return (
    <Card className="p-4">
      <SearchInput />
      <LeavesTable leaves={data} />
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(candidates.length / itemsPerPage)}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={candidates.length}
        onItemsPerPageChange={setItemsPerPage}
      />
    </Card>
  );
}

function LeavesTable({ leaves }: { leaves: Leave[] }) {
  return (
    <CustomTableContainer>
      <thead className="sticky top-0 bg-background shadow-sm">
        <tr className="*:px-6 *:py-4 *:text-left *:text-xs *:font-medium *:text-gray-500 *:uppercase border-b border-hrms-gray/20">
          <th>employee</th>
          <th>date</th>
          <th>duration</th>
          <th>days</th>
          <th>report manager</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-hrms-gray/20">
        {leaves.map((leave) => (
          <tr
            key={leave.id}
            className="hover:bg-hrms-gray/20 *:px-6 *:py-3 *:capitalize"
          >
            <td>
              <div className="flex items-center gap-2">
                <Image
                  src={leave.avatar}
                  alt={leave.employee}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                {leave.employee}
              </div>
            </td>
            <td>{leave.date}</td>
            <td>{leave.duration}</td>
            <td>{leave.days}</td>
            <td>{leave.reportingManager}</td>
            <td className="px-4 py-2">
              <span
                className={`rounded-lg text-xs px-2 py-1 ${
                  colors[leave.status]
                }`}
              >
                {leave.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </CustomTableContainer>
  );
}
