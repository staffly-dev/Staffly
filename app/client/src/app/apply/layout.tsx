import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Staffly HRMS - Apply",
  description:
    "Staffly Human Resource Management System, Apply page, Job application",
};

export default function ApplyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-screen">{children}</div>;
}
