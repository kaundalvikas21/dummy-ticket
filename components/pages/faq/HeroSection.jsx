"use client"

import { motion } from "framer-motion"
import { Search, HelpCircle } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function HeroSection({ searchQuery, setSearchQuery }) {
  return (
    <section className="relative pt-24 pb-16 md:py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0066FF]/10 via-transparent to-[#00D4AA]/10" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#0066FF] rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#00D4AA] rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 py-1 md:px-4 md:py-2 rounded-full bg-white/80 backdrop-blur-sm border border-[#0066FF]/20 mb-3 md:mb-6">
            <HelpCircle className="w-3 h-3 md:w-4 md:h-4 text-[#0066FF]" />
            <span className="text-[10px] md:text-sm font-medium text-gray-700">
              Help Center
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-gray-900 mb-3 md:mb-6 text-balance">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] bg-clip-text text-transparent">
              Questions
            </span>
          </h1>

          <p className="text-base md:text-xl lg:text-2xl text-gray-600 mb-6 md:mb-12 leading-relaxed">
            Find answers to common questions about dummy tickets, booking
            process, and visa applications
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-6 text-sm md:text-lg rounded-2xl border-2 border-gray-200 focus:border-[#0066FF] bg-white/80 backdrop-blur-sm"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
