"use client";

import { motion } from "framer-motion";
import { Phone, Mail, MapPin } from "lucide-react";

export function ContactHero() {
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
            Get in Touch
          </h1>
          <p className="text-base md:text-xl lg:text-2xl mb-8 md:mb-12 text-white/90">
            We're here to help you 24/7. Reach out to us anytime, anywhere.
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
                Call Us
              </h3>
              <p className="text-white/80 text-xs md:text-sm">
                24/7 Support Available
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/20"
            >
              <Mail className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 md:mb-3" />
              <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">
                Email Us
              </h3>
              <p className="text-white/80 text-xs md:text-sm">
                Quick Response Time
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="col-span-2 md:col-span-1 bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/20"
            >
              <MapPin className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 md:mb-3" />
              <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">
                Visit Us
              </h3>
              <p className="text-white/80 text-xs md:text-sm">
                Global Presence
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
