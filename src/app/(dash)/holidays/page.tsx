import { SearchInput } from "@/components/searchInput";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import React from "react";
import { CiCirclePlus } from "react-icons/ci";
import { CustomTableContainer } from "../all-employees/[employeeId]/page";

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
  return (
    <Card className="p-6">
      <div className="flex justify-between">
        <SearchInput />
        <Button>
          <span>
            <CiCirclePlus style={{ width: "20px", height: "20px" }} />
          </span>
          Add New Event
        </Button>
      </div>
      <HolidaysTable holidays={data} />
    </Card>
  );
}

function HolidaysTable({ holidays }: { holidays: Holiday[] }) {
  return (
    <CustomTableContainer>
      <thead className="sticky top-0 bg-background shadow-sm">
        <tr className="justify-between flex *:px-6 *:py-4 *:text-left *:text-xs *:font-medium *:text-gray-500 *:uppercase border-b border-hrms-gray/20">
          <th>date</th>
          <th>day</th>
          <th>holiday name</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-hrms-gray/20">
        {holidays.map((leave) => (
          <tr
            key={leave.date}
            className="flex flex-col-3 mt-2 border-l-4 border-l-primary hover:bg-hrms-gray/20 *:px-6 *:py-3 *:capitalize"
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
