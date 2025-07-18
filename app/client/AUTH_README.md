# Secure Token-Based Authentication System

This Next.js application implements a secure token-based authentication system using React Query and Axios with the following security features:

## 🔐 Security Features

- **Access tokens stored in memory only** - No localStorage or cookies for access tokens
- **Refresh tokens in HttpOnly cookies** - Managed by backend, automatically sent with requests
- **Automatic token refresh** - Handles 401 errors by refreshing tokens and retrying requests
- **Route protection** - Guards protect routes from unauthorized access
- **Automatic redirects** - Redirects to login on authentication failures

## 📁 File Structure

```
src/
├── lib/
│   ├── token.ts              # In-memory token store
│   └── axiosInstance.ts      # Axios instance with interceptors
├── hooks/
│   └── useAuth.ts            # Authentication hooks
├── providers/
│   └── QueryProvider.tsx     # React Query provider
├── components/
│   ├── AuthGuard.tsx         # Route protection component
│   └── UserProfile.tsx       # Example protected component
└── app/
    ├── layout.tsx            # Root layout with QueryProvider
    ├── (auth)/
    │   └── layout.tsx        # Auth layout (no auth required)
    └── (dash)/
        └── layout.tsx        # Dashboard layout (auth required)
```

## 🚀 Quick Start

### 1. Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 2. Backend Endpoints

Your backend should provide these endpoints:

- `POST /auth/register` - User registration
- `POST /auth/login` - User login (returns `{ accessToken }`)
- `GET /auth/refresh` - Refresh access token
- `GET /users/me` - Get current user
- `POST /auth/logout` - Logout current session
- `POST /auth/logout-all` - Logout all sessions

### 3. Using Authentication in Components

#### Login Component Example

```tsx
"use client";

import { useAuth } from "@/hooks/useAuth";

export function LoginForm() {
  const { login, isLoggingIn } = useAuth();

  const handleSubmit = async (credentials: {
    email: string;
    password: string;
  }) => {
    try {
      await login(credentials);
      // User will be automatically redirected to dashboard
    } catch (error) {
      // Error is already handled by the hook
      console.error("Login failed:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
      <button type="submit" disabled={isLoggingIn}>
        {isLoggingIn ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
```

#### Protected Component Example

```tsx
"use client";

import { useAuth } from "@/hooks/useAuth";

export function ProtectedComponent() {
  const { user, logout, isLoggingOut } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <button onClick={logout} disabled={isLoggingOut}>
        {isLoggingOut ? "Logging out..." : "Logout"}
      </button>
    </div>
  );
}
```

### 4. Route Protection

#### Protect Dashboard Routes

```tsx
// app/(dash)/layout.tsx
import { AuthGuard } from "@/components/AuthGuard";

export default function DashLayout({ children }) {
  return (
    <AuthGuard requireAuth={true}>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
```

#### Prevent Authenticated Users from Accessing Auth Pages

```tsx
// app/(auth)/layout.tsx
import { AuthGuard } from "@/components/AuthGuard";

export default function AuthLayout({ children }) {
  return <AuthGuard requireAuth={false}>{children}</AuthGuard>;
}
```

## 🔧 API Usage

### Making Authenticated Requests

```tsx
import axiosInstance from "@/lib/axiosInstance";

// The access token is automatically added to headers
const response = await axiosInstance.get("/api/protected-endpoint");
```

### Custom API Hooks with React Query

```tsx
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";

export function useUserData() {
  return useQuery({
    queryKey: ["user-data"],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/user-data");
      return response.data;
    },
  });
}
```

## 🔄 How Token Refresh Works

1. **Request Interceptor**: Automatically adds access token to Authorization header
2. **Response Interceptor**: Catches 401 errors and attempts token refresh
3. **Refresh Logic**:
   - Checks if refresh is already in progress
   - Calls `/auth/refresh` endpoint
   - Updates in-memory token
   - Retries original request with new token
4. **Fallback**: Redirects to login if refresh fails

## 🛡️ Security Considerations

- **Access tokens are never persisted** - They're cleared on page refresh
- **Refresh tokens are HttpOnly cookies** - Protected from XSS attacks
- **Automatic cleanup** - Tokens are cleared on logout or refresh failure
- **Route protection** - Unauthorized users are redirected to login
- **Request retry** - Failed requests are automatically retried after token refresh

## 🎯 Available Hooks and Functions

### useAuth Hook

```tsx
const {
  // Data
  user, // Current user object
  isAuthenticated, // Boolean indicating auth status
  isLoadingUser, // Loading state for user data

  // Actions
  login, // Login function
  register, // Register function
  logout, // Logout function
  logoutAll, // Logout all devices

  // Loading states
  isLoggingIn, // Login loading state
  isRegistering, // Register loading state
  isLoggingOut, // Logout loading state
  isLoggingOutAll, // Logout all loading state

  // Errors
  loginError, // Login error
  registerError, // Register error
  logoutError, // Logout error
  logoutAllError, // Logout all error
} = useAuth();
```

### Token Store

```tsx
import { tokenStore } from "@/lib/token";

// Check if user has access token
const isAuth = tokenStore.isAuthenticated();

// Get current access token
const token = tokenStore.getAccessToken();

// Set access token (usually done by login)
tokenStore.setAccessToken(token);

// Clear access token (usually done by logout)
tokenStore.clearAccessToken();
```

## 🚨 Error Handling

The system automatically handles common authentication errors:

- **401 Unauthorized**: Attempts token refresh, redirects to login if failed
- **403 Forbidden**: Redirects to login
- **Network errors**: Retries up to 3 times (except for auth errors)
- **Token refresh failures**: Clears all auth state and redirects to login

## 🔧 Customization

### Custom API Base URL

Update `lib/axiosInstance.ts`:

```tsx
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
```

### Custom Redirect Paths

Update `components/AuthGuard.tsx`:

```tsx
<AuthGuard requireAuth={true} redirectTo="/custom-login">
  {children}
</AuthGuard>
```

### Custom Error Messages

Update `hooks/useAuth.ts` to customize toast messages and error handling.

## 📝 Notes

- The system is designed for production use with proper security measures
- All authentication state is managed through React Query for optimal performance
- The implementation follows Next.js 13+ App Router patterns
- TypeScript is fully supported with proper type definitions
- The system is compatible with your existing UI components and styling
