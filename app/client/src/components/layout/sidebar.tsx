"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  MdDashboard,
  MdPeople,
  MdBusinessCenter,
  MdAccessTime,
  MdPayments,
  MdWork,
  MdPersonOutline,
  MdEventNote,
  MdSettings,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";
import { Button } from "@/components/ui/button";
import { DarkLightSwitch } from "./DarkLightSwitch";

const menuItems = [
  {
    title: "Dashboard",
    icon: MdDashboard,
    href: "/dashboard",
  },
  {
    title: "All Employees",
    icon: MdPeople,
    href: "/all-employees",
  },
  {
    title: "All Departments",
    icon: MdBusinessCenter,
    href: "/all-departments",
  },
  {
    title: "Attendance",
    icon: MdAccessTime,
    href: "/attendance",
  },
  {
    title: "Payroll",
    icon: MdPayments,
    href: "/payroll",
  },
  {
    title: "Jobs",
    icon: MdWork,
    href: "/jobs",
  },
  {
    title: "Candidates",
    icon: MdPersonOutline,
    href: "/candidates",
  },
  {
    title: "Leaves",
    icon: MdEventNote,
    href: "/leaves",
  },
  {
    title: "Settings",
    icon: MdSettings,
    href: "/settings",
  },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "h-screen shrink-0 flex flex-col rounded-lg bg-primary-foreground transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[72px] py-3 px-2" : "w-56 p-3 pl-2 pr-4",
      )}
    >
      <div className="flex flex-col h-full">
        <div
          className={cn(
            "flex items-center justify-between",
            isCollapsed ? "p-2" : "gap-2 p-4",
          )}
        >
          <Link
            href="/"
            className="flex items-center gap-2 min-w-0 overflow-hidden"
          >
            <Image
              src="/imgs/logo.png"
              alt="Staffly Logo"
              width={40}
              height={40}
              className="object-contain shrink-0"
            />
            {!isCollapsed && (
              <span className="font-semibold text-xl truncate">Staffly</span>
            )}
          </Link>
          {onToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8 shrink-0 hover:bg-primary/40"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <MdChevronRight className="h-4 w-4" />
              ) : (
                <MdChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="grid gap-1 px-2">
            {menuItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.title : undefined}
                  className={cn(
                    "flex items-center rounded-br-lg rounded-tr-lg gap-3 px-3 py-2 transition-colors",
                    isCollapsed && "justify-center px-2",
                    isActive
                      ? "bg-primary/20 border-l-4 border-primary"
                      : "hover:bg-primary/10",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isActive && "text-primary",
                    )}
                  />
                  {!isCollapsed && (
                    <span className="truncate">{item.title}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto pb-6 flex justify-center">
          <DarkLightSwitch compact={isCollapsed} />
        </div>
      </div>
    </aside>
  );
}
