"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2, Plane, Hotel, ArrowLeftRight, FileText, Calendar, Globe2 } from "lucide-react"

const mainServices = [
  {
    icon: Plane,
    title: "Dummy Ticket for Visa",
    description: "Verifiable flight reservation with valid PNR for visa applications. Perfect for embassy submissions.",
    features: ["Valid PNR code", "Verifiable on airline website", "Up to 4 changes allowed", "Instant delivery"],
    price: "$19",
    image: "/airplane-flying-clouds-professional.jpg",
    popular: false,
  },
  {
    icon: Hotel,
    title: "Dummy Ticket & Hotel",
    description: "Complete package with flight reservation and hotel booking for comprehensive visa documentation.",
    features: ["Flight + Hotel booking", "Accommodation up to 1 month", "Both verifiable", "Perfect for visa"],
    price: "$35",
    image: "/luxury-hotel-lobby-modern.jpg",
    popular: true,
  },
  {
    icon: ArrowLeftRight,
    title: "Return Ticket",
    description: "Round-trip flight reservation for proof of return. Accepted by immigration worldwide.",
    features: ["Return flight included", "Valid PNR code", "Immigration accepted", "Quick processing"],
    price: "$15",
    image: "/airport-departure-board-international.jpg",
    popular: false,
  },
  {
    icon: FileText,
    title: "Ticket with E-Receipt",
    description: "Flight reservation with official e-ticket receipt for enhanced verification and credibility.",
    features: ["E-ticket included", "Official receipt", "Enhanced verification", "Premium service"],
    price: "$49",
    image: "/airline-ticket-document-professional.jpg",
    popular: false,
  },
  {
    icon: Calendar,
    title: "Past Dated Tickets",
    description: "Historical flight reservations for special requirements and backdated documentation needs.",
    features: ["Custom dates", "Backdated tickets", "Special requests", "Expert support"],
    price: "$35",
    image: "/calendar-travel-planning-professional.jpg",
    popular: false,
  },
  {
    icon: Globe2,
    title: "Hotel Booking Only",
    description: "Standalone hotel reservation for visa applications with worldwide hotel coverage.",
    features: ["Hotel confirmation", "Verifiable booking", "Flexible duration", "Worldwide hotels"],
    price: "$20",
    image: "/hotel-room-booking-luxury.jpg",
    popular: false,
  },
]

export default function MainServices() {
  const mainRef = useRef(null)
  const mainInView = useInView(mainRef, { once: true, margin: "-100px" })

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
          {mainServices.map((service, index) => (
            <motion.div
              key={service.title}
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
                    alt={service.title}
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
                      <service.icon
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
                    {service.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600">{service.description}</p>

                  <ul className="space-y-2 mt-3">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle2
                          className={`w-4 h-4 ${
                            service.popular ? "text-[#0066FF]" : "text-[#00D4AA]"
                          }`}
                        />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-4 mt-auto border-t border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`text-3xl font-bold ${
                            service.popular
                              ? "bg-gradient-to-r from-[#0066FF] to-[#00D4AA] bg-clip-text text-transparent"
                              : "text-gray-900"
                          }`}
                        >
                          {service.price}
                        </span>
                        <span className="text-gray-500 text-sm">/ person</span>
                      </div>
                    </div>

                    <Link
                      href={{
                        pathname: "/buy-ticket",
                        query: { title: service.title, price: service.price },
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
          ))}
        </div>
      </div>
    </section>
  )
}
