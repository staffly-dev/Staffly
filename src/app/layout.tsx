import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Raizero HRMS",
  description: "Raizero Human Resource Management System, Dashboard page",
};

export default function DashLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
