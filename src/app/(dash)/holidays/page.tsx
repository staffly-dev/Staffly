"use client";
import { SearchInput } from "@/components/searchInput";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { CustomTableContainer } from "../all-employees/[employeeId]/page";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import DatePicker from "react-datepicker";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";

const FormSchema = z.object({
  dob: z.date({
    required_error: "A date of birth is required.",
  }),
});

type Holiday = {
  day: string;
  date: string;
  name: string;
  upcoming: boolean;
};

const data: Holiday[] = [
  {
    day: "tuesday",
    date: "January 01, 2023",
    name: "International Programmers' Day",
    upcoming: false,
  },
  {
    day: "tuesday",
    date: "January 04, 2023",
    name: "International Programmers' Day",
    upcoming: false,
  },
  {
    day: "friday",
    date: "January 09, 2023",
    name: "Merry Chrismas",
    upcoming: false,
  },
  {
    day: "jjj",
    date: "January 07, 2025",
    name: "International Programmers' Day",
    upcoming: true,
  },
  {
    day: "monday",
    date: "January 07, 2026",
    name: "International Programmers' Day",
    upcoming: true,
  },
  {
    day: "tuesday",
    date: "January 07, 2023",
    name: "Mazin' Day",
    upcoming: true,
  },
  {
    day: "saturday",
    date: "January 11, 2023",
    name: "International Programmers' Day",
    upcoming: true,
  },
];

export default function HolidaysPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [holidayName, setHolidayName] = useState("");
  const [holidayDate, setHolidayDate] = useState(null);
  const [holidays, setHolidays] = useState(data);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between pb-4">
        <SearchInput />
        <Button onClick={() => setIsOpen(true)}>
          <span>
            <CiCirclePlus style={{ width: "20px", height: "20px" }} />
          </span>
          Add New Event
        </Button>
      </div>
      <HolidaysTable holidays={holidays} />
      <div className="flex gap-6">
        <div className="flex gap-2 items-center">
          <div className="w-2 h-2 rounded-full bg-primary"></div>
          <p className="font-bold">Upcoming</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="w-2 h-2 rounded-full bg-hrms-gray/20"></div>
          <p className="font-bold">Past Event</p>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-sm rounded-2xl p-8 flex flex-col items-center gap-6 shadow-xl">
          <Form {...form}>
            <form action="">
              <DialogHeader className="w-full">
                <DialogTitle className="text-lg font-bold mb-2 text-left w-full">
                  Add New Holiday
                </DialogTitle>
              </DialogHeader>
              <div className="w-full flex flex-col gap-4">
                <Input
                  id="name"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  placeholder="Holiday Name"
                  className="h-12 rounded-lg text-base placeholder:text-gray-400"
                />
                <div className="relative w-full">
                  <label className="mb-1 font-medium text-sm">
                    Holiday Date
                  </label>
                  <div className="relative">
                    <DatePicker
                      onChange={setHolidayDate}
                      value={holidayDate}
                      calendarIcon={null}
                      clearIcon={null}
                      format="y-MM-dd"
                      className="w-full h-12 rounded-lg border border-hrms-gray/20 px-3 text-base placeholder:text-gray-400 bg-white font-normal pr-10"
                      placeholderText="Select Date"
                    />
                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              <DialogFooter className="w-full flex gap-3 mt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 h-11 rounded-lg border-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={onSubmit}
                  className="flex-1 h-11 rounded-lg bg-primary text-white hover:bg-primary/90"
                >
                  Add
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function HolidaysTable({ holidays }: { holidays: Holiday[] }) {
  return (
    <CustomTableContainer>
      <thead className="sticky top-0 bg-background shadow-sm">
        <tr className="ml-1 *:w-[26%] flex *:px-6 *:py-4 *:text-left *:text-xs *:font-medium *:text-gray-500 *:uppercase border-b border-hrms-gray/20">
          <th>date</th>
          <th>day</th>
          <th>holiday name</th>
        </tr>
      </thead>
      <tbody className="*:border-b-2 *:border-b-hrms-gray/20">
        {holidays.map((leave) => (
          <tr
            key={leave.date}
            className={`flex *:w-[26%] flex-col-3 mt-2 border-l-4 ${
              leave.upcoming ? "border-l-primary" : "border-l-hrms-gray/20"
            } hover:bg-hrms-gray/20 *:px-6 *:py-2 *:capitalize`}
          >
            <td>{leave.date}</td>
            <td>{leave.day}</td>
            <td>{leave.name}</td>
          </tr>
        ))}
      </tbody>
    </CustomTableContainer>
  );
}
