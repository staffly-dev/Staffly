import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CiCirclePlus } from "react-icons/ci";

export function AddNewEmployeeButton() {
  return (
    <Link href="/all-employees/add-new-employee">
      <Button>
        <CiCirclePlus style={{ width: "24px", height: "24px" }} />
        Add New Employee
      </Button>
    </Link>
  );
}
