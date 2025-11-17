"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2, Plane, Hotel, ArrowLeftRight, FileText, Calendar, Globe2 } from "lucide-react"


export default function MainServices({ servicePlans }) {
  const mainRef = useRef(null)
  const mainInView = useInView(mainRef, { once: true, margin: "-100px" })

  // Helper function to map service IDs to Lucide icons
  const getServiceIcon = (id) => {
    switch (id) {
      case "visa-ticket":
        return Plane
      case "ticket-hotel":
        return Hotel
      case "return-ticket":
        return ArrowLeftRight
      case "ticket-receipt":
        return FileText
      case "past-dated":
        return Calendar
      case "hotel-only":
        return Globe2
      default:
        return Plane // Default icon
    }
  }

  return (
    <section ref={mainRef} className="py-12 md:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={mainInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4">Our Main Services</h2>
          <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
            Professional dummy ticket services trusted by thousands of travelers worldwide
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {servicePlans.map((service, index) => {
            const ServiceIcon = getServiceIcon(service.id)
            const priceParts = service.currencies.split(' | ')[0].split(' ') 
            const priceValue = priceParts[0]
            const priceCurrency = priceParts[1]

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                animate={mainInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative"
              >
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                    <span className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div
                  className={`relative bg-white rounded-2xl overflow-hidden transition-all duration-500 h-full flex flex-col ${
                    service.popular
                      ? "shadow-xl hover:shadow-2xl border-2 border-transparent bg-gradient-to-br from-white via-white to-blue-50/30"
                      : "shadow-md hover:shadow-xl border border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="relative h-48 md:h-56 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent z-10" />
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute bottom-3 left-3 z-20">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm ${
                          service.popular
                            ? "bg-gradient-to-br from-[#0066FF] to-[#00D4AA]"
                            : "bg-white/90 group-hover:bg-white"
                        }`}
                      >
                        <ServiceIcon
                          className={`w-6 h-6 ${service.popular ? "text-white" : "text-[#0066FF]"}`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-5 md:p-8 flex-1 flex flex-col">
                    <h3
                      className={`text-xl md:text-2xl font-bold mb-2 ${
                        service.popular ? "text-gray-900" : "text-gray-900 group-hover:text-[#0066FF]"
                      }`}
                    >
                      {service.name}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600">
                      {service.description} 
                    </p>

                    <ul className="space-y-2 mt-3">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <CheckCircle2
                            className={`w-4 h-4 flex-shrink-0 ${
                              service.popular ? "text-[#0066FF]" : "text-[#00D4AA]"
                            }`}
                          />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="pt-4 mt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-baseline gap-1">
                          <span
                            className={`text-3xl font-bold ${
                              service.popular
                                ? "bg-gradient-to-r from-[#0066FF] to-[#00D4AA] bg-clip-text text-transparent"
                                : "text-gray-900"
                            }`}
                          >
                            ${priceValue}
                          </span>
                          <span className="text-gray-500 text-sm">/person</span>
                        </div>
                      </div>

                      <Link
                        href={{
                          pathname: "/buy-ticket",
                          query: { serviceId: service.id },
                        }}
                      >
                        <Button
                            className={`w-full py-5 md:py-6 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 cursor-pointer ${
                              service.popular
                                ? "bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white hover:shadow-lg hover:-translate-y-0.5 border-0"
                                : "bg-white border-2 border-gray-200 text-gray-900 hover:border-[#0066FF] hover:text-[#0066FF] hover:bg-gray-50"
                            }`}
                          >
                            Book Now
                          </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
