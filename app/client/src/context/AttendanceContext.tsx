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
interface RecentActivity {
  type: string;
  description: string;
  timestamp: string;
}

interface DashboardData {
  totalEmployees: number;
  totalAttendance: number;
  totelApplicant: number;
  totalProjects: number;
  recentActivity: RecentActivity[];
}

interface EmployeeInfo {
  _id: string;
  firstName: string;
  lastName: string;
  designation: string;
  employeeType: string;
}

// Types for Attendance
interface AttendanceRecord {
  _id: string;
  employeeId: EmployeeInfo;
  date: string;
  checkInTime: string;
  checkOutTime: string | null;
  status: string;
}

interface CheckInRequest {
  employeeId: string;
  checkInTime?: string;
}

interface AttendanceSearchParams {
  firstName?: string;
  lastName?: string;
}

// Types for Settings
interface UserSettings {
  _id: string;
  userId: string;
  appearance: "light" | "dark";
  language: string;
  emailNotifications: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UpdateSettingsRequest {
  appearance?: "light" | "dark";
  language?: string;
  emailNotifications?: boolean;
}

// Context State Interface
interface AttendanceContextType {
  // Dashboard
  dashboardData: DashboardData | null;
  isLoadingDashboard: boolean;
  fetchDashboard: () => Promise<void>;

  // Attendance
  attendanceRecords: AttendanceRecord[];
  isLoadingAttendance: boolean;
  fetchAttendance: () => Promise<void>;
  fetchAttendanceById: (id: string) => Promise<AttendanceRecord | null>;
  checkIn: (data: CheckInRequest) => Promise<AttendanceRecord | null>;
  fetchAttendanceSearch: (params?: AttendanceSearchParams) => Promise<void>;
  // Settings
  userSettings: UserSettings | null;
  isLoadingSettings: boolean;
  fetchSettings: (userId: string) => Promise<void>;
  updateSettings: (
    userId: string,
    data: UpdateSettingsRequest
  ) => Promise<void>;

  // Error handling
  error: string | null;
  clearError: () => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(
  undefined
);

export function AttendanceProvider({ children }: { children: ReactNode }) {
  // Dashboard state
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  // Attendance state
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);

  // Settings state
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Dashboard functions
  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoadingDashboard(true);
      setError(null);
      const response = await axiosInstance.get("/dashboard");
      setDashboardData(response.data.dashboard);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch dashboard data";
      setError(errorMessage);
    } finally {
      setIsLoadingDashboard(false);
    }
  }, []);

  // Attendance functions
  const fetchAttendance = useCallback(async () => {
    try {
      setIsLoadingAttendance(true);
      setError(null);
      const response = await axiosInstance.get("/attendance/getAllAttendance ");
      setAttendanceRecords(response.data.attendance);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch attendance records";
      setError(errorMessage);
    } finally {
      setIsLoadingAttendance(false);
    }
  }, []);

  // Attendance search functions
  const fetchAttendanceSearch = useCallback(
    async (params?: AttendanceSearchParams) => {
      try {
        setIsLoadingAttendance(true);
        setError(null);
        const response = await axiosInstance.get("/attendance/search ", {
          params,
        });
        setAttendanceRecords(response.data.attendance);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch attendance records";
        setError(errorMessage);
      } finally {
        setIsLoadingAttendance(false);
      }
    },
    []
  );

  const fetchAttendanceById = useCallback(
    async (id: string): Promise<AttendanceRecord | null> => {
      try {
        setError(null);
        const response = await axiosInstance.get(`/attendance/${id}`);
        return response.data.attendance[0] || null;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch attendance record";
        setError(errorMessage);
        return null;
      }
    },
    []
  );

  const checkIn = useCallback(
    async (data: CheckInRequest): Promise<AttendanceRecord | null> => {
      try {
        setError(null);
        const response = await axiosInstance.post("/attendance/checkin", data);
        return response.data.attendance;
      } catch (err: unknown) {
        const errorMessage =
          (err as unknown as { response: { data: { message: string } } })
            .response?.data.message || "Failed to CheckIn Employee";
        setError(errorMessage);
      }
    },
    []
  );

  // Settings functions
  const fetchSettings = useCallback(async (userId: string) => {
    try {
      setIsLoadingSettings(true);
      setError(null);
      const response = await axiosInstance.get(`/settings/${userId}`);
      setUserSettings(response.data.settings);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch settings";
      setError(errorMessage);
    } finally {
      setIsLoadingSettings(false);
    }
  }, []);

  const updateSettings = useCallback(
    async (userId: string, data: UpdateSettingsRequest) => {
      try {
        setIsLoadingSettings(true);
        setError(null);
        await axiosInstance.put(`/settings/${userId}`, data);
        // Update local state with new settings
        if (userSettings) {
          setUserSettings({
            ...userSettings,
            ...data,
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update settings";
        setError(errorMessage);
      } finally {
        setIsLoadingSettings(false);
      }
    },
    [userSettings]
  );

  // Error handling
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AttendanceContextType = {
    // Dashboard
    dashboardData,
    isLoadingDashboard,
    fetchDashboard,

    // Attendance
    attendanceRecords,
    isLoadingAttendance,
    fetchAttendance,
    fetchAttendanceById,
    checkIn,
    fetchAttendanceSearch,
    // Settings
    userSettings,
    isLoadingSettings,
    fetchSettings,
    updateSettings,

    // Error handling
    error,
    clearError,
  };

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error("useAttendance must be used within a AttendanceProvider");
  }
  return context;
}
