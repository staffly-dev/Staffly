import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";
import { Metadata } from "next";
import { AuthProvider } from "@/context/authContext";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Raizero HRMS",
  description: "Raizero Human Resource Management System, Dashboard page",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen" suppressHydrationWarning>
        <AuthProvider>
          <Toaster richColors />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
