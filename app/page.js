import { Header } from "@/components/layout/header";
import { Hero } from "@/components/home/hero";
import { WhatIsDummyTicket } from "@/components/home/what-is-dummy-ticket";
import { UseCases } from "@/components/home/use-cases";
import { Pricing } from "@/components/home/pricing";
import { OtherServices } from "@/components/home/other-services";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { AboutNewsSection } from "@/components/home/about-news-section";
import { FAQ } from "@/components/home/faq";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <WhatIsDummyTicket />
      <UseCases />
      <Pricing />
      <OtherServices />
      <WhyChooseUs />
      <AboutNewsSection />
      <FAQ />
      <Footer />
    </main>
  );
}
