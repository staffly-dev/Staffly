"use client";
import Image from "next/image";
import { Employee } from "@/types/employee";
import { Pagination } from "@/components/Pagination";
import { useState } from "react";

export function EmployeesTable({ employees }: { employees: Employee[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalItems = employees.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const currentEmployees = employees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <div className="rounded-lg shadow-sm border border-hrms-gray/20">
        <table className="min-w-full divide-y divide-hrms-gray/20">
          <thead>
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                Employee Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                Employee ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                Department
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
            {currentEmployees.map((employee) => (
              <tr key={employee.id} className="hover:bg-hrms-gray/20">
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
                <td className="px-6 py-3 text-sm">{employee.id}</td>
                <td className="px-6 py-3 text-sm">{employee.department}</td>
                <td className="px-6 py-3 text-sm">{employee.designation}</td>
                <td className="px-6 py-3 text-sm">{employee.type}</td>
                <td className="px-6 py-3">
                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-sm bg-primary/20 text-primary">
                    {employee.status}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <div className="flex gap-3">
                    <button className="hover:text-primary">
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
                    <button className="hover:text-primary">
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
                    <button className="hover:text-primary">
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
      </div>
      <div className="mt-4">
        <Pagination
          onItemsPerPageChange={setItemsPerPage}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
        />
      </div>
    </>
  );
}
