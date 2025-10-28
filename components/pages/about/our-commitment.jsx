"use client"

import { motion } from "framer-motion"
import { useRef } from "react"
import { useInView } from "framer-motion"
import { TrendingUp, Target, Heart } from "lucide-react"

export default function OurCommitment() {
  const commitmentRef = useRef(null)
  const inView = useInView(commitmentRef, { once: true, margin: "-100px" })

  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description:
        "To simplify the visa application process by providing authentic, reliable flight reservations that help travelers achieve their dreams of exploring the world.",
    },
    {
      icon: TrendingUp,
      title: "Our Vision",
      description:
        "To be the world's most trusted platform for dummy tickets, setting the standard for quality, reliability, and customer satisfaction in the travel documentation industry.",
    },
    {
      icon: Heart,
      title: "Our Values",
      description:
        "Integrity, transparency, and customer-first approach guide everything we do. We believe in building lasting relationships through exceptional service and unwavering commitment to quality.",
    },
  ]

  return (
    <section
      ref={commitmentRef}
      className="py-12 md:py-20 bg-gradient-to-br from-[#0066FF] to-[#0052CC] text-white relative overflow-hidden"
    >
      {/* Background Gradient Circles */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00D4AA] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FF6B35] rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-balance">
            Our Commitment to You
          </h2>
          <p className="text-base md:text-xl text-gray-100 max-w-3xl mx-auto text-balance">
            Driven by passion, guided by values, focused on your success
          </p>
        </motion.div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 md:p-8 border border-white/20 hover:bg-white/15 transition-all"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white/20 flex items-center justify-center mb-4 md:mb-6">
                <value.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">{value.title}</h3>
              <p className="text-sm md:text-base text-gray-100 leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
