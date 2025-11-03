"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

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

export function FAQ({ faqs = defaultFaqs }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="faq" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
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
      </div>
    </section>
  )
}