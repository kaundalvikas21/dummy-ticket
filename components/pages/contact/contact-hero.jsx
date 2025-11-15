"use client";

import { motion } from "framer-motion";
import { Phone, Mail, MapPin } from "lucide-react";
import { useTranslation } from "@/lib/translations";

export function ContactHero({ settings }) {
  const { t } = useTranslation();

  // Translated content for title and description
  const pageTitle = t('contact.hero.title');
  const pageDescription = t('contact.hero.subtitle');

  // Dynamic contact information
  const phone = settings.phone?.value || "+1-800-123-4567";
  const email = settings.email?.value || "support@example.com";
  const address = settings.address?.value || "123 Business St, Suite 100, New York, NY 10001";

  return (
    <section className="relative pt-24 pb-12 md:pt-32 md:pb-20 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0066FF] to-[#0052CC] opacity-90" />
      <img
        src="/customer-support-team-professional.jpg"
        alt="Customer Support"
        className="absolute inset-0 w-full h-full object-cover opacity-20"
      />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center text-white"
        >
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            {pageTitle}
          </h1>
          <p className="text-base md:text-xl lg:text-2xl mb-8 md:mb-12 text-white/90">
            {pageDescription}
          </p>

          {/* Quick Contact Info */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/20"
            >
              <Phone className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 md:mb-3" />
              <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">
                {t('contact.contactInfo.methods.1.title')}
              </h3>
              <a
                href={`tel:${phone.replace(/[^+\d]/g, "")}`}
                className="text-white/80 text-xs md:text-sm hover:text-white hover:underline transition-colors"
              >
                {phone}
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/20"
            >
              <Mail className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 md:mb-3" />
              <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">
                {t('contact.contactInfo.methods.0.title')}
              </h3>
              <a
                href={`mailto:${email}`}
                className="text-white/80 text-xs md:text-sm hover:text-white hover:underline transition-colors"
              >
                {email}
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="col-span-2 md:col-span-1 bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/20"
            >
              <MapPin className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 md:mb-3" />
              <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">
                {t('contact.contactInfo.methods.2.title')}
              </h3>
              <p className="text-white/80 text-xs md:text-sm leading-relaxed">
                {address}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
