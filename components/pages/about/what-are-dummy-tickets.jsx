"use client"

import { motion } from "framer-motion"
import { FileCheck, CheckCircle2 } from "lucide-react"

export function WhatAreDummyTickets() {
  const steps = [
    "Select your desired route and travel dates",
    "Complete the booking with your passenger details",
    "Receive your flight reservation instantly via email",
    "Submit it with your visa application",
    "Valid PNR code verifiable with airlines",
  ]

  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center mb-10 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            What Are <span className="text-[#0066FF]">Dummy Tickets</span>?
          </h2>
          <p className="text-base md:text-lg text-gray-700 leading-relaxed">
            A dummy ticket, also known as a flight reservation or flight itinerary, is a temporary booking used as proof of travel plans for visa applications.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0066FF] to-[#00D4AA] flex items-center justify-center mb-6">
              <FileCheck className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Why You Need It</h3>
            <p className="text-base text-gray-700 mb-4">
              Embassies require proof of onward travel for visa applications. Buying real tickets early is risky and expensive.
            </p>
            <p className="text-base text-gray-700">
              Dummy tickets solve this by providing authentic, verifiable reservations without financial risk.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00D4AA] to-[#0066FF] flex items-center justify-center mb-6">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h3>
            <ul className="space-y-3">
              {steps.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#00D4AA] mt-0.5" />
                  <span className="text-base text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
