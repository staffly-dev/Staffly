import { Metadata } from "next";
import { DashboardLayout } from "@/components/layout/Dashboard-layout";
import { AuthGuard } from "@/components/AuthGuard";
export const metadata: Metadata = {
  title: "Staffly HRMS",
  description: "Staffly Human Resource Management System, Dashboard page",
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
