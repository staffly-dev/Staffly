"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export function UserProfile() {
  const { user: data, logout, logoutAll, isLoggingOut } = useAuth();

  const user = data?.user;

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Loading user profile...</p>
        </CardContent>
      </Card>
    );
  }

  const handleEditProfile = () => {
    toast.warning("Editing profile is not available yet", {
      position: "top-center",
      cancel: {
        label: "Close",
        onClick: () => {},
      },
    });
  };

  return (
    <Card className="w-full max-w-md h-fit">
      <CardHeader className="flex flex-row justify-between items-center">
        <div className="flex flex-col gap-1">
          <CardTitle>User Profile</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </div>
        <Button variant="default" onClick={() => handleEditProfile()}>
          Edit Profile
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-2">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={user.profilePicture || undefined}
              alt={user.name}
            />
            <AvatarFallback className="bg-primary text-white text-lg font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-center space-y-1">
            <h3 className="text-lg font-semibold">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-green-500">
              {/* {user.isVerified ? "✓ Verified" : "⚠ Not verified"} */}
              Verified
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Role:</span>
            <span className="text-sm text-muted-foreground">
              {user.role || "User"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">User ID:</span>
            <span className="text-sm text-muted-foreground">
              {user.id || user._id}
            </span>
          </div>
        </div>

        <div className="pt-4 flex justify-between items-center gap-2">
          <Button
            onClick={logout}
            disabled={isLoggingOut}
            variant="outline"
            className="w-full"
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
          <Button
            onClick={logoutAll}
            disabled={isLoggingOut}
            variant="destructive"
            className="w-full"
          >
            {isLoggingOut ? "Logging out..." : "Logout All Devices"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
