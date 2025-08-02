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
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  // timeout: 10000,
  withCredentials: true,
});

// Request interceptor to add access token to headers
axiosInstance.interceptors.request.use(
  async (config) => {
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
        // If refresh fails, clear tokens
        tokenStore.clearAccessToken();
        tokenStore.clearRefreshToken();
        tokenStore.clearRefreshPromise();

        // Redirect to login if we're in browser
        // if (typeof window !== "undefined") {
        //   window.location.href = "/login";
        // }
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

    // If error is 401 and we haven't already tried to refresh
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
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
        // Refresh failed, clear tokens
        tokenStore.clearAccessToken();
        tokenStore.clearRefreshToken();
        tokenStore.clearRefreshPromise();

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

    const response = await axios.get(`${API_BASE_URL}/auth/refresh`, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
      withCredentials: true,
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data;

    if (!accessToken) {
      throw new Error("No access token received from refresh endpoint");
    }

    // Store the new refresh token if provided
    if (newRefreshToken) {
      localStorage.setItem("refreshToken", newRefreshToken);
    }

    return accessToken;
  } catch {
    // Clear refresh token if refresh fails
    tokenStore.clearRefreshToken();
    throw new Error("Failed to refresh token");
  }
}

export default axiosInstance;
