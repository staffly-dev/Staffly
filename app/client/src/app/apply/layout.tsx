import Footer from "@/components/navigation/footer";
import Header from "@/components/navigation/header";
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
  return (
    <div>
      <Header />
      <main className="mx-auto w-full relative">{children}</main>
      <Footer />
    </div>
  );
}
