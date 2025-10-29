"use client";

import { motion } from "framer-motion";

export default function HeroSection({ title, subtitle }) {
  // Helper: truncate subtitle to 30 words
  const truncateToWords = (text, maxWords = 30) => {
    if (!text) return "";
    const words = text.split(" ");
    return words.length > maxWords
      ? words.slice(0, maxWords).join(" ") + "..."
      : text;
  };

  return (
    <section className="relative text-white py-24 md:py-32 lg:py-40 px-6 md:px-12 text-center overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0066FF] to-[#0052CC] opacity-90" />

      {/* Background image */}
      <img
        src="/single-service.jpg"
        alt="Hero Background"
        className="absolute inset-0 w-full h-full object-cover opacity-20"
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl mx-auto relative z-10"
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 drop-shadow-2xl leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg md:text-xl lg:text-2xl text-white/95 max-w-3xl mx-auto drop-shadow-lg leading-relaxed">
            {truncateToWords(subtitle)}
          </p>
        )}
      </motion.div>
    </section>
  );
}
