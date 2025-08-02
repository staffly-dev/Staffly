"use client";
import { notFound } from "next/navigation";
import { EmployeesCard } from "../../all-employees/page";
import { useEmployee } from "@/context/EmployeeContext";
import { useParams } from "next/navigation";
import { departments } from "@/app/constants";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { useEffect } from "react";

export default function DepartmentPage() {
  const { departmentId } = useParams();

  const dept = departmentId as string;
  const deptId = dept.toLowerCase();

  const { getAllEmployees, employees, loading, error, clearError } =
    useEmployee();

  useEffect(() => {
    getAllEmployees();
  }, [getAllEmployees]);

  if (!departments.map((dept) => dept.toLowerCase()).includes(deptId)) {
    notFound();
  }

  if (loading) {
    <LoadingComponent />;
  }

  if (error) {
    <ErrorComponent error={error} clearError={clearError} />;
  }

  const filteredEmployees = employees.filter(
    (employee) => employee.department.toLowerCase() === deptId
  );

  return <EmployeesCard employees={filteredEmployees} />;
}
