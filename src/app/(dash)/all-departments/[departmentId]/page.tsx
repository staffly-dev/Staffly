import { notFound } from "next/navigation";
import { EmployeesCard, employees } from "../../all-employees/page";

export default async function DepartmentPage({
  params,
}: {
  params: Promise<{ departmentId: string }>;
}) {
  const { departmentId } = await params;
  if ( departmentId !== "design-department") {
    notFound();
  }

  return (
    // <Card className="bg-transparent border-hrms-gray/20 container mx-auto p-6">
    //   <div className="flex justify-between items-center mb-6">
    //     <SearchInput/>
    //     <div className="flex gap-4">
    //       <AddNewEmployeeButton/>
    //       <FilterButton/>
    //     </div>
    //   </div>
    //   <EmployeesTable employees={employees} />
    // </Card>
    <EmployeesCard employees={employees} />
  );
}
