import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
export interface AttendanceRecord {
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

// Query keys
export const attendanceKeys = {
  all: ["attendance"] as const,
  lists: () => [...attendanceKeys.all, "list"] as const,
  list: (filters?: string) => [...attendanceKeys.lists(), { filters }] as const,
  details: () => [...attendanceKeys.all, "detail"] as const,
  detail: (id: string) => [...attendanceKeys.details(), id] as const,
  dashboard: () => [...attendanceKeys.all, "dashboard"] as const,
  settings: (userId: string) =>
    [...attendanceKeys.all, "settings", userId] as const,
};

// Fetch all attendance records
export const useAttendance = () => {
  return useQuery({
    queryKey: attendanceKeys.lists(),
    queryFn: async (): Promise<AttendanceRecord[]> => {
      const response = await axiosInstance.get(
        "/hrms/attendance/getAllAttendance"
      );
      return response.data.attendance;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Fetch attendance by ID
export const useAttendanceById = (id: string) => {
  return useQuery({
    queryKey: attendanceKeys.detail(id),
    queryFn: async (): Promise<AttendanceRecord | null> => {
      const response = await axiosInstance.get(`/hrms/attendance/${id}`);
      return response.data.attendance[0] || null;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Search attendance records
export const useAttendanceSearch = (params?: AttendanceSearchParams) => {
  return useQuery({
    queryKey: attendanceKeys.list(JSON.stringify(params)),
    queryFn: async (): Promise<AttendanceRecord[]> => {
      const response = await axiosInstance.get("/hrms/attendance/search", {
        params,
      });
      return response.data.attendance;
    },
    enabled: !!params,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Check in
export const useCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CheckInRequest
    ): Promise<AttendanceRecord | null> => {
      const response = await axiosInstance.post(
        "/hrms/attendance/checkin",
        data
      );
      return response.data.attendance;
    },
    onSuccess: () => {
      // Invalidate attendance queries to refetch data
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
      // Invalidate the specific employees list query used by the table
      queryClient.invalidateQueries({ queryKey: ["employees", "list"] });
    },
  });
};

// Fetch dashboard data
export const useDashboard = () => {
  return useQuery({
    queryKey: attendanceKeys.dashboard(),
    queryFn: async (): Promise<DashboardData> => {
      const response = await axiosInstance.get("/hrms/dashboard");
      return response.data.dashboard;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Fetch user settings
export const useSettings = (userId: string) => {
  return useQuery({
    queryKey: attendanceKeys.settings(userId),
    queryFn: async (): Promise<UserSettings> => {
      const response = await axiosInstance.get(`/hrms/settings/${userId}`);
      return response.data.settings;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Update user settings
export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: UpdateSettingsRequest;
    }): Promise<void> => {
      await axiosInstance.put(`/hrms/settings/${userId}`, data);
    },
    onSuccess: (_, { userId }) => {
      // Invalidate settings query to refetch data
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.settings(userId),
      });
    },
  });
};
