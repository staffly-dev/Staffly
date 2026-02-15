"use client";
// import Image from "next/image";
import { Pagination } from "@/components/Pagination";
import { useState } from "react";
import Link from "next/link";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { useEmployees } from "@/hooks/useEmployees";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FaCalendarCheck } from "react-icons/fa6";
import { useCheckIn, useAttendance } from "@/hooks/useAttendance";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function CheckInTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const {
    data: employees = [],
    isLoading: loading,
    error,
    refetch,
  } = useEmployees();
  const router = useRouter();
  const { mutate: checkIn } = useCheckIn();
  const { data: attendanceData = [], isLoading: attendanceLoading } =
    useAttendance();
  const [checkInLoadingStates, setCheckInLoadingStates] = useState<
    Record<string, boolean>
  >({});
  const totalItems = employees.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Helper function to check if an employee is checked in today
  const isEmployeeCheckedIn = (employeeId: string) => {
    if (!attendanceData || attendanceData.length === 0) return false;

    const today = new Date().toISOString().split("T")[0];
    return attendanceData.some(
      (record) =>
        record.employeeId &&
        record.employeeId._id === employeeId &&
        record.date === today &&
        record.checkInTime &&
        !record.checkOutTime
    );
  };

  const currentEmployees = employees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearError = () => {
    refetch();
  };

  if (loading || attendanceLoading) {
    return <LoadingComponent />;
  }
  if (error) {
    return (
      <ErrorComponent
        error={error.message || "An error occurred"}
        clearError={clearError}
      />
    );
  }

  const handleCheckIn = async (employeeId: string) => {
    setCheckInLoadingStates((prev) => ({ ...prev, [employeeId]: true }));

    checkIn(
      { employeeId },
      {
        onSuccess: () => {
          toast.success("Employee Checked in successfully");
        },
        onError: (error) => {
          toast.error("Failed to check in employee", {
            description: "Employee may already be checked in",
            action: {
              label: "Attendance",
              onClick: () => {
                router.push("/attendance");
              },
            },
            position: "top-center",
          });
          console.log("Check-in error:", error);
        },
        onSettled: () => {
          setCheckInLoadingStates((prev) => ({ ...prev, [employeeId]: false }));
        },
      }
    );
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
                      checkInLoadingStates[employee._id] ||
                      isEmployeeCheckedIn(employee._id)
                    }
                    className={cn(
                      "flex items-center gap-2",
                      isEmployeeCheckedIn(employee._id) && "bg-green-500"
                    )}
                  >
                    <FaCalendarCheck />
                    {checkInLoadingStates[employee._id]
                      ? "Checking In..."
                      : isEmployeeCheckedIn(employee._id)
                      ? "Checked In"
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
