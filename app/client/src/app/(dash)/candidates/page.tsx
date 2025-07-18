"use client";
import { SearchInput } from "@/components/searchInput";
import { Card } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { CustomTableContainer } from "../all-employees/components/CustomTableContainer";
import Image from "next/image";
import { Pagination } from "@/components/Pagination";
import { Checkbox } from "@/components/ui/checkbox";

type Candidate = {
  id: string;
  name: string;
  job: string;
  date: string;
  avatar: string;
  state: "selected" | "rejected" | "in process";
  email: string;
  phone: string;
};

const data: Candidate[] = [
  {
    id: "1",
    name: "Mazin Emad",
    state: "selected",
    avatar: "/imgs/avatar.png",
    job: "Front End",
    date: "July 14, 2023",
    phone: "(629) 555-0129",
    email: "m@gmail.com",
  },
  {
    id: "2",
    name: "Mazin Emad",
    state: "rejected",
    avatar: "/imgs/avatar.png",
    job: "Front End",
    date: "July 14, 2023",
    phone: "(629) 555-0129",
    email: "m@gmail.com",
  },
  {
    id: "3",
    name: "Mazin Emad",
    state: "in process",
    avatar: "/imgs/avatar.png",
    job: "Front End",
    date: "July 14, 2023",
    phone: "(629) 555-0129",
    email: "m@gmail.com",
  },
];

export default function CandidatesPage() {
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
      <CandidatesTable candidates={data} />
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

const colors = {
  selected: "bg-green-500/20 text-green-500",
  rejected: "bg-red-500/20 text-red-500",
  "in process": "bg-yellow-500/20 text-yellow-500",
};

function CandidatesTable({ candidates }: { candidates: Candidate[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const allSelected =
    candidates.length > 0 && selectedIds.length === candidates.length;
  const someSelected =
    selectedIds.length > 0 && selectedIds.length < candidates.length;

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? candidates.map((cand) => cand.id) : []);
  };

  const toggleOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((selectedId) => selectedId !== id)
    );
  };

  return (
    <CustomTableContainer>
      <thead className="sticky top-0 bg-background shadow-sm">
        <tr className="*:px-6 *:py-4 *:text-left *:text-xs *:font-medium *:text-gray-500 *:uppercase border-b border-hrms-gray/20">
          <th>
            <Checkbox
              className="border-hrms-gray"
              checked={someSelected ? "indeterminate" : allSelected}
              onCheckedChange={toggleAll}
            />
          </th>
          <th>Candidate</th>
          <th>Applied For</th>
          <th>Date</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-hrms-gray/20">
        {candidates.map((cand) => (
          <tr
            key={cand.id}
            className="hover:bg-hrms-gray/20 *:px-6 *:py-3 *:capitalize"
          >
            <td>
              <Checkbox
                className="border-hrms-gray"
                checked={selectedIds.includes(cand.id)}
                onCheckedChange={(checked) =>
                  toggleOne(cand.id, Boolean(checked))
                }
              />
            </td>
            <td>
              <div className="flex items-center gap-2">
                <Image
                  src={cand.avatar}
                  alt={cand.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                {cand.name}
              </div>
            </td>
            <td>{cand.job}</td>
            <td>{cand.date}</td>
            <td>{cand.email}</td>
            <td>{cand.phone}</td>
            <td className="px-4 py-2">
              <span
                className={`rounded-lg text-xs px-2 py-1 ${colors[cand.state]}`}
              >
                {cand.state}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </CustomTableContainer>
  );
}
