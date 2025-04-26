"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@/components/ui/tabs";
import {
  FolderKanbanIcon,
  LockIcon,
  CalendarIcon,
  UserCircleIcon,
  CalendarCheck,
} from "lucide-react";
import { FileTextIcon } from "lucide-react";
// import { Employee } from "@/types/employee";
import { BriefcaseIcon } from "lucide-react";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { useState } from "react";
import { CiEdit } from "react-icons/ci";
import { IoPersonCircleOutline } from "react-icons/io5";
import { MdOutlineMail } from "react-icons/md";

interface EmployeeAdded {
  id: string;
  photo: string;
  personalInfo: {
    name: string;
    email: string;
    phone: number;
    address: string;
    city: string;
    state: string;
    zip: string;
    gender: string;
    maritalStatus: string;
    nationality: string;
  };
  professionalInfo: {
    employeeId: string;
    userName: string;
    workEmail: string;
    department: string;
    status: string;
    joiningDate: string;
    officeLocation: string;
    designation: string;
    workingDays: string;
    employeeType: string;
  };
  documents: {
    appointmentLetter: string;
    salarySlips: string;
    relivingLetter: string;
    experienceLetter: string;
  };
  accountAccess: {
    emailAddress: string;
    skypeId: string;
    githubId: string;
    slackId: string;
  };
}

export default function EmployeePage({
  employee,
}: {
  employee: EmployeeAdded;
}) {
  const employeeId = useParams().employeeId;
  if (employeeId !== "mazin-emad123") {
    notFound();
  }

  if (!employee) {
    // fetch employee from API
    employee = {
      id: "mazin-emad123",
      photo: "/imgs/mazin-picture.jpg",
      personalInfo: {
        name: "Mazin Emad",
        email: "q6NtO@example.com",
        phone: 1234567890,
        address: "123 Main St, Anytown, USA",
        city: "Anytown",
        state: "CA",
        zip: "12345",
        gender: "Male",
        maritalStatus: "Single",
        nationality: "Egyptian",
      },
      professionalInfo: {
        employeeId: "1234567890",
        department: "Development",
        designation: "Frontend Developer",
        employeeType: "Remote",
        status: "Permanent",
        joiningDate: "2021-01-01",
        officeLocation: "Remote",
        workingDays: "5/2",
        userName: "mazin-emad123",
        workEmail: "q6NtO@example.com",
      },
      documents: {
        appointmentLetter: "/imgs/mazin-picture.jpg",
        salarySlips: "/imgs/mazin-picture.jpg",
        relivingLetter: "/imgs/mazin-picture.jpg",
        experienceLetter: "/imgs/mazin-picture.jpg",
      },
      accountAccess: {
        emailAddress: "q6NtO@example.com",
        skypeId: "mazin-emad123",
        githubId: "mazin-emad123",
        slackId: "mazin-emad123",
      },
    };
  }

  const [toShow, setToShow] = useState("profile");

  return (
    <Card className="p-4">
      <div className="flex justify-between border-b border-hrms-gray/20 pb-4">
        <div className="flex gap-2">
          <Image
            className="rounded-xl"
            src={employee.photo}
            alt="Mazin Emad"
            width={60}
            height={60}
          />
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-semibold mb-1">
              {employee.personalInfo.name}
            </h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <BriefcaseIcon size={16} />
              {employee.professionalInfo.designation}
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MdOutlineMail size={16} />
              {employee.personalInfo.email}
            </p>
          </div>
        </div>
        <div className="flex justify-end items-end">
          <Button className="">
            <CiEdit />
            <span className="ml-2">Edit Profile</span>
          </Button>
        </div>
      </div>

      <div className="flex gap-6 mt-4">
        <Card className="overflow-hidden h-fit">
          <div className="flex flex-col">
            <div
              className={`flex gap-2 items-center hover:text-primary pl-4 pr-16 pb-2 pt-4 cursor-pointer ${
                toShow === "profile" ? "bg-primary hover:text-white" : ""
              }`}
              onClick={() => setToShow("profile")}
            >
              <span>
                <UserCircleIcon size={16} />
              </span>
              <span>Profile</span>
            </div>
            <div
              className={`flex gap-2 items-center pl-4 pr-16 hover:text-primary py-2 cursor-pointer ${
                toShow === "attendance" ? "bg-primary hover:text-white" : ""
              }`}
              onClick={() => setToShow("attendance")}
            >
              <span>
                <CalendarCheck size={16} />
              </span>
              <span>Attendance</span>
            </div>
            <div
              className={`flex gap-2 items-center pl-4 pr-16 hover:text-primary py-2 cursor-pointer ${
                toShow === "projects" ? "bg-primary hover:text-white" : ""
              }`}
              onClick={() => setToShow("projects")}
            >
              <span>
                <FolderKanbanIcon size={16} />
              </span>
              <span>Projects</span>
            </div>
            <div
              className={`flex gap-2 items-center pl-4 pr-16 hover:text-primary pb-4 pt-2 cursor-pointer ${
                toShow === "leave" ? "bg-primary hover:text-white" : ""
              }`}
              onClick={() => setToShow("leave")}
            >
              <span>
                <CalendarIcon size={16} />
              </span>
              <span>Leave</span>
            </div>
          </div>
        </Card>
        <div className="w-full">
          {toShow === "profile" && <Profile employee={employee} />}
          {toShow === "attendance" && <Attendance />}
          {toShow === "projects" && <Projects />}
          {toShow === "leave" && <Leave />}
        </div>
      </div>
    </Card>
  );
}

function Profile({ employee }: { employee: EmployeeAdded }) {
  const [step, setStep] = useState(0);
  const handleTabChange = (value: string) => {
    setStep(parseInt(value));
  };

  const personalInfo = employee.personalInfo;
  const professionalInfo = employee.professionalInfo;
  const documents = employee.documents;
  const accountAccess = employee.accountAccess;

  return (
    <div>
      <Tabs value={String(step)} onValueChange={handleTabChange}>
        {/* Step Navigation */}
        <TabsList className="flex space-x-4 border-b border-hrms-gray/20 p-2">
          <TabsTrigger value="0" className="flex items-center space-x-2">
            <IoPersonCircleOutline size={16} />
            <span>Personal Information</span>
          </TabsTrigger>
          <TabsTrigger value="1" className="flex items-center space-x-2">
            <BriefcaseIcon size={16} />
            <span>Professional Information</span>
          </TabsTrigger>
          <TabsTrigger value="2" className="flex items-center space-x-2">
            <FileTextIcon size={16} />
            <span>Documents</span>
          </TabsTrigger>
          <TabsTrigger value="3" className="flex items-center space-x-2">
            <LockIcon size={16} />
            <span>Account Access</span>
          </TabsTrigger>
        </TabsList>
        {step === 0 && <PersonalInformation personalInfo={personalInfo} />}
        {step === 1 && (
          <ProfessionalInformation professionalInfo={professionalInfo} />
        )}
        {step === 2 && <Documents documents={documents} />}
        {step === 3 && <AccountAccess accountAccess={accountAccess} />}
      </Tabs>
    </div>
  );
}

function PersonalInformation({
  personalInfo,
}: {
  personalInfo: EmployeeAdded["personalInfo"];
}) {
  return (
    <TabsContent value="0" className="">
      <div className="grid grid-cols-2 gap-4 py-4">
        {Object.keys(personalInfo).map((key) => (
          <div
            key={key}
            className="flex flex-col col-span-1 gap-2 border-b border-hrms-gray/20 pb-2 [&:nth-last-child(-n+2)]:border-b-0"
          >
            <span className="text-sm text-muted-foreground capitalize">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </span>
            <p>{personalInfo[key as keyof EmployeeAdded["personalInfo"]]}</p>
          </div>
        ))}
      </div>
    </TabsContent>
  );
}

function ProfessionalInformation({
  professionalInfo,
}: {
  professionalInfo: EmployeeAdded["professionalInfo"];
}) {
  return (
    <TabsContent value="1">
      <div className="grid grid-cols-2 gap-4 py-4">
        {Object.keys(professionalInfo).map((key) => (
          <div
            key={key}
            className="flex flex-col col-span-1 gap-2 border-b border-hrms-gray/20 pb-2 [&:nth-last-child(-n+2)]:border-b-0"
          >
            <span className="text-sm text-muted-foreground capitalize">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </span>
            <p>
              {professionalInfo[key as keyof EmployeeAdded["professionalInfo"]]}
            </p>
          </div>
        ))}
      </div>
    </TabsContent>
  );
}

function Documents({ documents }: { documents: EmployeeAdded["documents"] }) {
  return (
    <TabsContent value="2">
      <div className="grid grid-cols-2 gap-4 py-4">
        {Object.keys(documents).map((key) => (
          <div
            key={key}
            className="flex flex-col col-span-1 gap-2 border-b border-hrms-gray/20 pb-2 [&:nth-last-child(-n+2)]:border-b-0"
          >
            <span className="text-sm text-muted-foreground capitalize">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </span>
            <p>{documents[key as keyof EmployeeAdded["documents"]]}</p>
          </div>
        ))}
      </div>
    </TabsContent>
  );
}

function AccountAccess({
  accountAccess,
}: {
  accountAccess: EmployeeAdded["accountAccess"];
}) {
  return (
    <TabsContent value="3">
      <div className="grid grid-cols-2 gap-4 py-4">
        {Object.keys(accountAccess).map((key) => (
          <div
            key={key}
            className="flex flex-col col-span-1 gap-2 border-b border-hrms-gray/20 pb-2 [&:nth-last-child(-n+2)]:border-b-0"
          >
            <span className="text-sm text-muted-foreground capitalize">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </span>
            <p>{accountAccess[key as keyof EmployeeAdded["accountAccess"]]}</p>
          </div>
        ))}
      </div>
    </TabsContent>
  );
}

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

function Attendance() {
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

type Project = {
  id: string;
  name: string;
  status: string;
  startDate: string;
  finishDate: string;
};

const mazinProjects: Project[] = [
  {
    id: "1",
    name: "Project 1",
    status: "active",
    startDate: "2021-01-01",
    finishDate: "2021-01-05",
  },
  {
    id: "2",
    name: "Project 2",
    status: "completed",
    startDate: "2021-01-06",
    finishDate: "2021-01-10",
  },
  {
    id: "3",
    name: "Project 3",
    status: "pending",
    startDate: "2021-01-11",
    finishDate: "2021-01-15",
  },
  {
    id: "4",
    name: "Project 4",
    status: "late",
    startDate: "2021-01-16",
    finishDate: "2021-01-20",
  },
  {
    id: "5",
    name: "Project 5",
    status: "cancelled",
    startDate: "2021-01-21",
    finishDate: "2021-01-25",
  },
  {
    id: "6",
    name: "Project 6",
    status: "late",
    startDate: "2021-01-26",
    finishDate: "2021-01-30",
  },
  {
    id: "7",
    name: "Project 7",
    status: "cancelled",
    startDate: "2021-01-31",
    finishDate: "2021-02-05",
  },
];

const projectStatusColors: Record<string, string> = {
  active: "bg-green-500/20 text-green-500",
  completed: "bg-blue-500/20 text-blue-500",
  pending: "bg-yellow-500/20 text-yellow-500",
  late: "bg-red-500/20 text-red-500",
  cancelled: "bg-red-500/20 text-red-500",
};

function Projects() {
  return (
    <CustomTableContainer>
      <thead className="sticky top-0 bg-background shadow-sm">
        <tr className="*:px-6 *:py-4 *:text-left *:text-xs *:font-medium *:text-gray-500 *:uppercase border-b border-hrms-gray/20">
          <th>Sr.No</th>
          <th>Project Name</th>
          <th>Start Date</th>
          <th>Finish Date</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-hrms-gray/20">
        {mazinProjects.map((project) => (
          <tr key={project.id} className="hover:bg-hrms-gray/20 *:px-6 *:py-3">
            <td>{project.id}</td>
            <td>{project.name}</td>
            <td>{project.startDate}</td>
            <td>{project.finishDate}</td>
            <td>
              <span
                className={`capitalize rounded-md px-2 py-1 ${
                  projectStatusColors[project.status]
                }`}
              >
                {project.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </CustomTableContainer>
  );
}

type Leave = {
  id: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  reportingManager: string;
  days: number;
  duration: string;
};

const mazinLeaves: Leave[] = [
  {
    id: "1",
    date: "2021-01-01",
    status: "pending",
    reportingManager: "Mazin Emad",
    days: 3,
    duration: "July 05 - July 08",
  },
  {
    id: "2",
    date: "2021-01-09",
    status: "approved",
    reportingManager: "Mazin Emad",
    days: 1,
    duration: "July 05 - July 06",
  },
  {
    id: "3",
    date: "2021-01-10",
    status: "rejected",
    reportingManager: "Mazin Emad",
    days: 1,
    duration: "July 05 - July 06",
  },
];

const leaveStatusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-500",
  approved: "bg-green-500/20 text-green-500",
  rejected: "bg-red-500/20 text-red-500",
};

function Leave() {
  return (
    <CustomTableContainer>
      <thead className="sticky top-0 bg-background shadow-sm">
        <tr className="*:px-6 *:py-4 *:text-left *:text-xs *:font-medium *:text-gray-500 *:uppercase border-b border-hrms-gray/20">
          <th>Date</th>
          <th>Status</th>
          <th>Reporting Manager</th>
          <th>Days</th>
          <th>Duration</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-hrms-gray/20">
        {mazinLeaves.map((leave) => (
          <tr
            key={leave.id}
            className="hover:bg-hrms-gray/20 *:px-6 *:py-3 *:capitalize"
          >
            <td>{leave.date}</td>
            <td>{leave.duration}</td>
            <td>{leave.days} days</td>
            <td>{leave.reportingManager}</td>
            <td>
              <span
                className={`rounded-md px-2 py-1 ${
                  leaveStatusColors[leave.status]
                }`}
              >
                {leave.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </CustomTableContainer>
  );
}

export function CustomTableContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="p-0 max-h-[calc(100vh-250px)] overflow-y-auto [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-track]:bg-hrms-gray/20
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-primary/60"
    >
      <table className="min-w-full divide-y divide-hrms-gray/20">
        {children}
      </table>
    </div>
  );
}
