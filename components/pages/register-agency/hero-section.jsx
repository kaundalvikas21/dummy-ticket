"use client"

import { motion } from "framer-motion"
import { Building2 } from "lucide-react"

export function Hero() {
  return (
    <section
      className="w-full flex items-center justify-center text-center pt-32 pb-16 md:pt-40 md:pb-24 relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(to bottom right, rgba(0, 102, 255, 0.85), rgba(0, 212, 170, 0.85)), url('/abstract-geometric-flow.png')`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
      }}
    >
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
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