"use client";

import { Card } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

const stats = [
  {
    title: "Total Employee",
    value: "560",
    change: "+12%",
    isIncrease: true,
    lastUpdate: "July 16, 2023",
    icon: "/icons/employee.svg",
  },
  {
    title: "Total Applicant",
    value: "1050",
    change: "+9%",
    isIncrease: true,
    lastUpdate: "July 14, 2023",
    icon: "/icons/applicant.svg",
  },
  {
    title: "Today Attendance",
    value: "470",
    change: "-5%",
    isIncrease: false,
    lastUpdate: "July 14, 2023",
    icon: "/icons/attendance.svg",
  },
  {
    title: "Total Projects",
    value: "250",
    change: "+15%",
    isIncrease: true,
    lastUpdate: "July 10, 2023",
    icon: "/icons/projects.svg",
  },
];

const attendanceData = [
  {
    name: "Leonie Watson",
    avatar: "/avatars/leonie.jpg",
    designation: "Team Lead - Design",
    type: "Office",
    checkIn: "09:27 AM",
    status: "On Time",
  },
  {
    name: "Darlene Robertson",
    avatar: "/avatars/darlene.jpg",
    designation: "Web Designer",
    type: "Office",
    checkIn: "10:15 AM",
    status: "Late",
  },
  {
    name: "Jacob Jones",
    avatar: "/avatars/jacob.jpg",
    designation: "Medical Assistant",
    type: "Remote",
    checkIn: "10:24 AM",
    status: "Late",
  },
  {
    name: "Kathryn Murphy",
    avatar: "/avatars/kathryn.jpg",
    designation: "Marketing Coordinator",
    type: "Office",
    checkIn: "09:10 AM",
    status: "On Time",
  },
  {
    name: "Leslie Alexander",
    avatar: "/avatars/leslie.jpg",
    designation: "Data Analyst",
    type: "Office",
    checkIn: "09:15 AM",
    status: "On Time",
  },
];

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 grid place-items-center">
                    <Image src={stat.icon} alt="" width={20} height={20} />
                  </div>
                  <span
                    className={`flex items-center gap-1 text-sm ${
                      stat.isIncrease ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {stat.isIncrease ? (
                      <ArrowUpIcon className="h-4 w-4" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4" />
                    )}
                    {stat.change}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold">{stat.value}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stat.title}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Update: {stat.lastUpdate}
            </p>
          </Card>
        ))}
      </div>

      {/* Attendance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="col-span-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold">My Schedule</h3>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
          <Calendar
            className="rounded-lg border"
            mode="single"
            selected={new Date()}
          />
        </Card>

        {/* Attendance List */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold">Attendance Overview</h3>
            <Select defaultValue="today">
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b">
                  <th className="text-left font-medium py-3">Employee Name</th>
                  <th className="text-left font-medium py-3">Designation</th>
                  <th className="text-left font-medium py-3">Type</th>
                  <th className="text-left font-medium py-3">Check-In Time</th>
                  <th className="text-left font-medium py-3">Status</th>
                  <th className="text-left font-medium py-3"></th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((employee) => (
                  <tr key={employee.name} className="border-b last:border-none">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={employee.avatar}
                          alt={employee.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                        <span className="font-medium">{employee.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {employee.designation}
                    </td>
                    <td className="py-3">{employee.type}</td>
                    <td className="py-3">{employee.checkIn}</td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs ${
                          employee.status === "On Time"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {employee.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
