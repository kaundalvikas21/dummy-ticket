"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import {
  Shield,
  Clock,
  FileCheck,
  HeadphonesIcon,
  Globe,
  Award,
} from "lucide-react"
import { useTranslation } from "@/lib/translations"

export default function WhyChooseUs() {
  const { t } = useTranslation()
  const whyChooseUsRef = useRef(null)
  const whyChooseUsInView = useInView(whyChooseUsRef, { once: true, margin: "-100px" })

  // Use the features from translations
  const features = [
    {
      icon: Shield,
      title: t('about.whyChooseUs.features.0.title'),
      description: t('about.whyChooseUs.features.0.description'),
    },
    {
      icon: Clock,
      title: t('about.whyChooseUs.features.1.title'),
      description: t('about.whyChooseUs.features.1.description'),
    },
    {
      icon: FileCheck,
      title: t('about.whyChooseUs.features.2.title'),
      description: t('about.whyChooseUs.features.2.description'),
    },
    {
      icon: HeadphonesIcon,
      title: t('about.whyChooseUs.features.3.title'),
      description: t('about.whyChooseUs.features.3.description'),
    },
    {
      icon: Globe,
      title: t('about.whyChooseUs.features.4.title'),
      description: t('about.whyChooseUs.features.4.description'),
    },
    {
      icon: Award,
      title: t('about.whyChooseUs.features.5.title'),
      description: t('about.whyChooseUs.features.5.description'),
    },
  ]

  return (
    <section ref={whyChooseUsRef} className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={whyChooseUsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 text-balance">
            {t('about.whyChooseUs.whyChooseTitle')} <span className="text-[#0066FF]">{t('about.whyChooseUs.whyChooseHighlight')}</span>?
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto text-balance">
            {t('about.whyChooseUs.whyChooseDescription')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={whyChooseUsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-5 md:p-8 border border-gray-200 hover:border-[#0066FF]/30 hover:shadow-[0_8px_30px_rgb(0,102,255,0.12)] transition-all duration-300 group"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-[#0066FF]/10 to-[#00D4AA]/10 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 md:w-7 md:h-7 text-[#0066FF]" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">{feature.title}</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
