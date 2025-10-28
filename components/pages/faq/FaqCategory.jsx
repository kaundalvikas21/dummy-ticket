"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FaqCategory({ category, index }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const Icon = category.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-6">
        <div className="w-9 h-9 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-[#0066FF] to-[#00D4AA] flex items-center justify-center">
          <Icon className="w-4.5 h-4.5 md:w-6 md:h-6 text-white" />
        </div>
        <h2 className="text-xl md:text-3xl font-bold text-gray-900">{category.title}</h2>
      </div>

      <Accordion type="single" collapsible className="space-y-2.5 md:space-y-4">
        {category.faqs.map((faq, faqIndex) => (
          <motion.div
            key={faqIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: faqIndex * 0.1 }}
          >
            <AccordionItem
              value={`item-${index}-${faqIndex}`}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
            >
              <AccordionTrigger className="px-4 md:px-6 lg:px-8 py-3.5 md:py-6 hover:bg-gray-50 hover:no-underline [&[data-state=open]>span]:text-[#0066FF]">
                <span className="font-semibold text-gray-900 text-sm md:text-lg text-left pr-4 md:pr-8 transition-colors">
                  {faq.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 md:px-6 lg:px-8 pb-3.5 md:pb-6 text-xs md:text-base text-gray-600 leading-relaxed border-t border-gray-100 pt-2.5 md:pt-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
    </motion.div>
  )
}
