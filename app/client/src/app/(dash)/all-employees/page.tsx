"use client";
import { Card } from "@/components/ui/card";
import { Employee } from "@/types/employee";
import { EmployeesTable } from "./components/EmployeesTable";
import { AddNewEmployeeButton } from "./components/Buttons";
import { SearchInput } from "@/components/searchInput";
import { FilterDialog } from "./components/FilterDialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TbFilterPlus } from "react-icons/tb";

export const employees: Employee[] = [
  ...Array.from({ length: 74 }).map((_, i) => ({
    id: `${i + 7893222}`,
    name: `Employee ${i + 7893222}`,
    department: i % 2 === 0 ? "Development" : "HR",
    avatar: "/imgs/user.png",
    designation: i % 2 === 0 ? "UI/UX Designer" : "Frontend Developer",
    type: i % 2 === 0 ? "Office" : "Remote",
    status: i % 3 === 0 ? "Permanent" : "Contractor",
    email: `employee${i + 7893222}@example.com`,
  })),
];

export function EmployeesCard({ employees }: { employees: Employee[] }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    departments: [] as string[],
    workTypes: [] as string[],
    searchTerm: "",
  });

  const handleApplyFilters = (filters: {
    departments: Array<{ id: string; checked: boolean }>;
    workTypes: Array<{ id: string; checked: boolean }>;
    searchTerm: string;
  }) => {
    setAppliedFilters({
      departments: filters.departments
        .filter((d) => d.checked)
        .map((d) => d.id),
      workTypes: filters.workTypes.filter((w) => w.checked).map((w) => w.id),
      searchTerm: filters.searchTerm,
    });
  };

  const filteredEmployees = employees.filter((emp) => {
    // Filter by search term
    if (
      appliedFilters.searchTerm &&
      !emp.name.toLowerCase().includes(appliedFilters.searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Filter by department
    if (
      appliedFilters.departments.length > 0 &&
      !appliedFilters.departments.includes(emp.department.toLowerCase())
    ) {
      return false;
    }

    // Filter by work type
    if (
      appliedFilters.workTypes.length > 0 &&
      !appliedFilters.workTypes.includes(
        emp.type?.replace(" ", "-").toLowerCase()
      )
    ) {
      return false;
    }

    return true;
  });

  return (
    <Card className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <SearchInput />
        <div className="flex gap-4">
          <AddNewEmployeeButton />
          <Button
            variant="outline"
            onClick={() => setIsFilterOpen(true)}
            className="border-hrms-gray/20 hover:bg-primary hover:text-white px-6 py-3 rounded-lg transition-all duration-200"
          >
            <TbFilterPlus style={{ width: "20px", height: "20px" }} />
            Filter
          </Button>
        </div>
      </div>
      <EmployeesTable employees={filteredEmployees} />
      <FilterDialog
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        onApplyFilters={handleApplyFilters}
      />
    </Card>
  );
}

export default function EmployeesPage() {
  return <EmployeesCard employees={employees} />;
}
