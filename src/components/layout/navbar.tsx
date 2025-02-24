"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Bell, ChevronDown, Menu, Search } from "lucide-react";
import Image from "next/image";

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <nav className="h-16 border-b px-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 lg:hidden">
        <Button variant="ghost" size="icon" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold">Hello Robert 👋</h2>
        <p className="text-sm text-muted-foreground">Good Morning</p>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <div className="relative max-w-md w-full hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-8"
          />
        </div>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <div className="flex items-center gap-2">
                <Image
                  src="/imgs/avatar.jpg"
                  alt="Robert Allen"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium leading-none">Robert Allen</p>
                  <p className="text-xs text-muted-foreground mt-1">HR Manager</p>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
