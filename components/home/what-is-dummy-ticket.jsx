"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Plane, CheckCircle, FileText, Shield, Sparkles } from "lucide-react"

export function WhatIsDummyTicket() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-12 md:py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-blue-50 rounded-full mb-4 md:mb-6">
            <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#0066FF]" />
            <span className="text-xs md:text-sm font-semibold text-[#0066FF]">Learn More</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4 tracking-tight">
            Understanding Dummy Tickets
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto font-normal">
            Everything you need to know about flight reservations for visa applications
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-4 md:gap-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="group relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-br from-[#0066FF] via-[#0052CC] to-[#003D99] rounded-3xl opacity-0 group-hover:opacity-20 transition-all duration-500 blur-2xl"></div>
            <div className="relative bg-white rounded-3xl p-5 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 hover:shadow-[0_20px_60px_rgba(255,255,255,1)] hover:border-blue-200 transition-all duration-500 hover:-translate-y-2">
              <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-[#0066FF] to-[#0052CC] flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">What is a Dummy Ticket?</h3>
              </div>

              <p className="text-gray-600 leading-relaxed mb-6 md:mb-8 font-normal text-sm md:text-base">
                A dummy ticket is a verifiable flight reservation that looks exactly like a regular airline ticket with
                a valid PNR (Passenger Name Record) or booking reference number.
              </p>

              <div className="space-y-3 md:space-y-4">
                {[
                  { title: "Valid PNR Code", desc: "6-digit alphanumeric code provided by airlines", color: "blue" },
                  { title: "Verifiable Online", desc: 'Check via airline\'s "Manage Booking" tool', color: "blue" },
                  { title: "Also Known As", desc: "Flight reservation or travel itinerary", color: "blue" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="relative group/item"
                  >
                    <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-[#0066FF] to-[#0052CC] flex items-center justify-center flex-shrink-0 shadow-sm">
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 mb-1 text-sm md:text-base">{item.title}</p>
                        <p className="text-xs md:text-sm text-gray-600 font-normal leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-br from-[#0066FF] via-[#0052CC] to-[#003D99] rounded-3xl opacity-0 group-hover:opacity-20 transition-all duration-500 blur-2xl"></div>
            <div className="relative bg-white rounded-3xl p-5 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 hover:shadow-[0_20px_60px_rgba(255,255,255,1)] hover:border-blue-200 transition-all duration-500 hover:-translate-y-2">
              <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-[#0066FF] to-[#0052CC] flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">What is it Used For?</h3>
              </div>

              <p className="text-gray-600 leading-relaxed mb-6 md:mb-8 font-normal text-sm md:text-base">
                Primarily used for visa applications where embassies require proof of travel plans. Also serves multiple
                other travel-related purposes.
              </p>

              <div className="space-y-2 md:space-y-3">
                {[
                  { icon: Plane, text: "Visa applications & embassy submissions" },
                  { icon: CheckCircle, text: "Proof of return or onward travel" },
                  { icon: FileText, text: "Expedite passport renewal process" },
                  { icon: Shield, text: "Company HR/Manager documentation" },
                  { icon: Plane, text: "Exit visa procedures (GCC countries)" },
                  { icon: CheckCircle, text: "Car rental at airport locations" },
                ].map((item, index) => {
                  const Icon = item.icon
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.3 + 0.05 * index }}
                      className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gradient-to-r from-teal-50 to-white rounded-xl border border-teal-100 hover:border-teal-200 hover:shadow-md transition-all duration-200 group/item"
                    >
                      <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-gradient-to-br from-[#0066FF] to-[#0052CC] flex items-center justify-center flex-shrink-0 shadow-sm group-hover/item:scale-110 transition-transform duration-200">
                        <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                      </div>
                      <span className="text-gray-700 font-medium text-xs md:text-sm">{item.text}</span>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
