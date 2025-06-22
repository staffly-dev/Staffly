"use client";

import { Pagination } from "@/components/Pagination";
import { SearchInput } from "@/components/searchInput";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { CustomTableContainer } from "../all-employees/[employeeId]/page";
import Image from "next/image";
import { CiExport } from "react-icons/ci";
type Payroll = {
  id: string;
  name: string;
  avatar: string;
  ctc: number;
  status: "completed" | "pending";
  salaryPerMonth: number;
  deduction: number;
};

const payrollsdata: Payroll[] = [
  {
    id: "1",
    name: "John Doe",
    avatar: "/imgs/avatar.png",
    ctc: 10000,
    status: "completed",
    salaryPerMonth: 10000,
    deduction: 100,
  },
  {
    id: "2",
    name: "Jane Doe",
    avatar: "/imgs/avatar.png",
    ctc: 104000,
    status: "pending",
    salaryPerMonth: 10000,
    deduction: 100,
  },
  {
    id: "3",
    name: "John Doe",
    avatar: "/imgs/avatar.png",
    ctc: 34000,
    status: "completed",
    salaryPerMonth: 3000,
    deduction: 100,
  },
  {
    id: "4",
    name: "John Doe",
    avatar: "/imgs/avatar.png",
    ctc: 34000,
    status: "pending",
    salaryPerMonth: 3000,
    deduction: 100,
  },
];

const colors = {
  completed: "bg-green-500/20 text-green-500",
  pending: "bg-yellow-500/20 text-yellow-500",
};

export default function PayrollPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);

  useEffect(() => {
    setPayrolls(
      payrollsdata.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )
    );
  }, [currentPage, itemsPerPage]);

  return (
    <Card className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <SearchInput />
        <div className="flex gap-4">
          <Button
            onClick={() => {
              console.log("exported ");
            }}
          >
            <span>
              <CiExport style={{ width: "20px", height: "20px" }} />
            </span>
            Export
          </Button>
        </div>
      </div>
      <PayrollTable payrolls={payrolls} />
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(payrollsdata.length / itemsPerPage)}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={payrollsdata.length}
        onItemsPerPageChange={setItemsPerPage}
      />
    </Card>
  );
}

function PayrollTable({ payrolls }: { payrolls: Payroll[] }) {
  return (
    <CustomTableContainer>
      <thead className="sticky top-0 bg-background shadow-sm">
        <tr className="*:px-6 *:py-4 *:text-left *:text-xs *:font-medium *:text-gray-500 *:uppercase border-b border-hrms-gray/20">
          <th>Employee Name</th>
          <th>CTC</th>
          <th>Salary Per Month</th>
          <th>Deduction</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-hrms-gray/20">
        {payrolls.map((payroll) => (
          <tr
            key={payroll.id}
            className="hover:bg-hrms-gray/20 *:px-6 *:py-3 *:capitalize"
          >
            <td>
              <div className="flex items-center gap-2">
                <Image
                  src={payroll.avatar}
                  alt={payroll.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                {payroll.name}
              </div>
            </td>
            <td>{payroll.ctc}</td>
            <td>{payroll.salaryPerMonth}</td>
            <td>{payroll.deduction}</td>
            <td className="  px-4 py-2">
              <span
                className={`rounded-lg text-xs px-2 py-1 ${
                  colors[payroll.status]
                }`}
              >
                {payroll.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </CustomTableContainer>
  );
}
