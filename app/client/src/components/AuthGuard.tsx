"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  requireAuth = true,
  redirectTo = "/login",
}: AuthGuardProps) {
  const { isAuthenticated, isLoadingUser } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoadingUser) {
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo);
      } else if (!requireAuth && isAuthenticated) {
        // If user is authenticated but this route doesn't require auth (like login page)
        router.push("/dashboard");
      }
    }
  }, [
    isAuthenticated,
    isLoadingUser,
    requireAuth,
    redirectTo,
    router,
    mounted,
  ]);

  // Show loading state while checking authentication or before mounting
  if (!mounted || isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 dark:border-white border-gray-900 "></div>
      </div>
    );
  }

  // If route requires auth and user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // If route doesn't require auth and user is authenticated, don't render children
  if (!requireAuth && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
