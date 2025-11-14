"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { TrendingUp, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/translations"

export function AffiliateCard({
  commissionRate = "15%",
  cookieDuration = "30 days",
  minPayout = "$50",
  onButtonClick,
  showFeatures = true
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const { t, isLoading } = useTranslation()

  // Use translated content or fallbacks
  const title = t('homepage.affiliate.title')
  const subtitle = t('homepage.affiliate.subtitle')
  const description = t('homepage.affiliate.description')
  const commission = t('homepage.affiliate.commission')
  const cookieDurationText = t('homepage.affiliate.cookieDuration')
  const minPayoutText = t('homepage.affiliate.minPayout')
  const buttonText = t('homepage.affiliate.buttonText')
  const features = isLoading
    ? ["Real-time tracking", "Monthly payouts", "Dedicated support"]
    : Array.isArray(t('homepage.affiliate.features'))
      ? t('homepage.affiliate.features')
      : [];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-4 md:p-6 shadow-xl border border-white/50">
        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-[#0066FF] to-[#00D4AA] flex items-center justify-center">
            <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-600">{subtitle}</p>
          </div>
        </div>

        <p className="text-gray-700 text-xs md:text-sm leading-relaxed mb-4 md:mb-6">
          {description}
        </p>

        <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
          <div className="flex items-center justify-between p-2.5 md:p-3 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl">
            <span className="text-xs md:text-sm font-medium text-gray-700">{commission}</span>
            <span className="text-base md:text-lg font-bold text-[#0066FF]">{commissionRate}</span>
          </div>
          <div className="flex items-center justify-between p-2.5 md:p-3 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl">
            <span className="text-xs md:text-sm font-medium text-gray-700">{cookieDurationText}</span>
            <span className="text-base md:text-lg font-bold text-[#00D4AA]">{cookieDuration}</span>
          </div>
          <div className="flex items-center justify-between p-2.5 md:p-3 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl">
            <span className="text-xs md:text-sm font-medium text-gray-700">{minPayoutText}</span>
            <span className="text-base md:text-lg font-bold text-[#0066FF]">{minPayout}</span>
          </div>
        </div>

        <Button 
          onClick={onButtonClick}
          className="w-full py-4 md:py-6 rounded-xl font-semibold bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white hover:shadow-xl hover:shadow-[#0066FF]/30 transition-all group text-sm md:text-base"
        >
          {buttonText}
          <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
        </Button>

        {showFeatures && (
          <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              {features.join(" • ")}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
