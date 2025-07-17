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
  // MdCalendarToday,
  MdSettings,
} from "react-icons/md";
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
  // {
  //   title: "Holidays",
  //   icon: MdCalendarToday,
  //   href: "/holidays",
  // },
  {
    title: "Settings",
    icon: MdSettings,
    href: "/settings",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="p-3 h-screen">
      <div className="flex flex-col rounded-lg bg-primary-foreground h-full pl-2 pr-4">
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
              const isActive =
                pathname === item.href || pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-br-lg rounded-tr-lg gap-3 px-3 py-2 transition-colors",
                    isActive
                      ? "bg-primary/20 border-l-4 border-primary"
                      : "hover:bg-primary/10"
                  )}
                >
                  <item.icon
                    className={cn("h-4 w-4", isActive && "text-primary")}
                  />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto pb-6">
          <DarkLightSwitch />
        </div>
      </div>
    </aside>
  );
}
