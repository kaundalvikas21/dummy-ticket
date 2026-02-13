"use client"

import { motion } from "framer-motion"
import { ChevronRight, Shield, Scale, FileText, Lock, Globe, RefreshCcw, Info, HelpCircle, Bell, Settings, User, CreditCard, Mail, MessageSquare, AlertTriangle, Cloud, Zap } from "lucide-react"
import { useTranslation } from "@/lib/translations"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getTermsSections } from "@/actions/terms-service"

export default function TermsContent() {
    const { t, locale } = useTranslation('terms')
    const [activeSection, setActiveSection] = useState("")
    const [dbSections, setDbSections] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getTermsSections()
                if (result.success) {
                    setDbSections(result.data)
                    // If we have sections, set the first one as active initially? 
                    // Or let the scroll handler do it.
                }
            } catch (error) {
                console.error("Failed to fetch terms", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // Process sections for current locale
    const currentSections = dbSections.filter(s => s.is_active).map(section => {
        const currentLocale = locale || 'en'
        const trans = section.translations?.find(t => t.locale === currentLocale) ||
            section.translations?.find(t => t.locale === 'en')
        return {
            id: section.key || `section-${section.id}`,
            key: section.key,
            title: trans?.title || "Untitled",
            content: trans?.content || ""
        }
    })

    useEffect(() => {
        const handleScroll = () => {
            const threshold = 160 // Focused detection line from top
            let currentActive = ""

            for (const section of currentSections) {
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
    }, [currentSections, activeSection])

    const getIcon = (key) => {
        if (key === 'none') return null
        const icons = {
            acceptance: Scale,
            services: Globe,
            "user-obligations": Shield,
            "refund-policy": RefreshCcw,
            limitation: Lock,
            "governing-law": FileText,
            info: Info,
            faq: HelpCircle,
            notification: Bell,
            settings: Settings,
            privacy: Lock,
            security: Shield,
            payment: CreditCard,
            email: Mail,
            chat: MessageSquare,
            warning: AlertTriangle,
            cloud: Cloud,
            speed: Zap,
            other: FileText
        }
        return icons[key] || FileText
    }

    return (
        <div className="bg-gray-50/50 min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-[#0a1628]">
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
                                    <div className="w-1.5 h-6 bg-[#00D4AA] rounded-full" />
                                    {t('sidebar.title')}
                                </h3>
                                <nav className="space-y-2">
                                    {loading ? (
                                        <div className="space-y-2 animate-pulse">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className="h-10 bg-gray-100 rounded-xl w-full"></div>
                                            ))}
                                        </div>
                                    ) : (
                                        currentSections.map((section) => (
                                            <button
                                                key={section.id}
                                                onClick={() => {
                                                    const element = document.getElementById(section.id)
                                                    element?.scrollIntoView({ behavior: "smooth", block: "start" })
                                                }}
                                                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-between group ${activeSection === section.id
                                                    ? "bg-[#00D4AA]/10 text-[#00D4AA] font-semibold border border-[#00D4AA]/20"
                                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                                    }`}
                                            >
                                                <span className="text-sm truncate">{section.title}</span>
                                                <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${activeSection === section.id ? "translate-x-1" : "opacity-0 group-hover:opacity-100"
                                                    }`} />
                                            </button>
                                        ))
                                    )}
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
                        {loading ? (
                            <div className="space-y-12">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100/80 animate-pulse">
                                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                                        <div className="space-y-3">
                                            <div className="h-4 bg-gray-100 rounded w-full"></div>
                                            <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                                            <div className="h-4 bg-gray-100 rounded w-4/6"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            currentSections.map((section, index) => {
                                const Icon = getIcon(section.key)
                                return (
                                    <motion.section
                                        key={section.id}
                                        id={section.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        className="bg-white transition-all duration-300 group scroll-mt-28"
                                    >
                                        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                                            {Icon && (
                                                <div className="shrink-0">
                                                    <Icon className="w-6 h-6 text-[#00D4AA] mt-1" />
                                                </div>
                                            )}
                                            <div>
                                                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#00D4AA] transition-colors">
                                                    {section.title}
                                                </h2>
                                                <div
                                                    className="prose prose-slate max-w-none text-gray-600 leading-relaxed"
                                                    dangerouslySetInnerHTML={{ __html: section.content }}
                                                />
                                            </div>
                                        </div>
                                    </motion.section>
                                )
                            })
                        )}
                    </main>
                </div>
            </div>
        </div>
    )
}
