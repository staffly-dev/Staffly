"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { MdDarkMode, MdLightMode } from "react-icons/md";

export function DarkLightSwitch() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex items-center bg-primary/15 rounded-full p-1">
      <button
        onClick={() => setTheme("light")}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors ${
          theme === "light"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <MdLightMode className="h-4 w-4" />
        Light
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors ${
          theme === "dark"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <MdDarkMode className="h-4 w-4" />
        Dark
      </button>
    </div>
  );
}
