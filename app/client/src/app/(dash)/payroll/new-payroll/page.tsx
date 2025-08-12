"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEmployee } from "@/context/EmployeeContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import ErrorComponent from "@/components/ErrorComponent";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  newPayrollSchema,
  NewPayrollFormData,
} from "@/lib/validations/newPayroll";
import { Button } from "@/components/ui/button";
import { CreatePayRollRequest, usePayRoll } from "@/context/PayRollContext";

export default function NewPayrollPage() {
  const { employees, getAllEmployees, loading, error, clearError } =
    useEmployee();
  const {
    createPayroll,
    error: payrollError,
    clearError: clearPayrollError,
  } = usePayRoll();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewPayrollFormData>({
    resolver: zodResolver(newPayrollSchema),
  });
  useEffect(() => {
    if (!employees || employees.length === 0) {
      getAllEmployees();
    }
  }, [employees, getAllEmployees]);

  const onSubmit = async (data: NewPayrollFormData) => {
    const payrollData: CreatePayRollRequest = {
      employeeId: data.employeeId,
      ctc: data.ctc,
      salaryByMonth: data.salaryByMonth,
      deduction: data.deduction,
    };
    const response = await createPayroll(payrollData);
    if (response) {
      console.log(response);
      toast.success(response.message, {
        position: "top-center",
      });
      reset();
    }
  };

  if (payrollError) {
    return (
      <ErrorComponent error={payrollError} clearError={clearPayrollError} />
    );
  }

  return (
    <Card className="container mx-auto p-6">
      <CardHeader>
        <CardTitle className="text-2xl">
          Register a New Payroll for an Employee
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Select Employee</Label>
            {error ? (
              <ErrorComponent error={error} clearError={clearError} />
            ) : (
              <Controller
                name="employeeId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {loading ? (
                        <SelectItem value="loading" disabled>
                          Loading Employees...
                        </SelectItem>
                      ) : (
                        employees?.map((employee) => (
                          <SelectItem
                            key={employee._id}
                            value={employee._id}
                            className="cursor-pointer"
                          >
                            <div className="flex gap-2 items-center">
                              <Avatar className="w-8 h-8">
                                <AvatarImage
                                  className="object-cover"
                                  src={employee.profilePicture}
                                  alt={
                                    employee.firstName + " " + employee.lastName
                                  }
                                />
                                <AvatarFallback>
                                  {employee.firstName.charAt(0)}
                                  {employee.lastName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <p>
                                {employee.firstName} {employee.lastName}
                              </p>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
            {errors.employeeId && (
              <p className="text-sm text-red-500 mt-1">
                {errors.employeeId.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label>Cost To Company</Label>
            <Input
              type="number"
              {...register("ctc", { valueAsNumber: true })}
              placeholder="Enter CTC"
            />
            {errors.ctc && (
              <p className="text-sm text-red-500 mt-1">{errors.ctc.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label>Salary Per Month</Label>
            <Input
              type="number"
              {...register("salaryByMonth", { valueAsNumber: true })}
              placeholder="Enter Salary Per Month"
            />
            {errors.salaryByMonth && (
              <p className="text-sm text-red-500 mt-1">
                {errors.salaryByMonth.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label>Deduction</Label>
            <Input
              type="number"
              {...register("deduction", { valueAsNumber: true })}
              placeholder="Enter Deduction"
            />
            {errors.deduction && (
              <p className="text-sm text-red-500 mt-1">
                {errors.deduction.message}
              </p>
            )}
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Payroll"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
