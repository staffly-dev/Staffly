import { Metadata } from "next";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AuthGuard } from "@/components/AuthGuard";
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
    <AuthGuard requireAuth={true}>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
