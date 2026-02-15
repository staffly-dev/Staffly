"use client";
import { notFound } from "next/navigation";
import { EmployeesCard } from "../../all-employees/page";
import { useParams } from "next/navigation";
import { departments } from "@/constants";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { useEmployees } from "@/hooks/useEmployees";

export default function DepartmentPage() {
  const { departmentId } = useParams();

  const dept = departmentId as string;
  const deptId = dept.toLowerCase();

  const { data: employees = [], isLoading, error } = useEmployees();

  if (!departments.map((dept) => dept.toLowerCase()).includes(deptId)) {
    notFound();
  }

  if (isLoading) {
    <LoadingComponent />;
  }

  if (error) {
    <ErrorComponent error={error.message} clearError={() => {}} />;
  }

  const filteredEmployees = employees.filter(
    (employee) => employee.department.toLowerCase() === deptId
  );

  return <EmployeesCard employees={filteredEmployees} />;
}
