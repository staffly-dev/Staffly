import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CiCirclePlus } from "react-icons/ci";
import { TbFilterPlus } from "react-icons/tb";

export function AddNewEmployeeButton() {
  return (
    <Link href="/all-employees/add-new-employee">
      <Button className="text-white bg-primary hover:bg-primary-700 px-6 py-3 rounded-lg flex items-center gap-2">
        <CiCirclePlus style={{ width: "24px", height: "24px" }} />
        Add New Employee
      </Button>
    </Link>
  );
}

export function FilterButton() {
  return (
    <Button
      variant="outline"
      className="border-hrms-gray/20 hover:bg-primary hover:text-white px-6 py-3 rounded-lg"
    >
      <TbFilterPlus style={{ width: "20px", height: "20px" }} />
      Filter
    </Button>
  );
}
