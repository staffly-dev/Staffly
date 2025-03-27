import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CiCirclePlus } from "react-icons/ci";

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


