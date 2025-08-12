"use client";
import { Card } from "@/components/ui/card";
import { Employee } from "@/types/employee";
import { CheckInTable } from "./CheckInTable";
import { SearchInput } from "@/components/searchInput";
import { useEffect } from "react";
import { useEmployee } from "@/context/EmployeeContext";

export function CheckInCard({ employees }: { employees: Employee[] }) {
  return (
    <Card className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <SearchInput />
      </div>
      <CheckInTable employees={employees} />
    </Card>
  );
}

export default function CheckInPage() {
  const { employees, getAllEmployees } = useEmployee();

  useEffect(() => {
    getAllEmployees();
  }, [getAllEmployees]);

  return <CheckInCard employees={employees} />;
}
