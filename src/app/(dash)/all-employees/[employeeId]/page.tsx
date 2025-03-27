import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Employee } from "@/types/employee";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CgMail } from "react-icons/cg";
import { CiEdit } from "react-icons/ci";
import { FaBriefcase } from "react-icons/fa6";

export default async function EmployeePage({
  params,
  employee,
}: {
  params: Promise<{ employeeId: string }>;
  employee: Employee;
}) {
  const { employeeId } = await params;
  if (employeeId !== "mazin-emad123") {
    notFound();
  }

  if (!employee) {
    // fetch employee from API
    employee = {
      id: "mazin-emad123",
      name: "Mazin Emad",
      department: "Development",
      designation: "Frontend Developer",
      type: "Remote",
      status: "Permanent",
      avatar: "/imgs/mazin-picture.jpg",
      email: "q6NtO@example.com",
    };
  }

  return (
    <Card>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image
            className="rounded-xl"
            src={employee.avatar}
            alt="Mazin Emad"
            width={100}
            height={100}
          />
          <div className="flex flex-col items-end">
            <h2 className="text-2xl font-semibold">{employee.name}</h2>
            <p className="text-sm text-muted-foreground flex">
              <FaBriefcase />
              {employee.designation}
            </p>
            <p className="text-sm text-muted-foreground flex">
              <CgMail />
              {employee.designation}
            </p>
          </div>
        </div>
        <div className="flex justify-end items-end">
          <Button>
            <CiEdit />
            <span className="ml-2">Edit Profile</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
