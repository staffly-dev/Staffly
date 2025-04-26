import { notFound } from "next/navigation";
import { EmployeesCard, employees } from "../../all-employees/page";

export default async function DepartmentPage({
  params,
}: {
  params: Promise<{ departmentId: string }>;
}) {
  const { departmentId } = await params;
  if (departmentId !== "design-department") {
    notFound();
  }

  return <EmployeesCard employees={employees} />;
}
