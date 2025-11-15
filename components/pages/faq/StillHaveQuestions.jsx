"use client"

import { motion } from "framer-motion"
import { useTranslation } from "@/lib/translations"

export default function StillHaveQuestions() {
  const { t } = useTranslation()
  return (
    <section className="py-10 md:py-20 bg-gradient-to-br from-[#0066FF] to-[#00D4AA] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center text-white"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-6">
            {t('faqPage.contact.stillHaveQuestions')}
          </h2>
          <p className="text-base md:text-xl mb-5 md:mb-8 text-white/90">
            {t('faqPage.contact.supportTeam')}
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 md:gap-4 justify-center">
            <a
              href="/contact"
              className="px-5 py-2.5 md:px-8 md:py-4 bg-white text-[#0066FF] rounded-xl text-sm md:text-base font-semibold hover:shadow-2xl transition-all hover:scale-105"
            >
              {t('faqPage.contact.contactSupport')}
            </a>
            <a
              href="/buy-ticket"
              className="px-5 py-2.5 md:px-8 md:py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-xl text-sm md:text-base font-semibold hover:bg-white/20 transition-all"
            >
              {t('faqPage.contact.bookTicket')}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
