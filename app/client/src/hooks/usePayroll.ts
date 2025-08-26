import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";

// Types
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
  employeeId: string;
  employee: Employee;
  ctc: number;
  salaryByMonth: number;
  deduction?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// interface PayrollResponse {
//   message: string;
//   payroll: Payroll;
// }

interface PayrollsSearchParams {
  firstName?: string;
  lastName?: string;
}

// interface PayrollsResponse {
//   message: string;
//   payroll: Payroll[];
// }

// Query keys
export const payrollKeys = {
  all: ["payroll"] as const,
  lists: () => [...payrollKeys.all, "list"] as const,
  list: (filters?: string) => [...payrollKeys.lists(), { filters }] as const,
  details: () => [...payrollKeys.all, "detail"] as const,
  detail: (id: string) => [...payrollKeys.details(), id] as const,
};

// Fetch all payrolls
export const usePayrolls = () => {
  return useQuery({
    queryKey: payrollKeys.lists(),
    queryFn: async (): Promise<Payroll[]> => {
      const response = await axiosInstance.get("/hrms/payroll/getAllPayroll");
      return response.data.payroll;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Search payrolls
export const usePayrollSearch = (params?: PayrollsSearchParams) => {
  return useQuery({
    queryKey: payrollKeys.list(JSON.stringify(params)),
    queryFn: async (): Promise<Payroll[]> => {
      const response = await axiosInstance.get("/hrms/payroll/search", {
        params,
      });
      return response.data.payroll;
    },
    enabled: !!params,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Create payroll
export const useCreatePayroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePayRollRequest): Promise<Payroll> => {
      const response = await axiosInstance.post(
        "/hrms/payroll/createPayroll",
        data
      );
      return response.data.payroll;
    },
    onSuccess: (newPayroll) => {
      // Invalidate and refetch payrolls list
      queryClient.invalidateQueries({ queryKey: payrollKeys.lists() });

      // Update the cache with the new payroll
      queryClient.setQueryData(
        payrollKeys.lists(),
        (old: Payroll[] | undefined) => {
          return old ? [...old, newPayroll] : [newPayroll];
        }
      );
    },
  });
};

// Update payroll
export const useUpdatePayroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: CreatePayRollRequest;
    }): Promise<Payroll> => {
      const response = await axiosInstance.put(
        `/hrms/payroll/updatePayroll/${id}`,
        data
      );
      return response.data.payroll;
    },
    onSuccess: (updatedPayroll, { id }) => {
      // Invalidate and refetch payrolls list
      queryClient.invalidateQueries({ queryKey: payrollKeys.lists() });

      // Update the specific payroll in cache
      queryClient.setQueryData(payrollKeys.detail(id), updatedPayroll);

      // Update the payroll in the list cache
      queryClient.setQueryData(
        payrollKeys.lists(),
        (old: Payroll[] | undefined) => {
          return old
            ? old.map((payroll) =>
                payroll._id === id ? updatedPayroll : payroll
              )
            : old;
        }
      );
    },
  });
};

// Delete payroll
export const useDeletePayroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      await axiosInstance.delete(`/hrms/payroll/deletePayroll/${id}`);
      return "Payroll deleted successfully";
    },
    onSuccess: (_, id) => {
      // Invalidate and refetch payrolls list
      queryClient.invalidateQueries({ queryKey: payrollKeys.lists() });

      // Remove the payroll from the list cache
      queryClient.setQueryData(
        payrollKeys.lists(),
        (old: Payroll[] | undefined) => {
          return old ? old.filter((payroll) => payroll._id !== id) : old;
        }
      );

      // Remove the specific payroll from cache
      queryClient.removeQueries({ queryKey: payrollKeys.detail(id) });
    },
  });
};
