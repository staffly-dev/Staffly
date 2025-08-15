import React from "react";
import Header from "@/components/navigation/header";
import HeroSection from "@/components/marketing/product/hero-section";
import TestimonialSection from "@/components/marketing/product/testimonial-section";
import HRFlowSection from "@/components/marketing/product/hrflow-section";
import BalanceSection from "@/components/marketing/product/balance-section";
import CTASection from "@/components/marketing/product/cta-section";
import Footer from "@/components/navigation/footer";
import FeaturesPage from "./(marketing)/(product)/features/page";

export default function Homepage() {
  return (
    <div>
      <Header />
      <HeroSection />
      <TestimonialSection />
      <HRFlowSection />
      <FeaturesPage isHomepage />
      <BalanceSection />
      <CTASection />
      <Footer />
    </div>
  );
}
