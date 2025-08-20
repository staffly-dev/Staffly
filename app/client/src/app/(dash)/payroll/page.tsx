"use client";

import { Pagination } from "@/components/Pagination";
import { SearchInput } from "@/components/searchInput";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { CustomTableContainer } from "../all-employees/components/CustomTableContainer";
import { CiCirclePlus, CiExport } from "react-icons/ci";
import { toast } from "sonner";
import Link from "next/link";
import { Payroll, usePayRoll } from "@/context/PayRollContext";
import ErrorComponent from "@/components/ErrorComponent";
import LoadingComponent from "@/components/LoadingComponent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EditPayrollModal } from "./EditPayrollModel";

const colors = {
  completed: "bg-green-500/20 text-green-500",
  pending: "bg-yellow-500/20 text-yellow-500",
};

export default function PayrollPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [payrollsData, setPayrollsData] = useState<Payroll[]>([]);
  const { payrolls, fetchPayrolls, isLoadingPayrolls, error, clearError } =
    usePayRoll();

  useEffect(() => {
    fetchPayrolls();
  }, [fetchPayrolls]);

  useEffect(() => {
    setPayrollsData(
      payrolls.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )
    );
  }, [currentPage, itemsPerPage, payrolls]);

  if (error) {
    return <ErrorComponent error={error} clearError={clearError} />;
  }

  if (isLoadingPayrolls) {
    return <LoadingComponent className="h-[60vh]" />;
  }

  return (
    <Card className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <SearchInput />
        <div className="flex gap-6">
          <Link href="/payroll/new-payroll">
            <Button>
              <CiCirclePlus style={{ width: "20px", height: "20px" }} />
              Add New Payroll
            </Button>
          </Link>
          <div className="flex gap-4">
            <Button
              onClick={() => {
                toast.warning("Exporting is not available yet", {
                  description: "Please wait for the feature to be available",
                  position: "top-center",
                  cancel: {
                    label: "Cancel",
                    onClick: () => {},
                  },
                });
              }}
            >
              <span>
                <CiExport style={{ width: "20px", height: "20px" }} />
              </span>
              Export
            </Button>
          </div>
        </div>
      </div>
      <PayrollTable payrolls={payrolls} />
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(payrollsData.length / itemsPerPage)}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={payrollsData.length}
        onItemsPerPageChange={setItemsPerPage}
      />
    </Card>
  );
}

function PayrollTable({ payrolls }: { payrolls: Payroll[] }) {
  const { deletePayroll, deleteLoading } = usePayRoll();
  const [openEditPayrollModal, setOpenEditPayrollModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);

  const handleDeletePayroll = (id: string) => {
    toast.warning("Are you sure you want to delete this payroll?", {
      position: "top-center",
      action: {
        label: "Delete",
        onClick: () => {
          deletePayroll(id).then((res) => {
            toast.success(res);
          });
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  return (
    <CustomTableContainer>
      <thead className="sticky top-0 bg-background shadow-sm">
        <tr className="*:px-6 *:py-4 *:text-left *:text-xs *:font-medium *:text-gray-500 *:uppercase border-b border-hrms-gray/20">
          <th>Employee Name</th>
          <th>CTC</th>
          <th>Salary Per Month</th>
          <th>Deduction</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-hrms-gray/20">
        {payrolls.map((payroll) => (
          <tr
            key={payroll._id}
            className="hover:bg-hrms-gray/20 *:px-6 *:py-3 *:capitalize"
          >
            <td>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    className="object-cover"
                    src={payroll.employeeId.profilePicture || ""}
                    alt={
                      payroll.employeeId.firstName +
                      " " +
                      payroll.employeeId.lastName
                    }
                  />
                  <AvatarFallback>
                    {payroll.employeeId?.firstName.charAt(0) +
                      payroll.employeeId?.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {payroll.employeeId.firstName +
                  " " +
                  payroll.employeeId.lastName}
              </div>
            </td>
            <td>{payroll.ctc}</td>
            <td>{payroll.salaryByMonth}</td>
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
            <td className="px-6 py-3">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedPayroll(payroll);
                    setOpenEditPayrollModal(true);
                  }}
                  className="hover:text-primary"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeletePayroll(payroll._id)}
                  className="hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={deleteLoading}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        ))}
        {!payrolls ||
          (payrolls.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center pt-4 text-yellow-500">
                No payrolls yet
              </td>
            </tr>
          ))}
      </tbody>
      <EditPayrollModal
        open={openEditPayrollModal}
        onOpenChange={setOpenEditPayrollModal}
        payroll={selectedPayroll as Payroll}
      />
    </CustomTableContainer>
  );
}
