"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { TrendingUp, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
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

export function FAQ() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="faq" ref={ref} className="py-12 md:py-24 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
          {/* FAQ Section - Takes 2 columns */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="mb-8 md:mb-12"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4 text-balance">
                Frequently Asked{" "}
                <span className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] bg-clip-text text-transparent">
                  Questions
                </span>
              </h2>
              <p className="text-base md:text-xl text-gray-600 text-pretty">
                Find answers to common questions about our dummy ticket services
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <Accordion type="single" collapsible defaultValue="item-0" className="space-y-3 md:space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 overflow-hidden"
                  >
                    <AccordionTrigger className="px-4 py-4 md:px-8 md:py-6 hover:bg-white/40 transition-colors text-left [&[data-state=open]>svg]:rotate-180">
                      <span className="font-semibold text-gray-900 text-sm md:text-lg pr-4 md:pr-8">
                        {faq.question}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 md:px-8 text-gray-600 leading-relaxed text-sm md:text-base">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>

          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24">
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-4 md:p-6 shadow-xl border border-white/50">
                <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-[#0066FF] to-[#00D4AA] flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900">Affiliate Program</h3>
                    <p className="text-xs text-gray-600">Earn with us</p>
                  </div>
                </div>

                <p className="text-gray-700 text-xs md:text-sm leading-relaxed mb-4 md:mb-6">
                  Join our affiliate program and earn 15% commission by referring customers. Perfect for travel
                  bloggers, visa consultants, and agencies.
                </p>

                <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                  <div className="flex items-center justify-between p-2.5 md:p-3 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl">
                    <span className="text-xs md:text-sm font-medium text-gray-700">Commission</span>
                    <span className="text-base md:text-lg font-bold text-[#0066FF]">15%</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 md:p-3 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl">
                    <span className="text-xs md:text-sm font-medium text-gray-700">Cookie Duration</span>
                    <span className="text-base md:text-lg font-bold text-[#00D4AA]">30 days</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 md:p-3 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl">
                    <span className="text-xs md:text-sm font-medium text-gray-700">Min Payout</span>
                    <span className="text-base md:text-lg font-bold text-[#0066FF]">$50</span>
                  </div>
                </div>

                <Button className="w-full py-4 md:py-6 rounded-xl font-semibold bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white hover:shadow-xl hover:shadow-[#0066FF]/30 transition-all group text-sm md:text-base">
                  Join Now
                  <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                </Button>

                <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    Real-time tracking • Monthly payouts • Dedicated support
                  </p>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  )
}
