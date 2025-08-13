import React from "react";
import Header from "@/components/navigation/header";
import Footer from "@/components/navigation/footer";

interface Props {
  children: React.ReactNode;
}

export default function LandingLayout({ children }: Props) {
  return (
    <div>
      <Header />
      <main className="mx-auto w-full relative">{children}</main>
      <Footer />
    </div>
  );
}
