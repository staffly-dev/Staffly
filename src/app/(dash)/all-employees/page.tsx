import { Card } from "@/components/ui/card";
import { Employee } from "@/types/employee";
import { EmployeesTable } from "./components/EmployeesTable";
import { AddNewEmployeeButton, FilterButton } from "./components/Buttons";
import { SearchInput } from "@/components/searchInput";

export const employees: Employee[] = [
  ...Array.from({ length: 74 }).map((_, i) => ({
    id: `${i + 7893222}`,
    name: `Employee ${i + 7893222}`,
    department: i % 2 === 0 ? "Development" : "HR",
    avatar: "/imgs/user.png",
    designation: i % 2 === 0 ? "UI/UX Designer" : "Frontend Developer",
    type: i % 2 === 0 ? "Office" : "Remote",
    status: i % 3 === 0 ? "Permanent" : "Contractor",
  })),
];

export default function EmployeesPage() {
  return (
    <Card className="bg-transparent border-hrms-gray/20 container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <SearchInput />
        <div className="flex gap-4">
          <AddNewEmployeeButton />
          <FilterButton />
        </div>
      </div>
      <EmployeesTable employees={employees} />
    </Card>
  );
}
