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
import { notFound } from "next/navigation";
import Link from "next/link";
import { use, useState } from "react";
import { CiEdit } from "react-icons/ci";
import { MdOutlineMail } from "react-icons/md";
import { Profile } from "../components/Profile";
import { Attendance } from "../components/Attendance";
import { Projects } from "../components/Projects";
import { Leave } from "../components/Leave";
import { useEmployee } from "@/hooks/useEmployees";
import ErrorComponent from "@/components/ErrorComponent";
import LoadingComponent from "@/components/LoadingComponent";
import Image from "next/image";

export default function EmployeePage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = use(params);

  const { data: singleEmployee, isLoading, error } = useEmployee(employeeId);

  const [toShow, setToShow] = useState("profile");

  if (isLoading) {
    return <LoadingComponent />;
  }
  if (!singleEmployee && !isLoading) {
    return notFound();
  }

  if (error) {
    return <ErrorComponent error={error.message} clearError={() => {}} />;
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
