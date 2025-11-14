"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "@/lib/translations"

export function OtherServices() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const { t, isLoading } = useTranslation()

  // Fallback data in case translations are not loaded yet
  const fallbackServices = [
    {
      title: "Past dated tickets",
      price: "35 USD | 2400 INR | 128 AED | 32 EUR | 28 GBP",
      cta: "Read more",
      link: "/services/past-dated-tickets",
    },
    {
      title: "Schengen Plus UK",
      subtitle: "Dummy ticket with e-receipt",
      price: "39 GBP",
      cta: "Read more",
      link: "/services/schengen-plus-uk",
    },
    {
      title: "Dummy ticket with e-ticket",
      subtitle: "For proof of return",
      price: "49 USD | 3500 INR | 180 AED",
      cta: "Read more",
      link: "/services/dummy-ticket-proof-of-return",
    },
    {
      title: "Dummy hotel booking",
      price: "20 USD | 1400 INR | 70 AED | 18 EUR | 16 GBP",
      cta: "Buy now",
      link: "/buy-ticket",
    },
    {
      title: "Dummy ticket with e-ticket",
      subtitle: "For visa application",
      price: "79 USD | 6500 INR | 290 AED",
      cta: "Read more",
      link: "/services/dummy-ticket-visa-application",
    },
    {
      title: "Schengen Plus",
      subtitle: "Dummy ticket with e-ticket number",
      price: "59 USD | 4900 INR | 210 AED",
      cta: "Read more",
      link: "/services/schengen-plus",
    },
  ]

  const services = isLoading ? fallbackServices :
    (Array.isArray(t('homepage.otherServices.services')) ? t('homepage.otherServices.services').map((service, index) => ({
      ...service,
      link: [
        "/services/past-dated-tickets",
        "/services/schengen-plus-uk",
        "/services/dummy-ticket-proof-of-return",
        "/buy-ticket",
        "/services/dummy-ticket-visa-application",
        "/services/schengen-plus"
      ][index]
    })) : fallbackServices)

  return (
    <section ref={ref} className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('homepage.otherServices.title')}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto mb-8 md:mb-12">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 * index }}
              className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-3xl p-4 md:p-6 border border-blue-100 hover:shadow-xl transition-all group"
            >
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                {service.title}
              </h3>
              {service.subtitle && (
                <p className="text-xs md:text-sm text-gray-600 mb-3">
                  {service.subtitle}
                </p>
              )}
              <p className="text-base md:text-lg font-semibold text-[#0066FF] mb-3 md:mb-4">
                {service.price}
              </p>

              {/* Navigate using Link */}
              <Link href={service.link}>
                <Button
                  variant="outline"
                  className="w-full border-[#0066FF] text-[#0066FF] hover:bg-[#0066FF] hover:text-white group-hover:shadow-lg transition-all bg-transparent text-sm md:text-base py-2 md:py-2.5 cursor-pointer"
                >
                  {service.cta}
                  <ArrowRight className="ml-2 w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Link href="/services">
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white px-6 py-4 md:px-8 md:py-6 rounded-2xl hover:shadow-xl transition-all text-sm md:text-base cursor-pointer"
            >
              {t('homepage.otherServices.viewAll')}
              <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
