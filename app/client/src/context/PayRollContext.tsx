"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import axiosInstance from "@/lib/axiosInstance";

// Types for Dashboard
export interface CreatePayRollRequest {
  employeeId: string;
  ctc: number;
  salaryByMonth: number;
  deduction: number;
}

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
}

export interface Payroll {
  _id: string;
  employeeId: Employee;
  ctc: number;
  salaryByMonth: number;
  deduction?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface PayrollResponse {
  message: string;
  payroll: Payroll;
}

interface PayrollsSearchParams {
  firstName?: string;
  lastName?: string;
}

interface PayrollsResponse {
  message: string;
  payroll: Payroll[];
}

// Context State Interface
interface PayRollContextType {
  // Payroll
  createPayroll: (
    data: CreatePayRollRequest
  ) => Promise<PayrollResponse | null>;
  fetchPayrolls: (
    params?: PayrollsSearchParams
  ) => Promise<PayrollsResponse | null>;
  updatePayroll: (
    id: string,
    data: CreatePayRollRequest | null
  ) => Promise<PayrollResponse | null>;
  deletePayroll: (id: string) => Promise<string>;
  fetchPayrollSearch: (
    params?: PayrollsSearchParams
  ) => Promise<PayrollsResponse | null>;

  // Error handling
  error: string | null;
  clearError: () => void;
  payrolls: Payroll[];
  isLoadingPayrolls: boolean;
  deleteLoading: boolean;
}

const PayRollContext = createContext<PayRollContextType | undefined>(undefined);

export function PayRollProvider({ children }: { children: ReactNode }) {
  // Payroll state
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [isLoadingPayrolls, setIsLoadingPayrolls] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Payroll functions
  const fetchPayrolls = useCallback(async (): Promise<PayrollsResponse> => {
    try {
      setIsLoadingPayrolls(true);
      setError(null);
      const response = await axiosInstance.get("/payroll/getAllPayroll");
      const payrolls = response.data.payroll;
      setPayrolls(payrolls);
      return {
        message: "Payrolls fetched successfully",
        payroll: payrolls,
      };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch payroll data";
      setError(errorMessage);
      return {
        message: errorMessage,
        payroll: [],
      };
    } finally {
      setIsLoadingPayrolls(false);
    }
  }, []);

  // Payroll functions
  const createPayroll = useCallback(
    async (data: CreatePayRollRequest): Promise<PayrollResponse> => {
      try {
        setIsLoadingPayrolls(true);
        setError(null);
        const response = await axiosInstance.post(
          "/payroll/createPayroll",
          data
        );
        const payroll = response.data.payroll;
        setPayrolls((prev) => [...prev, payroll]);
        return {
          message: "Payroll created successfully",
          payroll,
        };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create payroll";
        setError(errorMessage);
      } finally {
        setIsLoadingPayrolls(false);
      }
    },
    []
  );

  // Payroll search functions
  const fetchPayrollSearch = useCallback(
    async (params?: PayrollsSearchParams): Promise<PayrollsResponse> => {
      try {
        setIsLoadingPayrolls(true);
        setError(null);
        const response = await axiosInstance.get("/payroll/search", {
          params,
        });
        const payrolls = response.data.payroll;
        setPayrolls(payrolls);
        return {
          message: "Payroll search fetched successfully",
          payroll: payrolls,
        };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch payroll records";
        setError(errorMessage);
      } finally {
        setIsLoadingPayrolls(false);
      }
    },
    []
  );

  const updatePayroll = useCallback(
    async (
      id: string,
      data: CreatePayRollRequest
    ): Promise<PayrollResponse> => {
      try {
        setError(null);
        const response = await axiosInstance.put(
          `/payroll/updatePayroll/${id}`,
          data
        );
        return {
          message: "Payroll updated successfully",
          payroll: response.data.payroll,
        };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update payroll";
        setError(errorMessage);
        return {
          message: errorMessage,
          payroll: null,
        };
      }
    },
    []
  );

  // Payroll functions
  const deletePayroll = useCallback(async (id: string): Promise<string> => {
    try {
      setDeleteLoading(true);
      setError(null);
      await axiosInstance.delete(`/payroll/deletePayroll/${id}`);
      setPayrolls((prev) => prev.filter((payroll) => payroll._id !== id));
      return "Payroll deleted successfully";
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete payroll";
      setError(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  }, []);

  // Error handling
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: PayRollContextType = {
    // Payroll
    payrolls,
    isLoadingPayrolls,
    fetchPayrolls,

    // Payroll
    createPayroll,
    fetchPayrollSearch,
    updatePayroll,
    deletePayroll,
    deleteLoading,
    // Error handling
    error,
    clearError,
  };

  return (
    <PayRollContext.Provider value={value}>{children}</PayRollContext.Provider>
  );
}

export function usePayRoll() {
  const context = useContext(PayRollContext);
  if (!context) {
    throw new Error("usePayRoll must be used within a PayRollProvider");
  }
  return context;
}
