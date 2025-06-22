import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CalendarIcon } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import { useState } from "react";
import { toast } from "sonner";

interface NewEventDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddHoliday: (holiday: { name: string; date: Date }) => void;
}

export function NewEventDialog({
  isOpen,
  onOpenChange,
  onAddHoliday,
}: NewEventDialogProps) {
  const [holidayName, setHolidayName] = useState("");
  const [holidayDate, setHolidayDate] = useState<Date | null>(null);

  const handleSubmit = () => {
    if (!holidayName.trim()) {
      toast.error("Please enter a holiday name");
      return;
    }
    if (!holidayDate) {
      toast.error("Please select a date");
      return;
    }

    onAddHoliday({
      name: holidayName.trim(),
      date: holidayDate,
    });

    // Reset form
    setHolidayName("");
    setHolidayDate(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl p-8 flex flex-col items-center gap-6 shadow-xl">
        <DialogHeader className="w-full">
          <DialogTitle className="text-xl font-bold mb-2 text-left w-full">
            Add New Holiday
          </DialogTitle>
        </DialogHeader>
        <div className="w-full flex flex-col gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              Holiday Name
            </label>
            <Input
              id="name"
              value={holidayName}
              onChange={(e) => setHolidayName(e.target.value)}
              placeholder="Enter holiday name"
              className="h-12 rounded-lg text-base placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Holiday Date
            </label>
            <div className="relative">
              <DatePicker
                selected={holidayDate}
                onChange={(date: Date | null) => setHolidayDate(date)}
                dateFormat="MMMM d, yyyy"
                className="w-full h-12 rounded-lg border border-hrms-gray/20 px-3 text-base placeholder:text-gray-400 bg-white font-normal pr-10 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                placeholderText="Select date"
                minDate={new Date()}
              />
              <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
        <DialogFooter className="w-full flex gap-3 mt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-11 rounded-lg border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 h-11 rounded-lg bg-primary text-white hover:bg-primary/90"
          >
            Add Holiday
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
