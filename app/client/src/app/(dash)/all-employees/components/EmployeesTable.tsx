"use client";
// import Image from "next/image";
import { Employee } from "@/types/employee";
import { Pagination } from "@/components/Pagination";
import { useEffect, useState } from "react";
import Link from "next/link";
import ErrorComponent from "@/components/ErrorComponent";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDeleteEmployee } from "@/hooks/useEmployees";

export function EmployeesTable({ employees }: { employees: Employee[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const {
    mutate: deleteEmployee,
    isPending: DeleteLoading,
    error,
    isSuccess,
  } = useDeleteEmployee();
  const totalItems = employees.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const currentEmployees = employees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDeleteEmployee = (employeeId: string) => {
    toast.warning("Are you sure you want to delete this employee?", {
      action: {
        label: "Delete",
        onClick: () => {
          deleteEmployee(employeeId);
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
      position: "top-center",
    });
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Employee deleted successfully");
    }
  }, [isSuccess]);

  if (error) {
    return <ErrorComponent error={error.message} clearError={() => {}} />;
  }

  return (
    <>
      <div className="min-h-[400px]">
        <table className="min-w-full divide-y divide-hrms-gray/20 ">
          <thead>
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                Employee
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                Employee Email
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
                User Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hrms-gray/20">
            {currentEmployees.map((employee) => (
              <tr key={employee._id} className="hover:bg-hrms-gray/20">
                <td className="px-6 py-3">
                  <div className="flex items-center">
                    <div className="h-8 w-8 flex-shrink-0 relative">
                      <Avatar>
                        <AvatarImage
                          src={employee.profilePicture || "/imgs/user.png"}
                          alt={employee.firstName + " " + employee.lastName}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-xs font-semibold bg-primary text-white">
                          {employee.firstName.charAt(0) +
                            employee.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium">
                        {employee.firstName + " " + employee.lastName}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3 text-sm">
                  <Link
                    href={`mailto:${employee.emailAddress}`}
                    className="hover:text-primary underline"
                  >
                    {employee.emailAddress}
                  </Link>
                </td>
                <td className="px-6 py-3 text-sm">{employee.department}</td>
                <td className="px-6 py-3 text-sm">{employee.designation}</td>
                <td className="px-3 py-1 mt-4 inline-flex text-xs leading-5 font-semibold rounded-sm bg-primary/20 text-primary">
                  <span className="capitalize">{employee.employeeType}</span>
                </td>
                <td className="px-6 py-3">{employee.userName}</td>
                <td className="px-6 py-3">
                  <div className="flex gap-3">
                    <Link
                      href={`/all-employees/${employee._id}`}
                      className="hover:text-primary"
                    >
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
                    </Link>
                    <Link
                      href={`/all-employees/edit-employee/${employee._id}`}
                      className="hover:text-primary"
                    >
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
                    </Link>
                    <button
                      onClick={() => handleDeleteEmployee(employee._id)}
                      className="hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={DeleteLoading}
                    >
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
            {!currentEmployees ||
              (currentEmployees.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center pt-4 text-yellow-500">
                    No employees found
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
