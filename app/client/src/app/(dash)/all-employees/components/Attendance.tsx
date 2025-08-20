"use client";
import { getUtcTime } from "@/constants";
import { CustomTableContainer } from "./CustomTableContainer";
import { useAttendance } from "@/context/AttendanceContext";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { AttendanceRecord } from "@/context/AttendanceContext";

const attendanceStatusColors = {
  "on-time": "bg-green-500/20 text-green-500",
  absent: "bg-red-500/20 text-red-500",
  holiday: "bg-primary/20 text-primary",
  late: "bg-yellow-500/20 text-yellow-500",
  leave: "bg-purple-500/20 text-purple-500",
};

export function Attendance() {
  const { fetchAttendance, attendanceRecords } = useAttendance();
  const { employeeId } = useParams();
  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance, employeeId]);

  const data = attendanceRecords
    .filter((attendance: AttendanceRecord) => {
      return attendance.employeeId?._id === employeeId;
    })
    .map((attendance: AttendanceRecord) => {
      return {
        ...attendance,
        checkInTime: getUtcTime(new Date(attendance.checkInTime)),
        checkOutTime: attendance.checkOutTime
          ? getUtcTime(new Date(attendance.checkOutTime))
          : null,
      };
    });

  return (
    <CustomTableContainer>
      <thead className="sticky top-0 bg-background shadow-sm">
        <tr className="*:px-6 *:py-4 *:text-left *:text-xs *:font-medium *:text-gray-500 *:uppercase border-b border-hrms-gray/20">
          <th>Date</th>
          <th>Check In</th>
          <th>Check Out</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-hrms-gray/20">
        {data.map((attendance) => (
          <tr
            key={attendance._id}
            className="hover:bg-hrms-gray/20 *:px-6 *:py-3"
          >
            <td>{new Date(attendance.date).toLocaleDateString()}</td>
            <td>{attendance.checkInTime}</td>
            <td>{attendance.checkOutTime ? attendance.checkOutTime : "_"}</td>
            <td>
              <span
                className={`capitalize rounded-md px-2 py-1 ${
                  attendanceStatusColors[attendance.status]
                }`}
              >
                {attendance.status}
              </span>
            </td>
          </tr>
        ))}
        {!data ||
          (data.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center pt-4 text-yellow-500">
                No attendance records found for this employee
              </td>
            </tr>
          ))}
      </tbody>
    </CustomTableContainer>
  );
}
