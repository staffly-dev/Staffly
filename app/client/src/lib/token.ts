// In-memory token store for secure token management
// Tokens are stored in memory and localStorage for persistence across page refreshes

class TokenStore {
  private accessToken: string | null = null;
  private refreshPromise: Promise<string> | null = null;
  private initialized: boolean = false;

  private initializeIfNeeded(): void {
    if (!this.initialized && typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("accessToken");
      this.initialized = true;
    }
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
    // Also store in localStorage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", token);
    }
  }

  getAccessToken(): string | null {
    this.initializeIfNeeded();
    return this.accessToken;
  }

  getAccessTokenFromStorage(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken");
    }
    return null;
  }

  clearAccessToken(): void {
    this.accessToken = null;
    // Also clear from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
    }
  }

  isAuthenticated(): boolean {
    this.initializeIfNeeded();
    return this.accessToken !== null;
  }

  // Set refresh token in localStorage
  setRefreshToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("refreshToken", token);
    }
  }

  // Check if access token is expired (if it's a JWT)
  isAccessTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      // Decode JWT to check expiry (without verification)
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();

      // Consider token expired if it expires within the next 5 minutes
      return currentTime >= expiryTime - 5 * 60 * 1000;
    } catch {
      // If we can't decode the token, assume it's expired
      return true;
    }
  }

  // Check if we have a refresh token available
  hasRefreshToken(): boolean {
    if (typeof window !== "undefined") {
      return localStorage.getItem("refreshToken") !== null;
    }
    return false;
  }

  // Get refresh token from localStorage
  getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("refreshToken");
    }
    return null;
  }

  // Clear refresh token from localStorage
  clearRefreshToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("refreshToken");
    }
  }

  // Prevent multiple simultaneous refresh requests
  setRefreshPromise(promise: Promise<string>): void {
    this.refreshPromise = promise;
  }

  getRefreshPromise(): Promise<string> | null {
    return this.refreshPromise;
  }

  clearRefreshPromise(): void {
    this.refreshPromise = null;
  }
}

// Create a singleton instance
export const tokenStore = new TokenStore();
