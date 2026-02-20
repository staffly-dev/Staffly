import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import axiosInstance from "@/lib/axiosInstance";
import { tokenStore } from "@/lib/token";
import { useEffect, useRef } from "react";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
    const response = await axiosInstance.post("/hrms/auth/login", credentials);
    return response.data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    localStorage.setItem("registerEmail", credentials.email);
    const response = await axiosInstance.post(
      "/hrms/auth/register",
      credentials
    );
    return response.data;
  },

  verifyEmail: async (code: string): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/hrms/auth/verify-email", {
      code,
      email: localStorage.getItem("registerEmail"),
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post("/hrms/auth/logout");
  },

  logoutAll: async (): Promise<void> => {
    const refreshToken = tokenStore.getRefreshToken();
    await axios.post(
      API_BASE_URL + "/hrms/auth/logout-all",
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );
  },

  getCurrentUser: async (): Promise<UserData> => {
    const response = await axiosInstance.get("/hrms/users/me");
    return response.data;
  },

  resetPasswordRequest: async (email: string): Promise<AuthResponse> => {
    localStorage.setItem("resetPasswordEmail", email);
    const response = await axiosInstance.post("/hrms/auth/request-resetPass", {
      email,
    });
    return response.data;
  },

  verifyResetPasswordCode: async (code: string): Promise<AuthResponse> => {
    const response = await axiosInstance.post(
      "/hrms/auth/verify-resetPass-code",
      {
        code,
        email: localStorage.getItem("resetPasswordEmail"),
      }
    );
    localStorage.setItem("resetPasswordToken", response.data.data.resetToken);
    return response.data;
  },

  resetPassword: async (newPassword: string): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/hrms/auth/reset-password", {
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
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const hasAttemptedRefresh = useRef(false);

  // Check if current route is public
  const isPublicRoute = (path: string): boolean => {
    const publicRoutes = [
      "/login",
      "/register",
      "/sign-up",
      "/reset",
      "/code",
      "/verify",
      "/forgot-password",
      "/reset-password",
      "/congrats",
      "/apply",
      "/quiz",
    ];
    return publicRoutes.some((route) => path.startsWith(route));
  };

  // Effect to handle automatic token refresh on page load
  useEffect(() => {
    const handleTokenRefresh = async () => {
      // Skip token refresh on public routes
      if (isPublicRoute(pathname)) {
        console.log("Skipping token refresh on public route:", pathname);
        return;
      }

      // Only attempt refresh once per session to prevent infinite loops
      if (hasAttemptedRefresh.current) {
        console.log("Token refresh already attempted in this session");
        return;
      }

      // Check if we should stop attempting refresh
      if (tokenStore.shouldStopRefreshAttempts()) {
        console.warn(
          "Stopping token refresh attempts due to repeated failures"
        );
        return;
      }

      // If we don't have an access token but have a refresh token, try to refresh
      if (!tokenStore.isAuthenticated() && tokenStore.hasRefreshToken()) {
        hasAttemptedRefresh.current = true;
        console.log("Attempting automatic token refresh...");

        try {
          // This will trigger the axios interceptor to refresh the token
          await authAPI.getCurrentUser();
          console.log("Automatic token refresh successful");
        } catch (error) {
          console.error("Automatic token refresh failed:", error);

          // If refresh fails, clear tokens and redirect to login
          tokenStore.clearAccessToken();
          tokenStore.clearRefreshToken();

          // Only redirect if we're not already on a public route
          if (!isPublicRoute(pathname)) {
            console.warn("Redirecting to login due to failed token refresh");
            router.push("/login");
          }
        }
      }
    };

    handleTokenRefresh();
  }, [router, pathname]);

  // Get current user query - only enable on protected routes
  const {
    data,
    isFetching: isLoadingUser,
    error: userError,
  } = useQuery({
    queryKey: authKeys.user,
    queryFn: authAPI.getCurrentUser,
    enabled: tokenStore.isAuthenticated() && !isPublicRoute(pathname),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      // Store the access token in memory
      tokenStore.setAccessToken(data.data.accessToken);
      // Store the refresh token using token store
      tokenStore.setRefreshToken(data.data.refreshToken);

      // Reset the refresh attempt flag since we're now authenticated
      hasAttemptedRefresh.current = false;

      // Update the user data in React Query cache with the correct structure
      queryClient.setQueryData(authKeys.user, {
        user: data.data.user,
        message: data.message,
      });

      // No need to invalidate since we're setting the data directly

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
      // Clear all tokens and reset state
      tokenStore.clearAll();

      // Reset the refresh attempt flag
      hasAttemptedRefresh.current = false;

      // Clear all queries from React Query cache
      queryClient.clear();

      toast.success("Logged out successfully");
      router.push("/login");
    },
    onError: () => {
      // Even if logout fails on server, clear local state
      tokenStore.clearAll();

      // Reset the refresh attempt flag
      hasAttemptedRefresh.current = false;

      queryClient.clear();
      router.push("/login");
      toast.error("Logged out (with errors)");
    },
  });

  // Logout all devices mutation
  const logoutAllMutation = useMutation({
    mutationFn: authAPI.logoutAll,
    onSuccess: () => {
      // Clear all tokens and reset state
      tokenStore.clearAll();

      // Reset the refresh attempt flag
      hasAttemptedRefresh.current = false;

      // Clear all queries from React Query cache
      queryClient.clear();

      toast.success("Logged out from all devices");
      router.push("/login");
    },
    onError: () => {
      // // Even if logout fails on server, clear local state
      // tokenStore.clearAll();
      // // Reset the refresh attempt flag
      // hasAttemptedRefresh.current = false;
      // queryClient.clear();
      // router.push("/login");
      // toast.error("Logged out from all devices (with errors)");
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

  // Normalized user id for ATS/headers from authenticated user payload.
  const userId =
    data?.user != null
      ? String(data.user.id ?? data.user._id ?? "").trim() || undefined
      : undefined;

  // Function to manually reset refresh attempt flag
  const resetRefreshAttempt = () => {
    hasAttemptedRefresh.current = false;
  };

  // Function to manually clear all authentication state
  const clearAuthState = () => {
    tokenStore.clearAll();
    hasAttemptedRefresh.current = false;
    queryClient.clear();
  };

  // Function to get debug information
  const getDebugInfo = () => {
    return {
      isAuthenticated: tokenStore.isAuthenticated(),
      hasRefreshToken: tokenStore.hasRefreshToken(),
      refreshFailureCount: tokenStore.getRefreshFailureCount(),
      hasAttemptedRefresh: hasAttemptedRefresh.current,
      currentPath: pathname,
      isPublicRoute: isPublicRoute(pathname),
    };
  };

  return {
    // Data
    user: data,
    userId,
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

    // Utility functions
    resetRefreshAttempt,
    clearAuthState,
    getDebugInfo,
  };
}
