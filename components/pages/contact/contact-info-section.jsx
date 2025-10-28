"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Clock, Phone } from "lucide-react"

export function ContactInfoSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const schedule = [
    { day: "Monday", hours: "24 hours", gradient: "from-blue-500 to-blue-600" },
    { day: "Tuesday", hours: "24 hours", gradient: "from-blue-500 to-blue-600" },
    { day: "Wednesday", hours: "24 hours", gradient: "from-blue-500 to-blue-600" },
    { day: "Thursday", hours: "24 hours", gradient: "from-blue-500 to-blue-600" },
    { day: "Friday", hours: "18 hours", gradient: "from-teal-500 to-teal-600" },
    { day: "Saturday", hours: "15 hours", gradient: "from-teal-500 to-teal-600" },
    { day: "Sunday", hours: "15 hours", gradient: "from-teal-500 to-teal-600" },
    { day: "Holiday", hours: "10 hours", gradient: "from-purple-500 to-purple-600" },
  ]

  const countries = [
    { name: "USA", phone: "+1-308-888-6496", gradient: "from-[#0066FF] to-[#0052CC]" },
    { name: "India", phone: "+91-8884777300", gradient: "from-[#0066FF] to-[#0052CC]" },
    { name: "UAE", phone: "+971-54-776-1925", gradient: "from-[#0066FF] to-[#0052CC]" },
    { name: "UK", phone: "+44-7445381114", gradient: "from-[#0066FF] to-[#0052CC]" },
    { name: "Canada", phone: "+1-236-900-5521", gradient: "from-[#0066FF] to-[#0052CC]" },
    { name: "Philippines", phone: "Coming soon", gradient: "from-gray-400 to-gray-500" },
  ]

  return (
    <section ref={ref} className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
          {/* Left Column - Working Hours */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-[#0066FF] to-[#00D4AA] flex items-center justify-center">
                  <Clock className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Working Hours</h2>
              </div>

              <p className="text-gray-600 mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
                Due to the nature of the travel industry we at dummyticket.com understand the need to be available to
                the customer at any time of day or night. The company is open 24/7 and customer service is available at
                least 18 hours a day.
              </p>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {schedule.map((item, index) => (
                  <motion.div
                    key={item.day}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group"
                  >
                    <div
                      className={`bg-gradient-to-r ${item.gradient} text-white py-2.5 px-3 md:py-3 md:px-4 rounded-xl font-semibold text-xs md:text-sm shadow-md hover:shadow-xl transition-all group-hover:scale-105`}
                    >
                      <div className="text-center">
                        <div className="font-bold mb-0.5 md:mb-1">{item.day}</div>
                        <div className="text-[10px] md:text-xs text-white/90">{item.hours}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Contact Support */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-[#0066FF] to-[#00D4AA] flex items-center justify-center">
                  <Phone className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Contact Support</h2>
              </div>

              <p className="text-gray-600 mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
                Reach out to our support team in your region. We're here to help you with your travel documentation
                needs.
              </p>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {countries.map((country, index) => (
                  <motion.div
                    key={country.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`bg-gradient-to-r ${country.gradient} text-white p-3 md:p-5 rounded-xl shadow-md hover:shadow-xl transition-all hover:scale-105 cursor-pointer`}
                  >
                    <h4 className="font-bold text-xs md:text-sm mb-1 md:mb-2">{country.name}</h4>
                    {country.phone !== "Coming soon" ? (
                      <a
                        href={`tel:${country.phone.replace(/[^+\d]/g, "")}`}
                        className="text-xs md:text-sm text-white/95 font-medium break-all hover:underline"
                      >
                        {country.phone}
                      </a>
                    ) : (
                      <p className="text-xs md:text-sm text-white/95 font-medium break-all opacity-80">
                        {country.phone}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
