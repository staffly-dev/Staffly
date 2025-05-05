import { SearchInput } from "@/components/searchInput";
import { Card } from "@/components/ui/card";
import React from "react";
import { CustomTableContainer } from "../all-employees/[employeeId]/page";
import Image, { StaticImageData } from "next/image";
import { Pagination } from "@/components/Pagination";

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
    state: "selected",
    avatar: "/imgs/avatar.png",
    job: "Front End",
    date: "July 14, 2023",
    phone: "(629) 555-0129",
    email: "m@gmail.com",
  },
  {
    id: "3",
    name: "Mazin Emad",
    state: "selected",
    avatar: "/imgs/avatar.png",
    job: "Front End",
    date: "July 14, 2023",
    phone: "(629) 555-0129",
    email: "m@gmail.com",
  },
];

export default function CandidatesPage() {
  return (
    <Card className="p-4">
      <SearchInput />
      <CandidatesTable candidates={data} />
      {/* <Pagination/> */}
    </Card>
  );
}

const colors = {
  selected: "bg-green-500/20 text-green-500",
  rejected: "bg-red-500/20 text-red-500",
  "in process": "bg-yellow-500/20 text-yellow-500",
};

function CandidatesTable({ candidates }: { candidates: Candidate[] }) {
  return (
    <CustomTableContainer>
      <thead className="sticky top-0 bg-background shadow-sm">
        <tr className="*:px-6 *:py-4 *:text-left *:text-xs *:font-medium *:text-gray-500 *:uppercase border-b border-hrms-gray/20">
          <th>select</th>
          <th>Employee Name</th>
          <th>CTC</th>
          <th>Salary Per Month</th>
          <th>Deduction</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-hrms-gray/20">
        {candidates.map((cand) => (
          <tr
            key={cand.id}
            className="hover:bg-hrms-gray/20 *:px-6 *:py-3 *:capitalize"
          >
            <td>select</td>
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
