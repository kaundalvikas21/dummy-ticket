"use client"

import { motion } from "framer-motion"
import { useTranslation } from "@/lib/translations"

export default function PrivacyContent() {
    const { t } = useTranslation('privacy')

    const sections = t('sections', { returnObjects: true })
    const sectionsArray = Array.isArray(sections) ? sections : []

    return (
        <div className="bg-white min-h-screen pb-16">
            {/* Hero Section - Matching Terms Style */}
            <section className="relative pt-32 pb-20 lg:py-32 overflow-hidden bg-[#0a1628]">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0066FF] rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#00D4AA] rounded-full blur-[120px]" />
                </div>

                <div className="relative container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                            {t('hero.title')} <span className="text-transparent bg-clip-text bg-linear-to-r from-[#0066FF] to-[#00D4AA]">{t('hero.highlight')}</span>
                        </h1>
                        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                            {t('hero.description')}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Ultra-Simple Content - Tighter Spacing, No Icons, No Hover */}
            <main className="container mx-auto px-4 py-8 lg:py-16">
                <div className="max-w-4xl mx-auto divide-y divide-gray-100">
                    {sectionsArray.map((section, index) => (
                        <motion.section
                            key={section.id}
                            id={section.id}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4 }}
                            className="py-10 first:pt-0 last:pb-0"
                        >
                            <div className="max-w-3xl">
                                <h2 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">
                                    {section.title}
                                </h2>
                                <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed text-base">
                                    <p>{section.content}</p>
                                </div>
                            </div>
                        </motion.section>
                    ))}
                </div>
            </main>
        </div>
    )
}
