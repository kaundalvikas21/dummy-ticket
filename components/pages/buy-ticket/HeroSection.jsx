"use client"

import { motion } from "framer-motion"
import { Check, Shield } from "lucide-react"
import { useTranslation } from "@/lib/translations"

export function HeroSection() {
  const { t } = useTranslation()

  const features = [
    t('buyTicket.hero.features.instantDelivery'),
    t('buyTicket.hero.features.validPnr'),
    t('buyTicket.hero.features.secure'),
    t('buyTicket.hero.features.support')
  ]

  return (
    <div className="relative bg-gradient-to-br from-[#0066FF] to-[#0052CC] pt-24 md:pt-32 pb-12 md:pb-20 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/airplane-flying-clouds-professional.jpg"
          alt="Booking Background"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0066FF]/50 to-[#0052CC]/50" />
      </div>

      {/* Hero Content */}
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-1.5 md:gap-2 bg-white/10 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full text-white text-xs md:text-sm mb-4 md:mb-6"
          >
            <Shield className="w-3 h-3 md:w-4 md:h-4" />
            <span>{t('buyTicket.hero.subtitle')}</span>
          </motion.div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6">
            {t('buyTicket.hero.title')}
          </h1>

          <p className="text-base md:text-xl text-white/90 max-w-3xl mx-auto mb-6 md:mb-8 px-4">
            {t('buyTicket.hero.description')}
          </p>

          <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-white/90 text-sm md:text-base">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-1.5 md:gap-2">
                <Check className="w-4 h-4 md:w-5 md:h-5 text-[#00D4AA]" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}