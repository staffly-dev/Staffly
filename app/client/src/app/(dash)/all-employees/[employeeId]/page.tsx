"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FolderKanbanIcon,
  CalendarIcon,
  UserCircleIcon,
  CalendarCheck,
} from "lucide-react";
import { BriefcaseIcon } from "lucide-react";
// import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { use, useState } from "react";
import { CiEdit } from "react-icons/ci";
import { MdOutlineMail } from "react-icons/md";
import { Profile } from "../components/Profile";
import { Attendance } from "../components/Attendance";
import { Projects } from "../components/Projects";
import { Leave } from "../components/Leave";
import { useEmployee } from "@/context/EmployeeContext";
import ErrorComponent from "@/components/ErrorComponent";
import LoadingComponent from "@/components/LoadingComponent";
import Image from "next/image";

export default function EmployeePage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = use(params);

  // const employee: EmployeeAdded = {
  //   id: "mazin-emad123",
  //   photo: "/imgs/mazin-picture.jpg",
  //   personalInfo: {
  //     name: "Mazin Emad",
  //     email: "q6NtO@example.com",
  //     phone: 1234567890,
  //     address: "123 Main St, Anytown, USA",
  //     city: "Anytown",
  //     state: "CA",
  //     zip: "12345",
  //     gender: "Male",
  //     maritalStatus: "Single",
  //     nationality: "Egyptian",
  //   },
  //   professionalInfo: {
  //     employeeId: "1234567890",
  //     department: "Development",
  //     designation: "Frontend Developer",
  //     employeeType: "Remote",
  //     status: "Permanent",
  //     joiningDate: "2021-01-01",
  //     officeLocation: "Remote",
  //     workingDays: "5/2",
  //     userName: "mazin-emad123",
  //     workEmail: "q6NtO@example.com",
  //   },
  //   documents: {
  //     appointmentLetter: "/imgs/mazin-picture.jpg",
  //     salarySlips: "/imgs/mazin-picture.jpg",
  //     relivingLetter: "/imgs/mazin-picture.jpg",
  //     experienceLetter: "/imgs/mazin-picture.jpg",
  //   },
  //   accountAccess: {
  //     emailAddress: "q6NtO@example.com",
  //     skypeId: "mazin-emad123",
  //     githubId: "mazin-emad123",
  //     slackId: "mazin-emad123",
  //   },
  // };
  const { singleEmployee, error, clearError, singleLoading } = useEmployee();

  const [toShow, setToShow] = useState("profile");

  if (singleLoading) {
    return <LoadingComponent />;
  }
  if (!singleEmployee && !singleLoading) {
    return notFound();
  }

  if (error) {
    return <ErrorComponent error={error} clearError={clearError} />;
  }

  return (
    <Card className="p-4">
      <div className="flex justify-between border-b border-hrms-gray/20 pb-4">
        <div className="flex gap-2">
          <Image
            className="rounded-xl object-cover"
            src={singleEmployee.profilePicture}
            alt="Mazin Emad"
            width={60}
            height={60}
          />
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-semibold mb-1">
              {singleEmployee.firstName} {singleEmployee.lastName}
            </h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <BriefcaseIcon size={16} />
              {singleEmployee.designation}
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MdOutlineMail size={16} />
              {singleEmployee.emailAddress}
            </p>
          </div>
        </div>
        <div className="flex justify-end items-end">
          <Button asChild>
            <Link href={`/all-employees/edit-employee/${employeeId}`}>
              <CiEdit />
              <span className="ml-2">Edit Employee</span>
            </Link>
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
          {toShow === "profile" && <Profile employee={singleEmployee} />}
          {toShow === "attendance" && <Attendance />}
          {toShow === "projects" && <Projects />}
          {toShow === "leave" && <Leave />}
        </div>
      </div>
    </Card>
  );
}
