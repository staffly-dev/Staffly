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

export function UserProfile() {
  const { user: data, logout, isLoggingOut } = useAuth();

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

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
        <CardDescription>Your account information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={user.profilePicture || undefined}
              alt={user.name}
            />
            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground">
              {user.isVerified ? "✓ Verified" : "⚠ Not verified"}
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
            <span className="text-sm text-muted-foreground">{user.id}</span>
          </div>
        </div>

        <div className="pt-4">
          <Button
            onClick={logout}
            disabled={isLoggingOut}
            variant="outline"
            className="w-full"
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
