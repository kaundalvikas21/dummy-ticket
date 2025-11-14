"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Plane, FileCheck, BookOpen, Briefcase, Globe, Car } from "lucide-react"
import { useTranslation } from "@/lib/translations"

export function UseCases() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const { t, isLoading } = useTranslation()

  // Fallback data in case translations are not loaded yet
  const fallbackCases = [
    {
      title: "Visa Applications",
      description: "Required by embassies and consulates worldwide for visa processing",
      icon: FileCheck,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Proof of Return",
      description: "Show immigration officers your onward or return travel plans",
      icon: Plane,
      color: "from-teal-500 to-teal-600",
    },
    {
      title: "Passport Services",
      description: "Expedite passport renewal with proof of upcoming travel",
      icon: BookOpen,
      color: "from-indigo-500 to-indigo-600",
    },
    {
      title: "Work Leave",
      description: "Submit to HR or managers for leave approval documentation",
      icon: Briefcase,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Exit Visa",
      description: "Required for exit visa procedures in GCC countries",
      icon: Globe,
      color: "from-cyan-500 to-cyan-600",
    },
    {
      title: "Car Rental",
      description: "Rent vehicles at airport locations with flight proof",
      icon: Car,
      color: "from-orange-500 to-orange-600",
    },
  ]

  const useCases = isLoading ? fallbackCases :
    (Array.isArray(t('useCases.cases')) ? t('useCases.cases').map((caseData, index) => ({
      ...caseData,
      icon: [FileCheck, Plane, BookOpen, Briefcase, Globe, Car][index],
      color: [
        "from-blue-500 to-blue-600",
        "from-teal-500 to-teal-600",
        "from-indigo-500 to-indigo-600",
        "from-purple-500 to-purple-600",
        "from-cyan-500 to-cyan-600",
        "from-orange-500 to-orange-600"
      ][index]
    })) : fallbackCases)

  return (
    <section ref={ref} className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4">{t('useCases.title')}</h2>
          <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto">
            {t('useCases.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
          {useCases.map((useCase, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-3xl p-5 md:p-8 border border-gray-200 shadow-sm hover:shadow-lg transition-all"
            >
              <div
                className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br ${useCase.color} flex items-center justify-center mb-4 md:mb-6 shadow-md`}
              >
                <useCase.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">{useCase.title}</h3>
              <p className="text-gray-600 leading-relaxed text-xs md:text-sm">{useCase.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
