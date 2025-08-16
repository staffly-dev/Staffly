"use client";

import ErrorComponent from "@/components/ErrorComponent";
import LoadingComponent from "@/components/LoadingComponent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAttendance } from "@/context/AttendanceContext";
import { attStatusColors, getUtcTime } from "@/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect } from "react";

export function AttendanceOverview() {
  const {
    fetchAttendance,
    attendanceRecords,
    isLoadingAttendance,
    error,
    clearError,
  } = useAttendance();

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  if (isLoadingAttendance) {
    return <LoadingComponent />;
  }

  if (error) {
    return <ErrorComponent error={error} clearError={clearError} />;
  }

  return (
    <Card className="bg-transparent border-hrms-gray/20 container mx-auto">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="md:text-2xl">Attendance Overview</CardTitle>
        <Link
          href="/attendance"
          className="rounded-md px-4 py-2 bg-primary text-white hover:bg-primary/90"
        >
          View All
        </Link>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="border border-hrms-gray/20 rounded-md min-w-full divide-y divide-hrms-gray/20 mb-4">
          <thead>
            <tr className="*:px-6 *:py-4 *:text-left *:text-xs *:font-medium *:text-gray-500 *:uppercase border-b border-hrms-gray/20">
              <th>Employee</th>
              <th>Designation</th>
              <th>Check In</th>
              <th>Date</th>
              <th>Employee Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hrms-gray/20">
            {attendanceRecords.slice(0, 5).map((att) => (
              <tr
                key={att._id}
                className="*:px-6 *:py-3 *:text-sm hover:bg-hrms-gray/20"
              >
                <td>
                  {att.employeeId?.firstName || "_Employee Deleted_"}
                  {att.employeeId?.lastName && " " + att.employeeId?.lastName}
                </td>
                <td>{att.employeeId?.designation || "_Employee Deleted_"}</td>
                <td className={cn(att.checkInTime ? "" : "text-center")}>
                  {att.checkInTime
                    ? getUtcTime(new Date(att.checkInTime))
                    : "_"}
                </td>
                <td>{new Date(att.date).toLocaleDateString()}</td>
                <td>{att.employeeId?.employeeType || "Employee Deleted"}</td>
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
      </CardContent>
    </Card>
  );
}
