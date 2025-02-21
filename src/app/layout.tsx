import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";
import { Metadata } from "next";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export const metadata: Metadata = {
  title: "Raizero HRMS",
  description: "Raizero Human Resource Management System",
};

export default function RootLayout({
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
          <DashboardLayout>{children}</DashboardLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
