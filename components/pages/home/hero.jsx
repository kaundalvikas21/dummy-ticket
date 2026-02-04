"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Clock, CheckCircle, SendHorizonal, Ticket } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "@/lib/translations"

export function Hero() {
  const { t, isLoading } = useTranslation()

  if (isLoading) {
    // Show loading state or fallback content
    return (
      <section className="w-full flex items-center justify-center text-center py-16 md:py-24 px-6 md:px-12 bg-slate-50">
        <div className="container mx-auto relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="animate-pulse">
              <div className="h-12 md:h-16 lg:h-20 bg-slate-200 rounded-lg mb-6 md:mb-8 mx-auto max-w-4xl"></div>
              <div className="h-6 md:h-8 lg:h-10 bg-slate-200 rounded-lg mb-8 md:mb-14 mx-auto max-w-3xl"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className="w-full flex items-center justify-center text-center pt-32 pb-16 md:pt-40 md:pb-24 relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(to bottom right, rgba(0, 102, 255, 0.85), rgba(0, 102, 255, 0.75), rgba(0, 212, 170, 0.7)), url(/modern-airport-terminal-with-planes-and-travelers-.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="container mx-auto relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-white mb-6 md:mb-8 leading-tight text-balance tracking-tight">
              {t('homepage.hero.title')}
            </h1>

            <p className="text-base md:text-xl lg:text-2xl text-white/95 mb-8 md:mb-14 font-normal text-balance leading-relaxed max-w-3xl mx-auto">
              {t('homepage.hero.subtitle')}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 mb-8 md:mb-12 max-w-2xl mx-auto">
              {[
                { icon: Shield, text: t('homepage.hero.features.embassyApproved') },
                { icon: Clock, text: t('homepage.hero.features.quickDelivery') },
                { icon: CheckCircle, text: t('homepage.hero.features.verifiable') },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-center gap-1.5 md:gap-2 px-3 py-2 md:px-5 md:py-3 bg-white/95 backdrop-blur-sm rounded-full shadow-lg ${index === 2 ? "col-span-2 md:col-span-1" : ""
                    }`}
                >
                  <item.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#0066FF]" />
                  <span className="text-xs md:text-sm font-medium text-gray-700">{item.text}</span>
                </div>
              ))}
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <Link href="/buy-ticket">
                <Button
                  size="lg"
                  className="bg-white text-[#0066FF] text-base md:text-lg px-6 py-5 md:px-10 md:py-7 rounded-2xl hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all group font-semibold cursor-pointer"
                >
                  <Ticket className="ml-2 md:w-5 md:size-5 group-hover:translate-x-1 transition-transform" />
                  {t('homepage.hero.cta')}
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
