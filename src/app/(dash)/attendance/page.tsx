"use client";
import { Pagination } from "@/components/Pagination";
import { SearchInput } from "@/components/searchInput";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { useState } from "react";
type Attendance = {
  id: string;
  status: string;
  employee: string;
  checkIn: string;
  designation: string;
  avatar: string;
};
const att1: Attendance[] = [
  {
    id: "1",
    status: "present",
    employee: "John Doe",
    checkIn: "09:00 AM",
    designation: "Software Engineer",
    avatar: "/imgs/avatar.png",
  },
  {
    id: "2",
    status: "absent",
    employee: "Jane Doe",
    checkIn: "09:00 AM",
    designation: "Software Engineer",
    avatar: "/imgs/avatar.png",
  },
  {
    id: "3",
    status: "present",
    employee: "John Doe",
    checkIn: "09:00 AM",
    designation: "Software Engineer",
    avatar: "/imgs/avatar.png",
  },
  {
    id: "4",
    status: "present",
    employee: "John Doe",
    checkIn: "09:00 AM",
    designation: "Software Engineer",
    avatar: "/imgs/avatar.png",
  },
  {
    id: "5",
    status: "present",
    employee: "John Doe",
    checkIn: "09:00 AM",
    designation: "Software Engineer",
    avatar: "/imgs/avatar.png",
  },
  {
    id: "6",
    status: "present",
    employee: "John Doe",
    checkIn: "09:00 AM",
    designation: "Software Engineer",
    avatar: "/images/avatar.png",
  },
  {
    id: "7",
    status: "present",
    employee: "John Doe",
    checkIn: "09:00 AM",
    designation: "Software Engineer",
    avatar: "/images/avatar.png",
  },
  {
    id: "8",
    status: "present",
    employee: "John Doe",
    checkIn: "09:00 AM",
    designation: "Software Engineer",
    avatar: "/images/avatar.png",
  },
  {
    id: "9",
    status: "present",
    employee: "John Doe",
    checkIn: "09:00 AM",
    designation: "Software Engineer",
    avatar: "/images/avatar.png",
  },
  {
    id: "10",
    status: "present",
    employee: "John Doe",
    checkIn: "09:00 AM",
    designation: "Software Engineer",
    avatar: "/images/avatar.png",
  },
  {
    id: "11",
    status: "present",
    employee: "John Doe",
    checkIn: "09:00 AM",
    designation: "Software Engineer",
    avatar: "/images/avatar.png",
  },
];

const att2: Attendance[] = att1.map((att) => ({
  ...att,
  id: att.id + "1u",
  status: att.status === "present" ? "present" : "absent",
}));
const att3: Attendance[] = att1.map((att) => ({
  ...att,
  id: att.id + "h2",
  status: att.status === "present" ? "holiday" : "leave",
}));

const attData = [...att1, ...att2, ...att3];

const attStatusColors: Record<string, string> = {
  present: "bg-green-500/20 text-green-500",
  absent: "bg-red-500/20 text-red-500",
  leave: "bg-yellow-500/20 text-yellow-500",
  holiday: "bg-blue-500/20 text-blue-500",
  late: "bg-orange-500/20 text-orange-500",
};

export default function Attendance() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalPages = Math.ceil(attData.length / itemsPerPage);
  const totalItems = attData.length;

  const currentData = attData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Card className="bg-transparent border-hrms-gray/20 container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <SearchInput />
      </div>
      <table className="min-w-full divide-y divide-hrms-gray/20 mb-4">
        <thead>
          <tr className="*:px-6 *:py-4 *:text-left *:text-xs *:font-medium *:text-gray-500 *:uppercase border-b border-hrms-gray/20">
            <th>Employee</th>
            <th>Designation</th>
            <th>Check In</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hrms-gray/20">
          {currentData.map((att) => (
            <tr key={att.id} className="*:px-6 *:py-3 *:text-sm">
              <td className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={att.avatar} />
                  <AvatarFallback>{att.employee.charAt(0)}</AvatarFallback>
                </Avatar>
                {att.employee}
              </td>
              <td>{att.designation}</td>
              <td>{att.checkIn}</td>
              <td>
                <span
                  className={`rounded-md px-2 py-1 ${
                    attStatusColors[att.status]
                  }`}
                >
                  {att.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination
        onItemsPerPageChange={setItemsPerPage}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
      />
    </Card>
  );
}
