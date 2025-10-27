import { Hero } from "@/components/home/hero";
import { WhatIsDummyTicket } from "@/components/home/what-is-dummy-ticket";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <WhatIsDummyTicket />
      <Footer />
    </main>
  );
}
