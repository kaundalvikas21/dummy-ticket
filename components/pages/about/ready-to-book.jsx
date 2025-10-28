"use client"

import { motion } from "framer-motion"
import { Plane } from "lucide-react"

export default function ReadyToBook() {
  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center bg-gradient-to-br from-blue-50 to-teal-50 rounded-3xl p-6 md:p-12 border border-gray-200"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-6 text-balance">
            Ready to Get Your Dummy Ticket?
          </h2>
          <p className="text-sm md:text-lg text-gray-700 mb-6 md:mb-8 text-balance">
            Join hundreds of thousands of satisfied customers who trust us for their visa applications
          </p>

          <a
            href="/buy-ticket"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white px-6 py-3 md:px-8 md:py-4 rounded-xl text-sm md:text-base font-semibold hover:shadow-lg hover:shadow-[#0066FF]/30 transition-all hover:scale-105 whitespace-nowrap"
          >
            <Plane className="w-4 h-4 md:w-5 md:h-5" />
            <span>Book Your Ticket Now</span>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
