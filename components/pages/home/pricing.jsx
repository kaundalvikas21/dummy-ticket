"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import Link from "next/link"

const pricingPlans = [
  {
    name: "DUMMY TICKET FOR VISA",
    price: "19",
    currencies: "19 USD | 1200 INR | 70 AED | 16 EUR | 14.50 GBP",
    description: "Person",
    features: [
      "Flight reservation/ itinerary",
      "verifiable on airline website",
      "Up to 4 changes allowed",
      "Use for visa application/ proof of return",
    ],
    cta: "BUY TICKET",
    popular: false,
  },
  {
    name: "DUMMY TICKET & HOTEL",
    price: "35",
    currencies: "35 USD | 2750 INR | 128 AED | 30 EUR | 26.70 GBP",
    description: "Person",
    features: [
      "Actual reservation from airline/hotel",
      "Verifiable on airline/hotel website",
      "Accomodation up to one month",
      "Up to 4 changes allowed",
      "Use for visa application/ proof of return",
    ],
    cta: "BUY TICKET",
    popular: true,
  },
  {
    name: "DUMMY RETURN TICKET",
    price: "15",
    currencies: "15 USD | 990 INR | 55 AED | 14 EUR | 12.50 GBP",
    description: "Person",
    features: [
      "Return ticket for showing in immigration",
      "Verifiable flight reservation with PNR",
      "Can be used to show as proof of return or onward travel in most countries",
    ],
    cta: "BUY TICKET",
    popular: false,
  },
]

export function Pricing() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="pricing" ref={ref} className="py-12 md:py-24 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-16"
        >
          <p className="text-sm md:text-lg font-semibold text-[#0066FF] mb-2 uppercase tracking-wide">AFFORDABLE</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 text-balance">Pricing</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-3 md:-top-6 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white px-3 md:px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div
                className={`bg-white rounded-3xl p-5 md:p-8 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 h-full ${
                  plan.popular ? "border-[#0066FF] shadow-lg md:scale-105" : ""
                }`}
              >
                <div className="text-center mb-6 md:mb-8">
                  <h3 className="text-base md:text-xl font-bold text-gray-900 mb-3 md:mb-4 uppercase">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-0.5 mb-2">
                    <span className="text-3xl md:text-4xl font-bold text-gray-700">$</span>
                    <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#0066FF] to-[#00D4AA] bg-clip-text text-transparent">
                      {plan.price}
                    </span>
                    <span className="text-sm md:text-base text-gray-500 ml-1">/ person</span>
                  </div>
                </div>

                <ul className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 md:gap-3">
                      <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-[#00D4AA]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-[#00D4AA]" />
                      </div>
                      <span className="text-gray-700 text-xs md:text-sm leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl">
                  <p className="text-xs text-gray-600 text-center leading-relaxed">{plan.currencies}</p>
                </div>

                <Link href="/buy-ticket">
                  <Button
                    className={`w-full py-4 md:py-6 rounded-xl font-semibold transition-all text-sm md:text-base cursor-pointer ${
                      plan.popular
                        ? "bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white hover:shadow-xl hover:shadow-[#0066FF]/30"
                        : "bg-white border-2 border-gray-200 text-gray-900 hover:border-[#0066FF] hover:text-[#0066FF] hover:bg-gray-50"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
