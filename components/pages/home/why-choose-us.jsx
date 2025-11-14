"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Zap, Shield, Users } from "lucide-react"
import { useTranslation } from "@/lib/translations"

export function WhyChooseUs() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const { t, isLoading } = useTranslation()

  // Fallback data in case translations are not loaded yet
  const fallbackReasons = [
    {
      icon: Zap,
      title: "Quick delivery",
      description: "Get your dummy ticket within minutes of placing your order",
    },
    {
      icon: Shield,
      title: "Verifiable flight reservations",
      description: "All our tickets have valid PNR codes that can be verified on airline websites",
    },
    {
      icon: Users,
      title: "Experienced staff",
      description: "Multi-lingual support team with years of experience in visa documentation",
    },
  ]

  const reasons = isLoading ? fallbackReasons :
    (Array.isArray(t('whyChooseUs.reasons')) ? t('whyChooseUs.reasons').map((reasonData, index) => ({
      ...reasonData,
      icon: [Zap, Shield, Users][index]
    })) : fallbackReasons)

  return (
    <section ref={ref} className="py-12 md:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <p className="text-xs md:text-sm font-semibold text-[#0066FF] mb-2 uppercase tracking-wide">
            {t('whyChooseUs.whyUs')}
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">{t('whyChooseUs.title')}</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 * index }}
              className="bg-white rounded-3xl p-5 md:p-8 border border-gray-200 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-[#0066FF] to-[#00D4AA] flex items-center justify-center mb-4 md:mb-6">
                <reason.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">{reason.title}</h3>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">{reason.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
