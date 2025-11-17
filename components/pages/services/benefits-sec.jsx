"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { CheckCircle2, Clock, Shield, Headphones } from "lucide-react"
import { useTranslation } from "@/lib/translations"

const benefitsIcons = [CheckCircle2, Clock, Shield, Headphones]

export default function BenefitsSection() {
  const { t, isLoading } = useTranslation()
  const benefitsRef = useRef(null)
  const benefitsInView = useInView(benefitsRef, { once: true, margin: "-100px" })

  if (isLoading) {
    return (
      <section ref={benefitsRef} className="py-12 md:py-24 bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-16">
            <div className="animate-pulse">
              <div className="h-8 md:h-10 lg:h-12 bg-gray-200 rounded-lg mb-4 mx-auto max-w-2xl"></div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="text-center animate-pulse">
                <div className="w-14 h-14 bg-gray-200 rounded-2xl mx-auto mb-4"></div>
                <div className="h-5 bg-gray-200 rounded-lg mb-2 mx-auto max-w-[150px]"></div>
                <div className="h-4 bg-gray-200 rounded mx-auto max-w-[200px]"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const benefits = t('services.benefits.items')

  return (
    <section ref={benefitsRef} className="py-12 md:py-24 bg-gradient-to-br from-blue-50 to-teal-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('services.benefits.title')}</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => {
            const BenefitIcon = benefitsIcons[index]
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0066FF] to-[#00D4AA] flex items-center justify-center mx-auto mb-4">
                  <BenefitIcon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
