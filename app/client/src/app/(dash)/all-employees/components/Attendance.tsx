"use client";
import { CustomTableContainer } from "./CustomTableContainer";

type EmployeeAttendance = {
  id: string;
  date: string;
  break: string;
  workingHours: string;
  checkIn: string;
  checkOut: string;
  status: "present" | "absent" | "late" | "leave" | "holiday";
};

const mazinAttendance: EmployeeAttendance[] = [
  {
    id: "1",
    date: "2021-01-01",
    break: "1 hour",
    workingHours: "8 hours",
    checkIn: "09:00",
    checkOut: "17:00",
    status: "present",
  },
  {
    id: "2",
    date: "2021-01-02",
    break: "1 hour",
    workingHours: "8 hours",
    checkIn: "09:00",
    checkOut: "17:00",
    status: "present",
  },
  {
    id: "3",
    date: "2021-01-03",
    break: "1 hour",
    workingHours: "8 hours",
    checkIn: "09:00",
    checkOut: "17:00",
    status: "holiday",
  },
  {
    id: "4",
    date: "2021-01-04",
    break: "30 Min",
    workingHours: "8 hours",
    checkIn: "09:00",
    checkOut: "16:30",
    status: "absent",
  },
  {
    id: "5",
    date: "2021-01-05",
    break: "1 hour",
    workingHours: "8 hours",
    checkIn: "010:00",
    checkOut: "17:00",
    status: "late",
  },
  {
    id: "6",
    date: "2021-01-06",
    break: "0",
    workingHours: "0",
    checkIn: "_",
    checkOut: "_",
    status: "absent",
  },
  {
    id: "7",
    date: "2021-01-07",
    break: "1 hour",
    workingHours: "8 hours",
    checkIn: "09:00",
    checkOut: "17:00",
    status: "present",
  },
  {
    id: "8",
    date: "2021-01-08",
    break: "30 Min",
    workingHours: "8 hours",
    checkIn: "09:00",
    checkOut: "16:30",
    status: "holiday",
  },
  {
    id: "9",
    date: "2021-01-09",
    break: "1 hour",
    workingHours: "8 hours",
    checkIn: "010:00",
    checkOut: "17:00",
    status: "late",
  },
  {
    id: "10",
    date: "2021-01-10",
    break: "0",
    workingHours: "0",
    checkIn: "_",
    checkOut: "_",
    status: "absent",
  },
  {
    id: "11",
    date: "2021-01-11",
    break: "0",
    workingHours: "0",
    checkIn: "_",
    checkOut: "_",
    status: "absent",
  },
  {
    id: "63",
    date: "2021-01-06",
    break: "0",
    workingHours: "0",
    checkIn: "_",
    checkOut: "_",
    status: "absent",
  },
  {
    id: "632",
    date: "2021-01-06",
    break: "0",
    workingHours: "0",
    checkIn: "_",
    checkOut: "_",
    status: "leave",
  },
];

const attendanceStatusColors = {
  present: "bg-green-500/20 text-green-500",
  absent: "bg-red-500/20 text-red-500",
  holiday: "bg-primary/20 text-primary",
  late: "bg-yellow-500/20 text-yellow-500",
  leave: "bg-purple-500/20 text-purple-500",
};

export function Attendance() {
  return (
    <CustomTableContainer>
      <thead className="sticky top-0 bg-background shadow-sm">
        <tr className="*:px-6 *:py-4 *:text-left *:text-xs *:font-medium *:text-gray-500 *:uppercase border-b border-hrms-gray/20">
          <th>Date</th>
          <th>Break</th>
          <th>Working Hours</th>
          <th>Check In</th>
          <th>Check Out</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-hrms-gray/20">
        {mazinAttendance.map((attendance) => (
          <tr
            key={attendance.id}
            className="hover:bg-hrms-gray/20 *:px-6 *:py-3"
          >
            <td>{attendance.date}</td>
            <td>{attendance.break}</td>
            <td>{attendance.workingHours}</td>
            <td>{attendance.checkIn}</td>
            <td>{attendance.checkOut}</td>
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
      </tbody>
    </CustomTableContainer>
  );
}
