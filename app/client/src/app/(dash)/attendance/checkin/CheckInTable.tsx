"use client";
// import Image from "next/image";
import { Employee } from "@/types/employee";
import { Pagination } from "@/components/Pagination";
import { useState } from "react";
import Link from "next/link";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { useEmployee } from "@/context/EmployeeContext";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FaCalendarCheck } from "react-icons/fa6";
import { useAttendance } from "@/context/AttendanceContext";
import { cn, saveCheckedInEmployees, getCheckedInEmployees } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function CheckInTable({ employees }: { employees: Employee[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { loading, error, clearError } = useEmployee();
  const router = useRouter();
  const {
    checkIn,
    error: checkInError,
    clearError: clearCheckInError,
  } = useAttendance();
  const [isCheckedIn, setIsCheckedIn] = useState(getCheckedInEmployees());
  const [checkInLoading, setCheckInLoading] = useState<Record<string, boolean>>(
    {}
  );
  const totalItems = employees.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const currentEmployees = employees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return <LoadingComponent />;
  }
  if (error) {
    return <ErrorComponent error={error} clearError={clearError} />;
  }

  const handleCheckIn = async (employeeId: string) => {
    setCheckInLoading((prev) => ({ ...prev, [employeeId]: true }));

    const res = await checkIn({ employeeId });
    if (res) {
      toast.success("Employee Checked in successfully");
      setIsCheckedIn([...isCheckedIn, employeeId]);
      saveCheckedInEmployees(employeeId);
    } else if (checkInError) {
      toast.error(checkInError, {
        description: "Employee already checked in",
        action: {
          label: "Attendance",
          onClick: () => {
            router.push("/attendance");
          },
        },
        cancel: {
          label: "Cancel",
          onClick: () => {
            clearCheckInError();
          },
        },
        position: "top-center",
      });
    }
    setCheckInLoading((prev) => ({ ...prev, [employeeId]: false }));
  };

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
                Check In
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
                <td className="px-6 py-3">
                  <Button
                    onClick={() => handleCheckIn(employee._id)}
                    disabled={
                      checkInLoading[employee._id] ||
                      isCheckedIn.includes(employee._id)
                    }
                    className={cn(
                      "flex items-center gap-2",
                      isCheckedIn.includes(employee._id) && "bg-green-500"
                    )}
                  >
                    <FaCalendarCheck />
                    {checkInLoading[employee._id]
                      ? "Checking In..."
                      : "Check In"}
                  </Button>
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
