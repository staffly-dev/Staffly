// In-memory token store for secure token management
// Tokens are stored in memory and localStorage for persistence across page refreshes

class TokenStore {
  private accessToken: string | null = null;
  private refreshPromise: Promise<string> | null = null;
  private initialized: boolean = false;
  private refreshFailureCount: number = 0;
  private lastRefreshFailureTime: number = 0;
  private readonly MAX_REFRESH_FAILURES = 3;
  private readonly FAILURE_RESET_TIMEOUT = 60 * 1000; // 1 minute

  private decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
      const payloadPart = token.split(".")[1];
      if (!payloadPart) return null;

      // JWT uses base64url; normalize before atob.
      const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
      const padded = normalized.padEnd(
        normalized.length + ((4 - (normalized.length % 4)) % 4),
        "="
      );

      return JSON.parse(atob(padded)) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

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
    // Reset failure count on successful token set
    this.resetRefreshFailures();
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
    // Reset failure count on successful refresh token set
    this.resetRefreshFailures();
  }

  // Check if access token is expired (if it's a JWT)
  isAccessTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    const payload = this.decodeJwtPayload(token);
    if (!payload) {
      return true;
    }

    const expValue = payload.exp;
    if (typeof expValue !== "number") return true;

    const expiryTime = expValue * 1000; // Convert to milliseconds
    const currentTime = Date.now();

    // Consider token expired if it expires within the next 5 minutes
    return currentTime >= expiryTime - 5 * 60 * 1000;
  }

  getUserIdFromAccessToken(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;

    const payload = this.decodeJwtPayload(token);
    if (!payload) return null;

    const candidates = [payload.userId, payload.user_id, payload.id, payload._id];

    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim().length > 0) {
        const normalized = candidate.trim();
        if (/^[0-9a-f]{24}$/i.test(normalized)) {
          return normalized;
        }
      }
    }

    return null;
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

  // Track refresh failures and prevent infinite loops
  recordRefreshFailure(): void {
    const now = Date.now();

    // Reset failure count if enough time has passed
    if (now - this.lastRefreshFailureTime > this.FAILURE_RESET_TIMEOUT) {
      this.refreshFailureCount = 0;
    }

    this.refreshFailureCount++;
    this.lastRefreshFailureTime = now;

    console.warn(
      `Token refresh failed. Attempt ${this.refreshFailureCount}/${this.MAX_REFRESH_FAILURES}`
    );
  }

  // Check if we should stop attempting refresh
  shouldStopRefreshAttempts(): boolean {
    return this.refreshFailureCount >= this.MAX_REFRESH_FAILURES;
  }

  // Reset failure count (called on successful operations)
  resetRefreshFailures(): void {
    this.refreshFailureCount = 0;
    this.lastRefreshFailureTime = 0;
  }

  // Get current failure count for debugging
  getRefreshFailureCount(): number {
    return this.refreshFailureCount;
  }

  // Clear all tokens and reset state
  clearAll(): void {
    this.clearAccessToken();
    this.clearRefreshToken();
    this.clearRefreshPromise();
    this.resetRefreshFailures();
  }
}

// Create a singleton instance
export const tokenStore = new TokenStore();
