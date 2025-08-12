import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CreatePayRollRequest,
  Payroll,
  usePayRoll,
} from "@/context/PayRollContext";
import { Controller, useForm } from "react-hook-form";
import {
  NewPayrollFormData,
  newPayrollSchema,
} from "@/lib/validations/newPayroll";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import ErrorComponent from "@/components/ErrorComponent";
import { Select } from "@/components/ui/select";
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useEmployee } from "@/context/EmployeeContext";
import { useEffect } from "react";

interface EditPayrollModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payroll: Payroll;
}

export function EditPayrollModal({
  open,
  onOpenChange,
  payroll,
}: EditPayrollModalProps) {
  const { updatePayroll, error, clearError } = usePayRoll();
  const {
    employees,
    getAllEmployees,
    loading,
    error: employeeError,
    clearError: clearEmployeeError,
  } = useEmployee();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<NewPayrollFormData>({
    resolver: zodResolver(newPayrollSchema),
  });

  useEffect(() => {
    if (!employees || employees.length === 0) {
      getAllEmployees();
    }
  }, [employees, getAllEmployees]);

  // Reset form with new payroll data whenever payroll changes
  useEffect(() => {
    if (payroll) {
      reset({
        employeeId: payroll.employeeId._id,
        ctc: payroll.ctc,
        salaryByMonth: payroll.salaryByMonth,
        deduction: payroll.deduction || 0,
      });
    }
  }, [payroll, reset]);

  const onFormSubmit = async (data: NewPayrollFormData) => {
    await updatePayroll(payroll._id, data as CreatePayRollRequest).then(
      (res) => {
        toast.success(res.message, {
          position: "top-center",
        });
        reset();
        onOpenChange(false);
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Payroll</DialogTitle>
        </DialogHeader>
        {error ? (
          <ErrorComponent error={error} clearError={clearError} />
        ) : (
          <form
            onSubmit={handleSubmit(onFormSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <Label>Select Employee</Label>
              {employeeError ? (
                <ErrorComponent
                  error={employeeError}
                  clearError={clearEmployeeError}
                />
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
                                      employee.firstName +
                                      " " +
                                      employee.lastName
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
                <p className="text-sm text-red-500 mt-1">
                  {errors.ctc.message}
                </p>
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
        )}
      </DialogContent>
    </Dialog>
  );
}
