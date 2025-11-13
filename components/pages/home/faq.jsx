"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useLocale } from "@/contexts/locale-context"

const defaultFaqs = [
  {
    question: "What is a dummy ticket?",
    answer:
      "A dummy ticket is a verifiable flight reservation with a valid PNR (Passenger Name Record) code that can be checked on airline websites. It looks like a regular airline ticket and is specifically designed for visa applications and proof of return requirements.",
  },
  {
    question: "Is this a real flight ticket?",
    answer:
      "It is a real flight reservation with a valid PNR code that can be verified on the airline website. However, it is not a confirmed paid ticket. It serves as proof of your travel plans for visa applications.",
  },
  {
    question: "Will embassies accept dummy tickets?",
    answer:
      "Yes, most embassies and consulates worldwide accept dummy tickets as proof of travel plans. Our reservations are verifiable and meet the requirements of visa application centers like VFS and BLS.",
  },
  {
    question: "How long is the reservation valid?",
    answer:
      "The reservation is typically valid for 2-4 weeks, which is sufficient time for most visa applications. If you need an extension, please contact our support team.",
  },
  {
    question: "Can I make changes to my booking?",
    answer:
      "Yes, you can make up to 4 changes to your booking details including dates, destinations, and passenger information. Changes are processed quickly through our support team.",
  },
  {
    question: "How quickly will I receive my ticket?",
    answer:
      "You will receive your dummy ticket via email within 5 minutes of completing your payment. In most cases, delivery is instant.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards, debit cards, PayPal, and various local payment methods. All transactions are secure and encrypted.",
  },
  {
    question: "What if my visa gets rejected?",
    answer:
      "While we cannot guarantee visa approval (as this depends on the embassy), our dummy tickets are accepted by embassies worldwide. If you have any issues, our support team is here to help.",
  },
]

export function FAQ({ faqs: propFaqs }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const { locale } = useLocale()
  const [faqs, setFaqs] = useState(propFaqs || defaultFaqs)
  const [loading, setLoading] = useState(!propFaqs)
  const [error, setError] = useState(null)

  // Fetch FAQs from API if no propFaqs provided
  useEffect(() => {
    if (!propFaqs) {
      fetchFaqs()
    }
  }, [propFaqs, locale])

  const fetchFaqs = async () => {
    try {
      const response = await fetch(`/api/faqs?locale=${locale}`)
      const result = await response.json()

      if (response.ok) {
        setFaqs(result.faqs || defaultFaqs)
        setError(null)
      } else {
        console.error('Failed to fetch FAQs:', result.error)
        setError('Failed to load FAQs')
        // Fallback to default FAQs
        setFaqs(defaultFaqs)
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error)
      setError('Network error')
      // Fallback to default FAQs
      setFaqs(defaultFaqs)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="faq" ref={ref}>
      <div className="container mx-auto px-4">
        <div className={`max-w-4xl mx-auto ${locale === 'ar' ? 'rtl-content' : ''}`}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="mb-8 md:mb-12"
          >
            <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4 text-balance ${
              locale === 'ar' ? 'text-right' : ''
            }`}>
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
            <p className={`text-base md:text-xl text-gray-600 text-pretty ${
              locale === 'ar' ? 'text-right' : ''
            }`}>
              Find answers to common questions about our dummy ticket services
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            {loading ? (
              <div className="space-y-3 md:space-y-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 overflow-hidden p-4 md:p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="h-4 md:h-5 bg-gray-200 rounded animate-pulse w-3/4 md:w-2/3"></div>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-full"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-5/6"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-4/5"></div>
                        </div>
                      </div>
                      <div className="ml-4 h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchFaqs}
                  className="px-4 py-2 bg-[#0066FF] text-white rounded-lg hover:bg-[#0055EE] transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <Accordion type="single" collapsible defaultValue="item-0" className="space-y-3 md:space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={faq.id || index}
                    value={`item-${index}`}
                    className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 overflow-hidden"
                  >
                    <AccordionTrigger
                      className={`px-4 py-4 md:px-8 md:py-6 hover:bg-white/40 transition-colors ${
                        locale === 'ar' ? 'text-right pr-8 pl-4 md:pr-16 md:pl-8' : 'text-left pr-4 md:pr-8'
                      } [&[data-state=open]>svg]:rotate-180`}
                    >
                      <span className={`font-semibold text-gray-900 text-sm md:text-lg ${
                        locale === 'ar' ? 'text-right' : ''
                      }`}>
                        {faq.question}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent
                      className={`px-4 md:px-8 text-gray-600 leading-relaxed text-sm md:text-base ${
                        locale === 'ar' ? 'text-right' : ''
                      }`}
                    >
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}