"use client";

import { cn } from "@/lib/utils";
import {
  BarChart3,
  Briefcase,
  Calendar,
  Clock,
  Grid2X2,
  Users2,
  // Suitcase,
  UserCircle,
  CalendarDays,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

interface SidebarProps {
  isOpen: boolean;
}

const menuItems = [
  {
    title: "Dashboard",
    icon: Grid2X2,
    href: "/",
  },
  {
    title: "All Employees",
    icon: Users2,
    href: "/employees",
  },
  {
    title: "All Departments",
    icon: Briefcase,
    href: "/departments",
  },
  {
    title: "Attendance",
    icon: Clock,
    href: "/attendance",
  },
  {
    title: "Payroll",
    icon: BarChart3,
    href: "/payroll",
  },
  {
    title: "Jobs",
    icon: BarChart3,
    href: "/jobs",
  },
  {
    title: "Candidates",
    icon: UserCircle,
    href: "/candidates",
  },
  {
    title: "Leaves",
    icon: Calendar,
    href: "/leaves",
  },
  {
    title: "Holidays",
    icon: CalendarDays,
    href: "/holidays",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r bg-background transition-transform lg:translate-x-0 lg:relative",
        !isOpen && "-translate-x-full"
      )}
    >
      <div className="p-4">
        <div className="flex items-center gap-2">
          <Image
            src="/imgs/logo.png"
            alt="HRMS Logo"
            width={40}
            height={40}
            className="object-contain"
          />
          <span className="font-semibold text-xl">HRMS</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="grid gap-1 px-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
