"use client";
import { SearchInput } from "@/components/searchInput";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CiCirclePlus } from "react-icons/ci";
import { CustomTableContainer } from "../all-employees/[employeeId]/page";
import { useState } from "react";
import { NewEventDialog } from "./NewEventDialog";
import { format } from "date-fns";

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
  const [holidays, setHolidays] = useState(data);

  const handleAddHoliday = ({ name, date }: { name: string; date: Date }) => {
    const newHoliday: Holiday = {
      name,
      date: format(date, "MMMM dd, yyyy"),
      day: format(date, "EEEE").toLowerCase(),
      upcoming: date > new Date(),
    };

    setHolidays((prev) => [...prev, newHoliday]);
  };

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

      <NewEventDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onAddHoliday={handleAddHoliday}
      />
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
