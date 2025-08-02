"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import axiosInstance from "../lib/axiosInstance";
import {
  Employee,
  CreateEmployeeData,
  UpdateEmployeeData,
  EmployeeResponse,
  EmployeesResponse,
} from "../types/employee";

interface EmployeeContextType {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  DeleteLoading: boolean;
  addEmployee: (employeeData: CreateEmployeeData) => Promise<Employee>;
  getAllEmployees: () => Promise<Employee[]>;
  getEmployeeById: (id: string) => Promise<Employee>;
  updateEmployee: (
    id: string,
    employeeData: UpdateEmployeeData
  ) => Promise<Employee>;
  deleteEmployee: (id: string) => Promise<void>;
  clearError: () => void;
  singleEmployee: Employee | null;
  singleLoading: boolean;
  singleError: string | null;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(
  undefined
);

export function EmployeeProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [DeleteLoading, setDeleteLoading] = useState(false);
  const [singleEmployee, setSingleEmployee] = useState<Employee | null>(null);
  const [singleLoading, setSingleLoading] = useState(false);
  const [singleError, setSingleError] = useState<string | null>(null);
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const addEmployee = useCallback(
    async (employeeData: CreateEmployeeData): Promise<Employee> => {
      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.post<EmployeeResponse>(
          "/employees/addEmployee",
          employeeData
        );

        const newEmployee = response.data.employee;
        setEmployees((prev) => [...prev, newEmployee]);
        return newEmployee;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add employee";
        setError(errorMessage);
        console.log(err);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getAllEmployees = useCallback(async (): Promise<Employee[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get<EmployeesResponse>(
        "/employees/getAllEmployees"
      );

      const employeesList = response.data.employees;
      setEmployees(employeesList);
      return employeesList;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch employees";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getEmployeeById = useCallback(async (id: string): Promise<Employee> => {
    setSingleLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get<EmployeeResponse>(
        `/employees/getEmployee/${id}`
      );

      const employee = response.data.employee;
      setSingleEmployee(employee);
      return employee;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch employee";
      setError(errorMessage);
      setSingleError(errorMessage);
    } finally {
      setSingleLoading(false);
    }
  }, []);

  const updateEmployee = useCallback(
    async (id: string, employeeData: UpdateEmployeeData): Promise<Employee> => {
      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.put<EmployeeResponse>(
          `/employees/updateEmployee/${id}`,
          employeeData
        );

        // Server returns { message: string, employee: Employee }
        const updatedEmployee = response.data.employee;
        setEmployees((prev) =>
          prev.map((emp) => (emp._id === id ? updatedEmployee : emp))
        );
        return updatedEmployee;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update employee";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteEmployee = useCallback(async (id: string): Promise<void> => {
    setDeleteLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.delete(
        `/employees/deleteEmployee/${id}`
      );

      if (response.status === 200) {
        setEmployees((prev) => prev.filter((emp) => emp._id !== id));
      } else {
        throw new Error("Failed to delete employee");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete employee";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  }, []);

  const value: EmployeeContextType = {
    employees,
    loading,
    error,
    addEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    clearError,
    DeleteLoading,
    singleEmployee,
    singleLoading,
    singleError,
  };

  return (
    <EmployeeContext.Provider value={value}>
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployee() {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error("useEmployee must be used within an EmployeeProvider");
  }
  return context;
}
