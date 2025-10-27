"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-20">
      <div className="absolute inset-0">
        <img
          src="/modern-airport-terminal-with-planes-and-travelers-.jpg"
          alt="Travel Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0066FF]/85 via-[#0066FF]/75 to-[#00D4AA]/70" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-12 md:py-16 lg:py-20">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-white mb-6 md:mb-8 leading-tight text-balance tracking-tight">
              Dummy Tickets for Visa Applications
            </h1>

            <p className="text-base md:text-xl lg:text-2xl text-white/95 mb-8 md:mb-14 font-normal text-balance leading-relaxed max-w-3xl mx-auto">
              Get verifiable flight reservations instantly for visa applications, proof of return, and travel planning
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 mb-8 md:mb-12 max-w-2xl mx-auto">
              {[
                { icon: Shield, text: "Embassy Approved" },
                { icon: Clock, text: "5-Min Delivery" },
                { icon: CheckCircle, text: "100% Verifiable" },
              ].map((item, index) => (
                <div
                  key={item.text}
                  className={`flex items-center justify-center gap-1.5 md:gap-2 px-3 py-2 md:px-5 md:py-3 bg-white/95 backdrop-blur-sm rounded-full shadow-lg ${
                    index === 2 ? "col-span-2 md:col-span-1" : ""
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#0066FF]" />
                  <span className="text-xs md:text-sm font-medium text-gray-700">{item.text}</span>
                </div>
              ))}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Link href="/buy-ticket">
                <Button
                  size="lg"
                  className="bg-white text-[#0066FF] text-base md:text-lg px-6 py-5 md:px-10 md:py-7 rounded-2xl hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all group font-semibold"
                >
                  Get Your Ticket Now
                  <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
