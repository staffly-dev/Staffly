"use client";
import React, { useMemo } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CiSearch } from "react-icons/ci";
import Link from "next/link";
import { FaChevronRight } from "react-icons/fa6";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { Employee } from "@/types/employee";
import { useEmployees } from "@/hooks/useEmployees";

export default function Page() {
  const { data: employees = [], isLoading, error } = useEmployees();

  // Use useMemo to compute departments only when employees change
  const departments = useMemo(() => {
    if (!employees || employees.length === 0) return {};

    return employees.reduce((acc, employee) => {
      const department = employee.department;
      if (!acc[department]) {
        acc[department] = [];
      }
      acc[department].push(employee);
      return acc;
    }, {} as Record<string, Employee[]>);
  }, [employees]);

  // Remove the problematic useEffect and console.logs
  // The departments will be computed automatically when employees change

  if (isLoading) {
    return <LoadingComponent className="h-[60vh]" />;
  }

  if (error) {
    return <ErrorComponent error={error.message} clearError={() => {}} />;
  }

  return (
    <Card className="border-hrms-gray/20 bg-transparent p-4">
      <div className="w-60 relative mb-5">
        <Input
          type="search"
          name="search"
          id="search"
          placeholder="Search..."
          className="w-full pl-8 pr-4 outline-hrms-gray/20 border-hrms-gray/20"
        />
        <CiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(departments).map(([dept, members], index) => (
          <Card key={index} className="bg-transparent p-3 border-hrms-gray/20">
            <div className="flex justify-between items-center pb-3 border-b-2 border-hrms-gray/20">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {dept}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {members.length} Members
                </p>
              </div>
              <Link
                href={`all-departments/${dept
                  .toLowerCase()
                  .split(" ")
                  .join("-")}`}
                className="text-primary hover:text-primary-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4 pt-3">
              {members.slice(0, 5).map((member, memberIndex) => (
                <div
                  key={memberIndex}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10">
                      <Image
                        src={member.profilePicture}
                        alt={member.firstName}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {member.firstName} {member.lastName}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {member.designation}
                      </p>
                    </div>
                  </div>
                  <Link href={`/all-employees/${member._id}`}>
                    <FaChevronRight />
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}
