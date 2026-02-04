"use client"

import { motion } from "framer-motion"
import { Plane } from "lucide-react"
import { useTranslation } from "@/lib/translations"

export default function HeroSection() {
  const { t } = useTranslation()
  return (
    <section
      className="w-full flex items-center justify-center text-center pt-32 pb-16 md:pt-40 md:pb-24"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 102, 255, 0.7), rgba(0, 82, 204, 0.7)), url(/about-og-image.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="relative container mx-auto text-center text-white z-10">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 md:px-6 md:py-3 rounded-full mb-6 md:mb-8 border border-white/20">
            <Plane className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-xs md:text-sm font-semibold">{t('about.hero.trustedSince')}</span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8 text-balance leading-tight">
            {t('about.hero.heroTitle')}
            <br />
            <span className="text-[#00D4AA]">{t('about.hero.heroTitleHighlight')}</span>
          </h1>
          <p className="text-base md:text-xl lg:text-2xl text-gray-100 max-w-3xl mx-auto leading-relaxed text-balance">
            {t('about.hero.heroDescription')}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
