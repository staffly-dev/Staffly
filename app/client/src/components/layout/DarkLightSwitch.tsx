"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { MdDarkMode, MdLightMode } from "react-icons/md";

interface DarkLightSwitchProps {
  compact?: boolean;
}

export function DarkLightSwitch({ compact = false }: DarkLightSwitchProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (compact) {
    return (
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="flex items-center justify-center p-2 rounded-full bg-primary/15 hover:bg-primary/25 transition-colors"
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? (
          <MdLightMode className="h-5 w-5" />
        ) : (
          <MdDarkMode className="h-5 w-5" />
        )}
      </button>
    );
  }

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
