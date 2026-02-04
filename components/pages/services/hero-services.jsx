"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { useTranslation } from "@/lib/translations"

export default function HeroSection() {
  const { t, isLoading } = useTranslation()
  const heroRef = useRef(null)

  const heroStyle = {
    backgroundImage: `linear-gradient(rgba(0, 102, 255, 0.7), rgba(0, 82, 204, 0.7)), url(/travel-world-map-abstract.jpg)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }

  if (isLoading) {
    return (
      <section
        ref={heroRef}
        className="w-full flex items-center justify-center text-center pt-32 pb-16 md:pt-40 md:pb-24 bg-[#0066FF]"
        style={heroStyle}
      >
        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 md:h-12 lg:h-16 bg-white/20 rounded-lg mb-4 md:mb-6 mx-auto w-3/4"></div>
              <div className="h-4 md:h-6 lg:h-8 bg-white/20 rounded-lg mx-auto w-1/2"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      ref={heroRef}
      className="w-full flex items-center justify-center text-center pt-32 pb-16 md:pt-40 md:pb-24 bg-[#0066FF]"
      style={heroStyle}
    >
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 text-balance leading-tight">
            {t('services.hero.title')}
          </h1>
          <p className="text-base md:text-xl lg:text-2xl text-white/90 text-pretty leading-relaxed max-w-2xl mx-auto">
            {t('services.hero.subtitle')}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
