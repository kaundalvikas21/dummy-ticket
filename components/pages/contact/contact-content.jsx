"use client"

import React, { useRef, useState, useEffect } from "react"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { PhoneIcon, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useTranslation } from "@/lib/translations"

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
export default function ContactContent({ settings }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { user } = useAuth()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: t('contact.form.fields.subject.options.general'), // Default subject
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Pre-fill form with user profile data if logged in
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user?.id) {
        // User not logged in, do not attempt to fetch profile
        return
      }

      try {
        // Fetch user profile using the user ID
        const response = await fetch(`/api/auth/profile?userId=${user.id}`)

        if (response.ok) {
          const userData = await response.json()

          // Only pre-fill if the fields are empty
          setFormData(prev => ({
            ...prev,
            name: prev.name || userData.profile.first_name || "",
            email: prev.email || userData.profile.email || "",
            phone: prev.phone || userData.profile.phone_number || ""
          }))
        }
      } catch (error) {
        // Error fetching profile - continue with empty form
        console.log('Error loading user profile:', error.message)
      }
    }

    loadUserProfile()
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success!",
          description: t('contact.form.submit.success'),
        })

        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: t('contact.form.fields.subject.options.general'),
          message: "",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || t('contact.form.submit.error'),
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error submitting contact form:', error)
      toast({
        title: "Error",
        description: t('contact.form.submit.error'),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{t('contact.form.title')}</h2>
          </div>

          <p className="text-gray-600 mb-6 md:mb-8 text-center text-sm md:text-base">
            {t('contact.form.subtitle')}
          </p>

          {/* Contact Form */}
          <div className="bg-white rounded-3xl p-5 md:p-8 shadow-lg border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* Name */}
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                  {t('contact.form.fields.name.label')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none text-gray-400">
                    <UserIcon />
                  </div>
                  <input
                    type="text"
                    name="name"
                    autoComplete="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('contact.form.fields.name.placeholder')}
                    className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0066FF] focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 text-sm md:text-base"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                  {t('contact.form.fields.email.label')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none text-gray-400">
                    <MailIcon />
                  </div>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={t('contact.form.fields.email.placeholder')}
                    className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0066FF] focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 text-sm md:text-base"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                  {t('contact.form.fields.phone.label')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none text-gray-400">
                    <PhoneIconSVG />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder={t('contact.form.fields.phone.placeholder')}
                    className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0066FF] focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 text-sm md:text-base"
                    required
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                  {t('contact.form.fields.message.label')}
                </label>
                <div className="relative">
                  <div className="absolute top-2.5 md:top-3.5 left-0 pl-3 md:pl-4 pointer-events-none text-gray-400">
                    <MessageIcon />
                  </div>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows="5"
                    placeholder={t('contact.form.fields.message.placeholder')}
                    className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0066FF] focus:border-transparent transition-all resize-none text-gray-900 placeholder:text-gray-400 text-sm md:text-base"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white py-3 md:py-4 rounded-xl text-sm md:text-base font-semibold hover:shadow-lg hover:shadow-[#0066FF]/20 transition-all duration-300 hover:scale-[1.02] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('contact.form.submit.sending')}
                  </>
                ) : (
                  t('contact.form.submit.text')
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
