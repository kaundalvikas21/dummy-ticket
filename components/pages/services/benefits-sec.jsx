"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { CheckCircle2, Clock, Shield, Headphones } from "lucide-react"

const benefits = [
  { icon: CheckCircle2, title: "100% Verifiable", description: "All tickets can be verified on airline websites" },
  { icon: Clock, title: "Instant Delivery", description: "Receive your ticket within minutes" },
  { icon: Shield, title: "Secure & Trusted", description: "Safe payment and data protection" },
  { icon: Headphones, title: "24/7 Support", description: "Expert assistance whenever you need" },
]

export default function BenefitsSection() {
  const benefitsRef = useRef(null)
  const benefitsInView = useInView(benefitsRef, { once: true, margin: "-100px" })

  return (
    <section ref={benefitsRef} className="py-12 md:py-24 bg-gradient-to-br from-blue-50 to-teal-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Our Services</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0066FF] to-[#00D4AA] flex items-center justify-center mx-auto mb-4">
                <benefit.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
              <p className="text-sm text-gray-600">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
