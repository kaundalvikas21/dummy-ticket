import { Hero } from "@/components/pages/home/hero";
import { WhatIsDummyTicket } from "@/components/pages/home/what-is-dummy-ticket";
import { UseCases } from "@/components/pages/home/use-cases";
import { Pricing } from "@/components/pages/home/pricing";
import { OtherServices } from "@/components/pages/home/other-services";
import { WhyChooseUs } from "@/components/pages/home/why-choose-us";
import { AboutNewsSection } from "@/components/pages/home/about-news-section";
import { FAQSection } from "@/components/pages/home/faq-section";

export default function Home() {
  return (
    <>
      <Hero />
      <WhatIsDummyTicket />
      <UseCases />
      <Pricing />
      <OtherServices />
      <WhyChooseUs />
      <AboutNewsSection />
      <FAQSection />
    </>
  );
}
