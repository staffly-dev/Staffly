import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface AddJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    department: string;
    title: string;
    location: string;
    amount: number;
    type: "office" | "remote";
  }) => void;
}

export function AddJobModal({
  open,
  onOpenChange,
  onSubmit,
}: AddJobModalProps) {
  const [formData, setFormData] = useState({
    department: "",
    title: "",
    location: "",
    amount: 0,
    type: "office" as "office" | "remote",
  });

  const handleSubmit = () => {
    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Job</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Select
            value={formData.department}
            onValueChange={(value) =>
              setFormData({ ...formData, department: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HR">HR</SelectItem>
              <SelectItem value="IT">IT</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="Sales">Sales</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Enter Job Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />

          <Select
            value={formData.location}
            onValueChange={(value) =>
              setFormData({ ...formData, location: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sohag, Egypt">Sohag, Egypt</SelectItem>
              <SelectItem value="Assuit, Egypt">Assuit, Egypt</SelectItem>
              <SelectItem value="Bahij, Egypt">Bahij, Egypt</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder="Enter Amount"
            value={formData.amount || ""}
            onChange={(e) =>
              setFormData({ ...formData, amount: Number(e.target.value) })
            }
          />

          <div className="space-y-2">
            <Label>Select Type</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value: "office" | "remote") =>
                setFormData({ ...formData, type: value })
              }
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="office" id="office" />
                <Label htmlFor="office">Office</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="remote" id="remote" />
                <Label htmlFor="remote">Work from Home</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Add</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
