import React from "react";
import Header from "@/components/navigation/header";
import HeroSection from "@/components/marketing/hero-section";
import TestimonialSection from "@/components/marketing/testimonial-section";
import HRFlowSection from "@/components/marketing/hrflow-section";
import FeaturesSection from "@/components/marketing/features-section";
import BalanceSection from "@/components/marketing/balance-section";
import CTASection from "@/components/marketing/cta-section";
import Footer from "@/components/navigation/footer";

export default function Homepage() {
  return (
    <div>
      <Header />
      <HeroSection />
      <TestimonialSection />
      <HRFlowSection />
      <FeaturesSection />
      <BalanceSection />
      <CTASection />
      <Footer />
    </div>
  );
}
