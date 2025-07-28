import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";
import { Metadata } from "next";
import { Toaster } from "sonner";
import { QueryProvider } from "@/providers/QueryProvider";
import { EmployeeProvider } from "@/context/EmployeeContext";
import { JobProvider } from "@/context/JobContext";

export const metadata: Metadata = {
  title: "Staffly HRMS",
  description: "Staffly Human Resource Management System HRMS, Landing page",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen" suppressHydrationWarning>
        <EmployeeProvider>
          <JobProvider>
            <QueryProvider>
              <Toaster richColors />
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                {children}
              </ThemeProvider>
            </QueryProvider>
          </JobProvider>
        </EmployeeProvider>
      </body>
    </html>
  );
}
