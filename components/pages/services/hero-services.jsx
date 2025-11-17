"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { useTranslation } from "@/lib/translations"

export default function HeroSection() {
  const { t, isLoading } = useTranslation()
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })

  if (isLoading) {
    return (
      <section ref={heroRef} className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0066FF] to-[#0052CC] opacity-90" />
        <div className="absolute inset-0 bg-[url('/travel-world-map-abstract.jpg')] opacity-10 bg-cover bg-center" />
        <div className="container mx-auto px-4 pt-24 pb-16 md:py-32 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 md:h-12 lg:h-16 bg-white/20 rounded-lg mb-4 md:mb-6 mx-auto"></div>
              <div className="h-4 md:h-6 lg:h-8 bg-white/20 rounded-lg mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section ref={heroRef} className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0066FF] to-[#0052CC] opacity-90" />
      <div className="absolute inset-0 bg-[url('/travel-world-map-abstract.jpg')] opacity-10 bg-cover bg-center" />

      <div className="container mx-auto px-4 pt-24 pb-16 md:py-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 text-balance leading-tight">
            {t('services.hero.title')}
          </h1>
          <p className="text-base md:text-xl lg:text-2xl text-white/90 text-pretty leading-relaxed">
            {t('services.hero.subtitle')}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
