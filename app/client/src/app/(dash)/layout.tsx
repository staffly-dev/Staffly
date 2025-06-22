import { Metadata } from "next";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
export const metadata: Metadata = {
  title: "Raizero HRMS",
  description: "Raizero Human Resource Management System, Dashboard page",
};

export default function DashLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
