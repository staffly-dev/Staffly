import { TbFilterPlus } from "react-icons/tb";
import { Button } from "@/components/ui/button";

export default function FilterButton() {
  
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