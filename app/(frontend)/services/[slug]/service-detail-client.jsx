"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Clock,
  Shield,
  FileText,
  Headphones,
} from "lucide-react";
import HeroSection from "./hero-single-service";

export default function ServiceDetailClient({ service }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <HeroSection title={service.title} subtitle={service.description} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="py-12 md:py-20 px-4 sm:px-6 md:px-12 max-w-6xl mx-auto"
        >
          {/* Back Button */}
          <motion.div variants={itemVariants}>
            <Link
              href="/services"
              className="inline-flex items-center text-[#0066FF] hover:text-[#0052CC] mb-8 transition-colors group"
            >
              <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Services
            </Link>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <motion.div variants={itemVariants}>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 leading-tight">
                  {service.title}
                </h1>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </motion.div>

              {/* Features Grid */}
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-2xl p-6 md:p-8 shadow-lg shadow-blue-100/50"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  What's Included
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {service.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-[#0066FF] to-[#00D4AA] flex items-center justify-center mt-0.5">
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      </div>
                      <span className="text-gray-700 font-medium">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Additional Info Cards */}
              <motion.div
                variants={itemVariants}
                className="grid sm:grid-cols-2 gap-4"
              >
                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-[#0066FF]" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Delivery Time
                  </h3>
                  <p className="text-gray-600">{service.deliveryTime}</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                  <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-[#00D4AA]" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Validity</h3>
                  <p className="text-gray-600">{service.validity}</p>
                </div>
              </motion.div>

              {/* Why Choose Us */}
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 md:p-8 text-white"
              >
                <h2 className="text-2xl font-bold mb-6">
                  Why Choose This Service?
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <FileText className="w-5 h-5 text-[#00D4AA] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Authentic Format</h3>
                      <p className="text-gray-300 text-sm">
                        Our tickets use official airline formats accepted by
                        embassies worldwide.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Shield className="w-5 h-5 text-[#00D4AA] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Secure & Reliable</h3>
                      <p className="text-gray-300 text-sm">
                        Your data is protected with encryption, and we guarantee
                        delivery.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Headphones className="w-5 h-5 text-[#00D4AA] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">24/7 Support</h3>
                      <p className="text-gray-300 text-sm">
                        Our customer support team is always available to help
                        you.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar - Pricing Card */}
            <div className="lg:col-span-1">
              <motion.div
                variants={itemVariants}
                className="sticky top-24 bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-gray-100"
              >
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Pricing
                  </p>
                  <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 border border-blue-100">
                    <p className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                      {service.price}
                    </p>
                  </div>
                </div>

                <Link href="/buy-ticket" className="block">
                  <button className="w-full bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white font-semibold px-6 py-4 rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300 mb-4">
                    Buy Ticket Now
                  </button>
                </Link>

                <div className="space-y-3 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Instant confirmation</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Money-back guarantee</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Secure payment processing</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-sm text-gray-500 text-center">
                    Need help?{" "}
                    <Link
                      href="/contact"
                      className="text-[#0066FF] hover:underline font-medium"
                    >
                      Contact us
                    </Link>
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </div>
    </>
  );
}