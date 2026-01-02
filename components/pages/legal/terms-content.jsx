"use client"

import { motion } from "framer-motion"
import { ChevronRight, Shield, Scale, FileText, Lock, Globe, RefreshCcw } from "lucide-react"
import { useTranslation } from "@/lib/translations"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function TermsContent() {
    const { t } = useTranslation('terms')
    const [activeSection, setActiveSection] = useState("")

    const sections = t('sections', { returnObjects: true })
    const sectionsArray = Array.isArray(sections) ? sections : []

    useEffect(() => {
        const handleScroll = () => {
            const threshold = 160 // Focused detection line from top
            let currentActive = ""

            for (const section of sectionsArray) {
                const element = document.getElementById(section.id)
                if (element) {
                    const rect = element.getBoundingClientRect()
                    // Detect the last section that has its top above the threshold
                    if (rect.top <= threshold) {
                        currentActive = section.id
                    }
                }
            }

            if (currentActive && currentActive !== activeSection) {
                setActiveSection(currentActive)
            }
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [sections])

    const getIcon = (id) => {
        const icons = {
            acceptance: Scale,
            services: Globe,
            "user-obligations": Shield,
            "refund-policy": RefreshCcw,
            limitation: Lock,
            "governing-law": FileText
        }
        return icons[id] || FileText
    }

    return (
        <div className="bg-gray-50/50 min-h-screen">
            {/* Hero Section */}
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

            <div className="container mx-auto px-4 py-12 lg:py-24">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Navigation */}
                    <aside className="lg:w-1/3 xl:w-1/4">
                        <div className="sticky top-24 space-y-8">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-[#0066FF] rounded-full" />
                                    {t('sidebar.title')}
                                </h3>
                                <nav className="space-y-2">
                                    {sectionsArray.map((section) => (
                                        <button
                                            key={section.id}
                                            onClick={() => {
                                                const element = document.getElementById(section.id)
                                                element?.scrollIntoView({ behavior: "smooth", block: "start" })
                                            }}
                                            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-between group ${activeSection === section.id
                                                ? "bg-[#0066FF]/10 text-[#0066FF] font-semibold border border-[#0066FF]/20"
                                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                                }`}
                                        >
                                            <span className="text-sm truncate">{section.title}</span>
                                            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${activeSection === section.id ? "translate-x-1" : "opacity-0 group-hover:opacity-100"
                                                }`} />
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {/* Help Card */}
                            <div className="bg-linear-to-br from-[#0a1628] to-[#1a2b45] rounded-2xl p-6 text-white relative overflow-hidden group">
                                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[#00D4AA] opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity" />
                                <h4 className="text-xl font-bold mb-4">{t('sidebar.contact.title')}</h4>
                                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                    {t('sidebar.contact.description')}
                                </p>
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center justify-center w-full bg-linear-to-r from-[#0066FF] to-[#00D4AA] text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-[#0066FF]/30 transition-all duration-300"
                                >
                                    {t('sidebar.contact.button')}
                                </Link>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:w-2/3 xl:w-3/4 space-y-12">
                        {sectionsArray.map((section, index) => {
                            const Icon = getIcon(section.id)
                            return (
                                <motion.section
                                    key={section.id}
                                    id={section.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100/80 hover:border-gray-200 transition-all duration-300 group scroll-mt-28"
                                >
                                    <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                                        <div className="shrink-0">
                                            <Icon className="w-6 h-6 text-[#0066FF] mt-1" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#0066FF] transition-colors">
                                                {section.title}
                                            </h2>
                                            <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed space-y-4">
                                                <p>{section.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.section>
                            )
                        })}
                    </main>
                </div>
            </div>
        </div>
    )
}
