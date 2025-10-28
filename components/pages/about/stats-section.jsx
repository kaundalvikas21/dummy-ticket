"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Users, Globe, Award, CheckCircle2 } from "lucide-react"

export function StatsSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })

  const stats = [
    { icon: Users, value: "500K+", label: "Happy Customers" },
    { icon: Globe, value: "150+", label: "Countries Served" },
    { icon: Award, value: "35+", label: "Years Experience" },
    { icon: CheckCircle2, value: "99.9%", label: "Success Rate" },
  ]

  return (
    <section ref={ref} className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-[#0066FF] to-[#00D4AA] mb-3 md:mb-4 shadow-lg shadow-[#0066FF]/20">
                <stat.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2">{stat.value}</div>
              <div className="text-sm md:text-base text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
