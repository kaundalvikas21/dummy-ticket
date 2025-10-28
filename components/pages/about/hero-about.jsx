"use client"

import { motion } from "framer-motion"
import { Plane } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0066FF] to-[#0052CC] opacity-90" />
      <img
        src="/about-og-image.png"
        alt="About Us Hero"
        className="absolute inset-0 w-full h-full object-cover opacity-20"
      />

      <div className="relative container mx-auto px-4 pt-24 pb-16 md:py-32 text-center text-white z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 md:px-6 md:py-3 rounded-full mb-6 md:mb-8 border border-white/20">
            <Plane className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-xs md:text-sm font-semibold">Trusted Since 1990</span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8 text-balance leading-tight">
            Your Trusted Partner for
            <br />
            <span className="text-[#00D4AA]">Visa Flight Reservations</span>
          </h1>
          <p className="text-base md:text-xl lg:text-2xl text-gray-100 max-w-3xl mx-auto leading-relaxed text-balance">
            Helping travelers worldwide secure their visas with authentic, embassy-approved flight reservations for
            over 35 years
          </p>
        </motion.div>
      </div>
    </section>
  )
}
