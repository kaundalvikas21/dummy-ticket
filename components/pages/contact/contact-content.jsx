"use client"

import React, { useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { PhoneIcon } from "lucide-react"

// --- Custom SVG Icons ---
const UserIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
)

const MailIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
)

const PhoneIconSVG = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
)

const MessageIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
    />
  </svg>
)

// --- Main Component ---
export default function ContactContent() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
  }

  return (
    <section ref={ref} className="py-12 md:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-6 md:mb-8">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-[#0066FF] to-[#00D4AA] flex items-center justify-center">
              <PhoneIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Get a call back!</h2>
          </div>

          <p className="text-gray-600 mb-6 md:mb-8 text-center text-sm md:text-base">
            Fill up the form below and one of us will get in touch with you
          </p>

          {/* Contact Form */}
          <div className="bg-white rounded-3xl p-5 md:p-8 shadow-lg border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* Name */}
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none text-gray-400">
                    <UserIcon />
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0066FF] focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 text-sm md:text-base"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none text-gray-400">
                    <MailIcon />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0066FF] focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 text-sm md:text-base"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none text-gray-400">
                    <PhoneIconSVG />
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0066FF] focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 text-sm md:text-base"
                    required
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                  Your Message
                </label>
                <div className="relative">
                  <div className="absolute top-2.5 md:top-3.5 left-0 pl-3 md:pl-4 pointer-events-none text-gray-400">
                    <MessageIcon />
                  </div>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows="5"
                    placeholder="Tell us how we can help you..."
                    className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0066FF] focus:border-transparent transition-all resize-none text-gray-900 placeholder:text-gray-400 text-sm md:text-base"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white py-3 md:py-4 rounded-xl text-sm md:text-base font-semibold hover:shadow-lg hover:shadow-[#0066FF]/20 transition-all duration-300 hover:scale-[1.02]"
              >
                Send Message
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
