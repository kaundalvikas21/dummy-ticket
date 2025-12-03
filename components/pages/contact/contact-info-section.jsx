"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Clock, Phone, Globe } from "lucide-react"
import { useTranslation } from "@/lib/translations"

export function ContactInfoSection({ settings }) {
  const { t } = useTranslation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  // Static content for support information - now translated
  const contactSupportTitle = t('contact.support.title')
  const contactSupportDescription = t('contact.support.description')

  // Static content for working hours description - now translated
  const workingHoursTitle = t('contact.workingHours.title')
  const workingHoursDescription = t('contact.workingHours.description')

  // Parse working hours from settings
  const parseWorkingHours = () => {
    const workingHoursData = settings.working_hours?.value
    if (workingHoursData) {
      try {
        return JSON.parse(workingHoursData)
      } catch {
        return []
      }
    }
    // Return empty array if no database data exists
    return []
  }

  // Parse country support from settings
  const parseCountrySupport = () => {
    const countrySupportData = settings.country_support?.value
    if (countrySupportData) {
      try {
        return JSON.parse(countrySupportData)
      } catch {
        return []
      }
    }
    // Return empty array if no database data exists
    return []
  }

  const workingHoursData = parseWorkingHours()
  const countrySupportData = parseCountrySupport()

  // Add gradients to working hours
  const schedule = workingHoursData.map((item, index) => {
    const gradients = [
      "from-blue-500 to-blue-600",
      "from-blue-500 to-blue-600",
      "from-blue-500 to-blue-600",
      "from-blue-500 to-blue-600",
      "from-teal-500 to-teal-600",
      "from-teal-500 to-teal-600",
      "from-teal-500 to-teal-600",
      "from-purple-500 to-purple-600"
    ]
    return {
      ...item,
      gradient: gradients[index] || "from-blue-500 to-blue-600"
    }
  })

  // Add gradients to countries
  const countries = countrySupportData.map((item) => ({
    name: item.country,
    phone: item.phone,
    gradient: item.phone === "Coming soon" ? "from-gray-400 to-gray-500" : "from-[#0066FF] to-[#0052CC]"
  }))

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
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{workingHoursTitle}</h2>
              </div>

              <p className="text-gray-600 mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
                {workingHoursDescription}
              </p>

              {workingHoursData.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center">
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Working Hours Information Coming Soon
                  </h3>
                  <p className="text-gray-600 text-sm max-w-md mx-auto">
                    We're currently updating our working hours schedule. Please contact us directly for current availability.
                  </p>
                </motion.div>
              ) : (
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
                        <div className="text-[10px] md:text-xs text-white/90">{item.hours} hours</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                </div>
              )}
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
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{contactSupportTitle}</h2>
              </div>

              <p className="text-gray-600 mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
                {contactSupportDescription}
              </p>

              {countries.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center">
                    <Globe className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Global Support Information Coming Soon
                  </h3>
                  <p className="text-gray-600 text-sm max-w-md mx-auto">
                    We're expanding our global support network. Please use our general contact information for immediate assistance.
                  </p>
                </motion.div>
              ) : (
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
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
