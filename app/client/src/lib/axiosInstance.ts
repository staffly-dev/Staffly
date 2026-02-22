import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { tokenStore } from "./token";

// Extend the AxiosRequestConfig to include _retry property
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _isRefreshRequest?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Public routes that don't require authentication (apply + quiz are candidate-facing, no login)
const PUBLIC_ROUTES = [
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

// Check if current route is public
const isPublicRoute = (): boolean => {
  if (typeof window === "undefined") return false;
  const currentPath = window.location.pathname;
  return PUBLIC_ROUTES.some((route) => currentPath.startsWith(route));
};

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

// Create a separate axios instance for refresh requests to avoid interceptor conflicts
const refreshAxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

// Request interceptor to add access token to headers
axiosInstance.interceptors.request.use(
  async (config) => {
    // Skip token refresh on public routes
    if (isPublicRoute()) {
      return config;
    }

    // Check if we should stop attempting refresh
    if (tokenStore.shouldStopRefreshAttempts()) {
      console.warn("Stopping token refresh attempts due to repeated failures");
      return config;
    }

    // Check if token is expired and we have a refresh token
    if (tokenStore.isAccessTokenExpired() && tokenStore.hasRefreshToken()) {
      try {
        // Check if we already have a refresh in progress
        let refreshPromise = tokenStore.getRefreshPromise();

        if (!refreshPromise) {
          refreshPromise = refreshToken();
          tokenStore.setRefreshPromise(refreshPromise);
        }

        const newToken = await refreshPromise;
        tokenStore.setAccessToken(newToken);
        tokenStore.clearRefreshPromise();
      } catch {
        // Record the failure
        tokenStore.recordRefreshFailure();

        // If refresh fails, clear tokens
        tokenStore.clearAccessToken();
        tokenStore.clearRefreshToken();
        tokenStore.clearRefreshPromise();

        // Only redirect if we're not already on a public route
        if (typeof window !== "undefined" && !isPublicRoute()) {
          console.warn("Token refresh failed, redirecting to login");
          window.location.href = "/login";
        }
      }
    }

    const token = tokenStore.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Skip refresh logic for refresh requests themselves
    if (originalRequest._isRefreshRequest) {
      return Promise.reject(error);
    }

    // If error is 401 and we haven't already tried to refresh
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isPublicRoute() &&
      !tokenStore.shouldStopRefreshAttempts()
    ) {
      originalRequest._retry = true;

      try {
        // Check if we already have a refresh in progress
        let refreshPromise = tokenStore.getRefreshPromise();

        if (!refreshPromise) {
          refreshPromise = refreshToken();
          tokenStore.setRefreshPromise(refreshPromise);
        }

        const newToken = await refreshPromise;

        tokenStore.setAccessToken(newToken);
        tokenStore.clearRefreshPromise();

        // Retry the original request with the new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        return axiosInstance(originalRequest as InternalAxiosRequestConfig);
      } catch (refreshError) {
        // Record the failure
        tokenStore.recordRefreshFailure();

        // Refresh failed, clear tokens
        tokenStore.clearAccessToken();
        tokenStore.clearRefreshToken();
        tokenStore.clearRefreshPromise();

        // Only redirect if we're not already on a public route
        if (typeof window !== "undefined" && !isPublicRoute()) {
          console.warn(
            "Token refresh failed in response interceptor, redirecting to login"
          );
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Function to refresh the access token
async function refreshToken(): Promise<string> {
  try {
    const refreshToken = tokenStore.getRefreshToken();

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    console.log("Attempting to refresh access token...");

    const response = await refreshAxiosInstance.get("/hrms/auth/refresh", {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data;

    if (!accessToken) {
      throw new Error("No access token received from refresh endpoint");
    }

    console.log("Token refresh successful");

    // Store the new refresh token if provided
    if (newRefreshToken) {
      tokenStore.setRefreshToken(newRefreshToken);
    }

    return accessToken;
  } catch (error) {
    console.error("Token refresh failed:", error);

    // Clear refresh token if refresh fails
    tokenStore.clearRefreshToken();
    throw new Error("Failed to refresh token");
  }
}

export default axiosInstance;
