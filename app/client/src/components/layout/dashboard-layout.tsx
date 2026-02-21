"use client";

import { Suspense, useState, useEffect } from "react";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";
import { cn } from "@/lib/utils";

const SIDEBAR_COLLAPSED_KEY = "staffly-sidebar-collapsed";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored === "true") setIsCollapsed(true);
  }, [mounted]);

  const handleToggle = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      }
      return next;
    });
  };

  return (
    <div className="flex min-h-screen">
      <div className="fixed left-0 top-0 z-40 h-screen">
        <Sidebar isCollapsed={isCollapsed} onToggle={handleToggle} />
      </div>
      <main
        className={cn(
          "flex-1 transition-[margin-left] duration-300 ease-in-out lg:px-6 px-4",
          isCollapsed ? "ml-[72px]" : "ml-56"
        )}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <Navbar />
        </Suspense>
        <div className="pb-4">{children}</div>
      </main>
    </div>
  );
}
