"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BriefcaseIcon,
  FolderKanbanIcon,
  CalendarIcon,
  UserCircleIcon,
  CalendarCheck,
} from "lucide-react";
import { MdOutlineMail } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import Image from "next/image";
import { Profile } from "./Profile";
import { Attendance } from "./Attendance";
import { Projects } from "./Projects";
import { Leave } from "./Leave";
import type { EmployeeAdded } from "./Profile";

interface EmployeeProfileClientProps {
  employee: EmployeeAdded;
}

export default function EmployeeProfileClient({
  employee,
}: EmployeeProfileClientProps) {
  const [toShow, setToShow] = useState("profile");

  return (
    <Card className="p-4">
      <div className="flex justify-between border-b border-hrms-gray/20 pb-4">
        <div className="flex gap-2">
          <Image
            className="rounded-xl"
            src={employee.photo}
            alt={employee.personalInfo.name}
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
