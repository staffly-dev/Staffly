import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
import {
  Employee,
  CreateEmployeeData,
  UpdateEmployeeData,
  EmployeeResponse,
  EmployeesResponse,
} from "@/types/employee";
import { useRouter } from "next/navigation";

// Query keys
export const employeeKeys = {
  all: ["employees"] as const,
  lists: () => [...employeeKeys.all, "list"] as const,
  list: (filters: string) => [...employeeKeys.lists(), { filters }] as const,
  details: () => [...employeeKeys.all, "detail"] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
};

// Fetch all employees
export const useEmployees = () => {
  return useQuery({
    queryKey: employeeKeys.lists(),
    queryFn: async (): Promise<Employee[]> => {
      const response = await axiosInstance.get<EmployeesResponse>(
        "/hrms/employees/getAllEmployees"
      );
      return response.data.employees;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Fetch single employee by ID
export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: async (): Promise<Employee> => {
      const response = await axiosInstance.get<EmployeeResponse>(
        `/hrms/employees/getEmployee/${id}`
      );
      return response.data.employee;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Add new employee
export const useAddEmployee = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async (employeeData: CreateEmployeeData): Promise<Employee> => {
      const response = await axiosInstance.post<EmployeeResponse>(
        "/hrms/employees/addEmployee",
        employeeData
      );
      return response.data.employee;
    },
    onSuccess: (newEmployee) => {
      // Invalidate and refetch employees list
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });

      // Update the cache with the new employee
      queryClient.setQueryData(
        employeeKeys.lists(),
        (old: Employee[] | undefined) => {
          return old ? [...old, newEmployee] : [newEmployee];
        }
      );
      router.push(`/all-employees/${newEmployee._id}`);
    },
  });
};

// Update employee
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      employeeId,
      employeeData,
    }: {
      employeeId: string;
      employeeData: UpdateEmployeeData;
    }): Promise<Employee> => {
      const response = await axiosInstance.put<EmployeeResponse>(
        `/hrms/employees/updateEmployee/${employeeId}`,
        employeeData
      );
      return response.data.employee;
    },
    onSuccess: (updatedEmployee, { employeeId }) => {
      // Invalidate and refetch employees list
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });

      // Update the specific employee in cache
      queryClient.setQueryData(
        employeeKeys.detail(employeeId),
        updatedEmployee
      );

      // Update the employee in the list cache
      queryClient.setQueryData(
        employeeKeys.lists(),
        (old: Employee[] | undefined) => {
          return old
            ? old.map((emp) => (emp._id === employeeId ? updatedEmployee : emp))
            : old;
        }
      );
    },
  });
};

// Delete employee
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await axiosInstance.delete(`/hrms/employees/deleteEmployee/${id}`);
    },
    onSuccess: (_, id) => {
      // Invalidate and refetch employees list
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });

      // Remove the employee from the list cache
      queryClient.setQueryData(
        employeeKeys.lists(),
        (old: Employee[] | undefined) => {
          return old ? old.filter((emp) => emp._id !== id) : old;
        }
      );

      // Remove the specific employee from cache
      queryClient.removeQueries({ queryKey: employeeKeys.detail(id) });
    },
  });
};
