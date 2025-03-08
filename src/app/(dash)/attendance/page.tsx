"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { CiSearch } from "react-icons/ci";
import { Card } from "@/components/ui/card";

interface Employee {
  id: string;
  name: string;
  avatar: string;
  designation: string;
  type: string;
  status: string;
}

const employees: Employee[] = [
  {
    id: "3453212310",
    name: "Darlene Robertson",
    avatar: "/imgs/user.png",
    designation: "Lead UI/UX Designer",
    type: "Office",
    status: "Permanent",
  },
  {
    id: "345321231",
    name: "Darlene Robertson",
    avatar: "/imgs/user.png",
    designation: "Lead UI/UX Designer",
    type: "Office",
    status: "Permanent",
  },
  {
    id: "3453214231",
    name: "Darlene Robertson",
    avatar: "/imgs/user.png",
    designation: "Lead UI/UX Designer",
    type: "Office",
    status: "Permanent",
  },
  {
    id: "34253213231",
    name: "Darlene Robertson",
    avatar: "/imgs/user.png",
    designation: "Lead UI/UX Designer",
    type: "Office",
    status: "Permanent",
  },
  {
    id: "342532103231",
    name: "Darlene Robertson",
    avatar: "/imgs/user.png",
    designation: "Lead UI/UX Designer",
    type: "Office",
    status: "Permanent",
  },
  {
    id: "987890545",
    name: "Floyd Miles",
    avatar: "/imgs/user.png",
    designation: "Lead UI/UX Designer",
    type: "Office",
    status: "Permanent",
  },
  {
    id: "453567122",
    name: "Cody Fisher",
    avatar: "/imgs/user.png",
    designation: "Sr. UI/UX Designer",
    type: "Office",
    status: "Permanent",
  },
  {
    id: "3453212311",
    name: "Dianne Russell",
    avatar: "/imgs/user.png",
    designation: "Sr. UI/UX Designer",
    type: "Remote",
    status: "Permanent",
  },
  {
    id: "453677881",
    name: "Savannah Nguyen",
    avatar: "/imgs/user.png",
    designation: "Sr. UI/UX Designer",
    type: "Office",
    status: "Permanent",
  },
];

export default function DepartmentPage({
  params,
}: {
  params: { departmentId: string };
}) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Card className="bg-transparent border-hrms-gray/20 container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="w-60 relative">
          <Input
            type="search"
            name="search"
            id="search"
            placeholder="Search..."
            className="w-full pl-8 pr-4 outline-hrms-gray/20 border-hrms-gray/20"
          />
          <CiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>

      <div className="rounded-lg shadow-sm border border-hrms-gray/20">
        <table className="min-w-full divide-y divide-hrms-gray/20">
          <thead>
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                Employee ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                Employee Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                Designation
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hrms-gray/20">
            {employees.map((employee) => (
              <tr key={employee.id} className="hover:bg-hrms-gray/20">
                <td className="px-6 py-3 text-sm">{employee.id}</td>
                <td className="px-6 py-3">
                  <div className="flex items-center">
                    <div className="h-8 w-8 flex-shrink-0">
                      <Image
                        className="h-8 w-8 rounded-full"
                        src={employee.avatar}
                        alt={employee.name}
                        width={32}
                        height={32}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium">{employee.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3 text-sm">{employee.designation}</td>
                <td className="px-6 py-3 text-sm">{employee.type}</td>
                <td className="px-6 py-3">
                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-sm bg-primary/20 text-primary">
                    {employee.status}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <div className="flex gap-3">
                    <button className="text-gray-400 hover:text-primary">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                    <button className="text-gray-400 hover:text-primary">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                    <button className="text-gray-400 hover:text-primary">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-6 py-4 border-t border-hrms-gray/20 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing 1 to 10 out of 46 records
          </div>
          <div className="flex gap-2">
            <button className="text-sm bg-gray-50 hover:bg-gray-100 text-gray-600 font-medium py-2 px-4 rounded border">
              Prev
            </button>
            <button className="text-sm bg-gray-50 hover:bg-gray-100 text-gray-600 font-medium py-2 px-4 rounded border">
              Next
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
