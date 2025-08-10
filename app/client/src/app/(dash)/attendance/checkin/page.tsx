"use client";
import { Card } from "@/components/ui/card";
import { Employee } from "@/types/employee";
import { EmployeesTable } from "./components/EmployeesTable";
import { AddNewEmployeeButton } from "./components/Buttons";
import { SearchInput } from "@/components/searchInput";
import { FilterDialog } from "./components/FilterDialog";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { TbFilterPlus } from "react-icons/tb";
import { useEmployee } from "@/context/EmployeeContext";

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
      !emp.firstName
        .toLowerCase()
        .includes(appliedFilters.searchTerm.toLowerCase())
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
        emp.employeeType?.replace(" ", "-").toLowerCase()
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
  const { employees, getAllEmployees } = useEmployee();

  useEffect(() => {
    getAllEmployees();
  }, [getAllEmployees]);

  return <EmployeesCard employees={employees} />;
}
