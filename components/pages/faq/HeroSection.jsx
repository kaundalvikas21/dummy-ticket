"use client"

import { motion } from "framer-motion"
import { Search, HelpCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useTranslation } from "@/lib/translations"

export default function HeroSection({ searchQuery, setSearchQuery }) {
  const { t } = useTranslation()
  return (
    <section
      className="w-full flex items-center justify-center text-center pt-32 pb-16 md:pt-40 md:pb-24 relative overflow-hidden bg-white"
      style={{
        backgroundImage: `linear-gradient(to bottom right, rgba(0, 102, 255, 0.1), transparent, rgba(0, 212, 170, 0.1))`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Background Blobs - Best practice for specific blurs and animations */}
      <div className="absolute inset-0 z-0 opacity-30 select-none pointer-events-none">
        <div className="absolute top-10 left-[5%] w-72 h-72 bg-[#0066FF] rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-[5%] w-96 h-96 bg-[#00D4AA] rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 py-1 md:px-4 md:py-2 rounded-full bg-white/80 backdrop-blur-sm border border-[#0066FF]/20 mb-3 md:mb-6 shadow-sm">
            <HelpCircle className="w-3 h-3 md:w-4 md:h-4 text-[#0066FF]" />
            <span className="text-[10px] md:text-sm font-medium text-gray-700">
              {t('faqPage.hero.helpCenter')}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-gray-900 mb-3 md:mb-6 text-balance">
            {t('faqPage.hero.title')} {" "}
            <span className="bg-linear-to-r from-[#0066FF] to-[#00D4AA] bg-clip-text text-transparent">
              {t('faqPage.hero.titleHighlight')}
            </span>
          </h1>

          <p className="text-base md:text-xl lg:text-2xl text-gray-600 mb-6 md:mb-12 leading-relaxed">
            {t('faqPage.hero.subtitle')}
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            <Input
              type="text"
              placeholder={t('faqPage.hero.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-6 text-sm md:text-lg rounded-2xl border-2 border-gray-100 focus:border-[#0066FF] bg-white/80 backdrop-blur-sm"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
