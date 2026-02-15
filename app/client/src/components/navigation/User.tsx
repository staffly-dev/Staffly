import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "../ui/button";
import Link from "next/link";
import { toast } from "sonner";

const User = () => {
  const [mounted, setMounted] = useState(false);
  const { user, logout, isLoggingOut, logoutError, isLoadingUser } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (logoutError) {
    toast.error(logoutError.message);
  }

  // Always render loading state during SSR and initial client render
  if (!mounted || isLoadingUser) {
    return (
      <div className="flex flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:border-l lg:pl-6">
        <Button variant="outline" size="sm" disabled>
          Loading...
        </Button>
      </div>
    );
  }

  return (
    <>
      {user?.user ? (
        <div className="flex flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:border-l lg:pl-6">
          <Button
            onClick={() => logout()}
            variant="outline"
            className="text-red-500 p-2 w-fit hover:bg-transparent hover:bg-red-700 hover:text-white"
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              Dashboard
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:border-l lg:pl-6">
          <Link href="/login">
            <Button variant="outline" size="sm">
              Login
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      )}
    </>
  );
};

export default User;
