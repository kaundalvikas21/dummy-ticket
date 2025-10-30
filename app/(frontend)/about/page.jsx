import HeroSection from "@/components/pages/about/hero-about";
import OurCommitment from "@/components/pages/about/our-commitment";
import ReadyToBook from "@/components/pages/about/ready-to-book";
import { StatsSection } from "@/components/pages/about/stats-section";
import { WhatAreDummyTickets } from "@/components/pages/about/what-are-dummy-tickets";
import WhyChooseVisaFly from "@/components/pages/about/why-choose-visaFly";

export default function AboutPage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <WhatAreDummyTickets />
      <WhyChooseVisaFly />
      <OurCommitment />
      <ReadyToBook />
    </>
  );
}
