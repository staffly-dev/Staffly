import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axiosInstance from "@/lib/axiosInstance";
import { tokenStore } from "@/lib/token";
import { useEffect } from "react";

// Types
export interface User {
  id: string;
  _id: string;
  name: string;
  email: string;
  profilePicture: string;
  isVerified: boolean;
  role: string;
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserData {
  user: User;
  message: string;
}

interface Data {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  data: Data;
  message: string;
}

// API functions
const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/auth/login", credentials);
    return response.data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    localStorage.setItem("registerEmail", credentials.email);
    const response = await axiosInstance.post("/auth/register", credentials);
    return response.data;
  },

  verifyEmail: async (code: string): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/auth/verify-email", {
      code,
      email: localStorage.getItem("registerEmail"),
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post("/auth/logout");
  },

  logoutAll: async (): Promise<void> => {
    await axiosInstance.post("/auth/logout-all");
  },

  getCurrentUser: async (): Promise<UserData> => {
    const response = await axiosInstance.get("/users/me");
    return response.data;
  },

  resetPasswordRequest: async (email: string): Promise<AuthResponse> => {
    localStorage.setItem("resetPasswordEmail", email);
    const response = await axiosInstance.post("/auth/request-resetPass", {
      email,
    });
    return response.data;
  },

  verifyResetPasswordCode: async (code: string): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/auth/verify-resetPass-code", {
      code,
      email: localStorage.getItem("resetPasswordEmail"),
    });
    localStorage.setItem("resetPasswordToken", response.data.data.resetToken);
    return response.data;
  },

  resetPassword: async (newPassword: string): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/auth/reset-password", {
      newPassword,
      resetToken: localStorage.getItem("resetPasswordToken"),
    });
    localStorage.removeItem("resetPasswordEmail");
    return response.data;
  },
};

// Query keys
export const authKeys = {
  user: ["auth", "user"] as const,
};

// Custom hook for authentication
export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Effect to handle automatic token refresh on page load
  useEffect(() => {
    const handleTokenRefresh = async () => {
      // If we don't have an access token but have a refresh token, try to refresh
      if (!tokenStore.isAuthenticated() && tokenStore.hasRefreshToken()) {
        try {
          // This will trigger the axios interceptor to refresh the token
          await authAPI.getCurrentUser();
        } catch {
          // If refresh fails, clear tokens and redirect to login
          tokenStore.clearAccessToken();
          tokenStore.clearRefreshToken();
          router.push("/login");
        }
      }
    };

    handleTokenRefresh();
  }, [router]);

  // Get current user query
  const {
    data,
    isFetching: isLoadingUser,
    error: userError,
  } = useQuery({
    queryKey: authKeys.user,
    queryFn: authAPI.getCurrentUser,
    enabled: tokenStore.isAuthenticated(),
    retry: false,
    // staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      // Store the access token in memory
      tokenStore.setAccessToken(data.data.accessToken);
      // Store the refresh token using token store
      tokenStore.setRefreshToken(data.data.refreshToken);

      // Update the user data in React Query cache
      queryClient.setQueryData(authKeys.user, data.data.user);

      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: authKeys.user });

      toast.success(data.message);
      router.push("/dashboard");
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authAPI.register,
    onSuccess: (data) => {
      toast.success(data.message);
      router.push("/code");
    },
  });

  // Verify email mutation
  const verifyEmailMutation = useMutation({
    mutationFn: authAPI.verifyEmail,
    onSuccess: (data) => {
      toast.success(data.message);
      localStorage.removeItem("registerEmail");
      router.push("/login");
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      // Clear the access token from memory
      tokenStore.clearAccessToken();
      // Clear the refresh token from localStorage
      tokenStore.clearRefreshToken();

      // Clear all queries from React Query cache
      queryClient.clear();

      toast.success("Logged out successfully");
      router.push("/login");
    },
    onError: () => {
      // Even if logout fails on server, clear local state
      tokenStore.clearAccessToken();
      tokenStore.clearRefreshToken();
      queryClient.clear();
      router.push("/login");
      toast.error("Logged out (with errors)");
    },
  });

  // Logout all devices mutation
  const logoutAllMutation = useMutation({
    mutationFn: authAPI.logoutAll,
    onSuccess: () => {
      // Clear the access token from memory
      tokenStore.clearAccessToken();
      // Clear the refresh token from localStorage
      tokenStore.clearRefreshToken();

      // Clear all queries from React Query cache
      queryClient.clear();

      toast.success("Logged out from all devices");
      router.push("/login");
    },
    onError: () => {
      // Even if logout fails on server, clear local state
      tokenStore.clearAccessToken();
      tokenStore.clearRefreshToken();
      queryClient.clear();
      router.push("/login");
      toast.error("Logged out from all devices (with errors)");
    },
  });

  // Reset password request mutation
  const resetPasswordRequestMutation = useMutation({
    mutationFn: authAPI.resetPasswordRequest,
    onSuccess: (data) => {
      toast.success(data.message);
      router.push("/reset/code");
    },
  });

  // Verify reset password code mutation
  const verifyResetPasswordCodeMutation = useMutation({
    mutationFn: authAPI.verifyResetPasswordCode,
    onSuccess: (data) => {
      toast.success(data.message);
      router.push("/reset/new-password");
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: authAPI.resetPassword,
    onSuccess: () => {
      localStorage.removeItem("resetPasswordToken");
      toast.success("Password reset successfully");
      router.push("/reset/congrats");
    },
  });

  // Login function
  const login = async (credentials: LoginCredentials) => {
    return loginMutation.mutateAsync(credentials);
  };

  // Register function
  const register = async (credentials: RegisterCredentials) => {
    return registerMutation.mutateAsync(credentials);
  };

  // Verify email function
  const verifyEmail = async (otp: string) => {
    return verifyEmailMutation.mutateAsync(otp);
  };

  // Logout function
  const logout = async () => {
    return logoutMutation.mutateAsync();
  };

  // Logout all devices function
  const logoutAll = async () => {
    return logoutAllMutation.mutateAsync();
  };

  // Reset password request function
  const resetPasswordRequest = async (email: string) => {
    return resetPasswordRequestMutation.mutateAsync(email);
  };

  // Verify reset password code function
  const verifyResetPasswordCode = async (code: string) => {
    return verifyResetPasswordCodeMutation.mutateAsync(code);
  };

  // Reset password function
  const resetPassword = async (newPassword: string) => {
    return resetPasswordMutation.mutateAsync(newPassword);
  };

  // Check if user is authenticated
  const isAuthenticated = tokenStore.isAuthenticated() && !!data;

  return {
    // Data
    user: data,
    isAuthenticated,
    isLoadingUser,
    userError,

    // Mutations
    login,
    register,
    verifyEmail,
    logout,
    logoutAll,
    resetPasswordRequest,
    verifyResetPasswordCode,
    resetPassword,

    // Loading states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isLoggingOutAll: logoutAllMutation.isPending,
    isResettingPasswordRequest: resetPasswordRequestMutation.isPending,
    isVerifyingResetPasswordCode: verifyResetPasswordCodeMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,

    // Errors
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    logoutError: logoutMutation.error,
    logoutAllError: logoutAllMutation.error,
    resetPasswordRequestError: resetPasswordRequestMutation.error,
    verifyResetPasswordCodeError: verifyResetPasswordCodeMutation.error,
    resetPasswordError: resetPasswordMutation.error,
    verifyEmailError: verifyEmailMutation.error,
  };
}
