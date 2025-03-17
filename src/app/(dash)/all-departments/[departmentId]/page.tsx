import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { EmployeesTable } from "../../all-employees/components/EmployeesTable";
import { SearchInput } from "@/components/searchInput";
import { AddNewEmployeeButton, FilterButton } from "../../all-employees/components/Buttons";
import { employees } from "../../all-employees/page";

export default async function DepartmentPage({
  params,
}: {
  params: { departmentId: string };
}) {
  if (params.departmentId !== "design-department") {
    notFound();
  }

  return (
    <Card className="bg-transparent border-hrms-gray/20 container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <SearchInput/>
        <div className="flex gap-4">
          <AddNewEmployeeButton/>
          <FilterButton/>
        </div>
      </div>
      <EmployeesTable employees={employees} />
    </Card>
  );
}
