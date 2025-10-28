"use client"

import { motion } from "framer-motion"
import { Building2 } from "lucide-react"

export function Hero() {
  return (
    <section className="pt-24 pb-16 md:py-32 bg-gradient-to-br from-[#0066FF] to-[#00D4AA] relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/abstract-geometric-flow.png')] opacity-10" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 md:px-6 md:py-2.5 rounded-full mb-6 md:mb-8">
            <Building2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
            <span className="text-white text-xs md:text-sm font-semibold">Partner Program</span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 text-balance">
            Register Your Travel Agency
          </h1>

          <p className="text-base md:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto text-balance">
            Join our network of trusted travel partners and offer dummy tickets to your clients
          </p>
        </motion.div>
      </div>
    </section>
  )
}