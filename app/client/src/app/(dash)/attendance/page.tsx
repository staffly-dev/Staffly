"use client";
import ErrorComponent from "@/components/ErrorComponent";
import LoadingComponent from "@/components/LoadingComponent";
import { Pagination } from "@/components/Pagination";
import { SearchInput } from "@/components/searchInput";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { useAttendance } from "@/context/AttendanceContext";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const attStatusColors: Record<string, string> = {
  "On Time": "bg-green-500/20 text-green-500",
  absent: "bg-red-500/20 text-red-500",
  leave: "bg-yellow-500/20 text-yellow-500",
  holiday: "bg-blue-500/20 text-blue-500",
  Late: "bg-orange-500/20 text-orange-500",
};

export default function Attendance() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const {
    fetchAttendance,
    attendanceRecords,
    isLoadingAttendance,
    error,
    clearError,
  } = useAttendance();

  const totalPages = Math.ceil(attendanceRecords.length / itemsPerPage);
  const totalItems = attendanceRecords.length;

  const currentData = attendanceRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  if (isLoadingAttendance) {
    return <LoadingComponent />;
  }

  if (error) {
    return <ErrorComponent error={error} clearError={clearError} />;
  }

  const getUtcTime = (date: Date) => {
    return `${date.getUTCHours()}:${date
      .getUTCMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const data = currentData.map((att) => {
    return {
      ...att,
      checkInTime: getUtcTime(new Date(att.checkInTime)),
      checkOutTime: att.checkOutTime
        ? getUtcTime(new Date(att.checkOutTime))
        : null,
    };
  });

  console.log(currentData);

  return (
    <Card className="bg-transparent border-hrms-gray/20 container mx-auto p-6">
      <div className="flex justify-between items-center mb-6 ">
        <SearchInput />
      </div>
      <div className="min-h-[400px]">
        <table className="min-w-full divide-y divide-hrms-gray/20 mb-4">
          <thead>
            <tr className="*:px-6 *:py-4 *:text-left *:text-xs *:font-medium *:text-gray-500 *:uppercase border-b border-hrms-gray/20">
              <th>Employee</th>
              <th>Designation</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Employee Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hrms-gray/20">
            {data.map((att) => (
              <tr key={att._id} className="*:px-6 *:py-3 *:text-sm">
                <td>
                  {/* <Avatar className="w-8 h-8">
                    <AvatarImage src={att.employeeId.profilePicture} />
                    <AvatarFallback>
                      {att.employeeId.firstName.charAt(0)}
                    </AvatarFallback>
                  </Avatar> */}
                  {att.employeeId.firstName} {att.employeeId.lastName}
                </td>
                <td>{att.employeeId.designation}</td>
                <td className={cn(att.checkInTime ? "" : "text-center")}>
                  {att.checkInTime ? att.checkInTime : "_"}
                </td>
                <td className={cn(att.checkOutTime ? "" : "text-center")}>
                  {att.checkOutTime ? att.checkOutTime : "_"}
                </td>
                <td>{att.employeeId.employeeType}</td>
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
      </div>
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
