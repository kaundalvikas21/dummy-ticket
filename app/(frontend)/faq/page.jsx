"use client"

import { useState, useEffect } from "react"
import HeroSection from "@/components/pages/faq/HeroSection"
import FaqCategory from "@/components/pages/faq/FaqCategory"
import StillHaveQuestions from "@/components/pages/faq/StillHaveQuestions"
import { HelpCircle, Clock, MessageSquare, CreditCard, FileText, Globe, Phone, Settings, Info, Users, ShoppingCart, Shield, BookOpen, CheckCircle, AlertCircle, Zap, Package, Truck } from "lucide-react"
import { SkeletonCard, SkeletonCardContent, SkeletonCardHeader } from "@/components/ui/skeleton-card"
import { useLocale } from "@/contexts/locale-context"

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { locale, isLoading: localeLoading } = useLocale()

  // Fetch FAQ sections with items from API
  useEffect(() => {
    const fetchFAQSections = async () => {
      try {
        // Include locale parameter to get translated content
        const url = `/api/faq-page/sections${locale !== 'en' ? `?locale=${locale}` : ''}`
        const response = await fetch(url)
        const result = await response.json()

        if (response.ok) {
          setSections(result.sections || [])
        } else {
          console.error('Failed to fetch FAQ sections:', result.error)
          setError('Failed to load FAQ content')
        }
      } catch (error) {
        console.error('Error fetching FAQ sections:', error)
        setError('Failed to load FAQ content')
      } finally {
        setLoading(false)
      }
    }

    fetchFAQSections()
  }, [locale])

  // Transform API data to match existing component structure
  const faqCategories = sections.map(section => ({
    title: section.title,
    icon: getIconByName(section.icon),
    faqs: section.items || []
  }))

  // Filter logic for translated content
  const filteredCategories = faqCategories.map((category) => ({
    ...category,
    faqs: category.faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  })).filter(category => category.faqs.length > 0)

  if (loading || localeLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
        {/* Hero Section Skeleton */}
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <div className="h-16 w-80 bg-gray-200 rounded-2xl mx-auto mb-6 animate-pulse"></div>
            <div className="h-8 w-64 bg-gray-200 rounded mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 w-96 bg-gray-200 rounded mx-auto animate-pulse"></div>
          </div>
        </div>

        {/* FAQ Categories Skeleton */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto space-y-12">
              {/* Generate 4 FAQ category skeletons */}
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div>
                      <div className="h-6 w-32 bg-gray-200 rounded mb-2 animate-pulse"></div>
                      <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                  {/* FAQ Items Skeleton */}
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="border-b border-gray-100 pb-4 last:border-0">
                        <div className="space-y-2">
                          <div className="h-5 w-full bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-4 w-4/5 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
          <p className="text-gray-600 text-sm">Please try refreshing the page or contact support.</p>
        </div>
      </div>
    )
  }

  if (filteredCategories.length === 0) {
    const isEnglish = locale === 'en'
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
        <HeroSection searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <section className="py-10 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {isEnglish ? "No FAQs Found" : "No FAQs Found"}
              </h2>
              <p className="text-gray-600">
                {searchQuery
                  ? (isEnglish
                    ? `No FAQs found matching "${searchQuery}". Try different search terms.`
                    : `No FAQs found matching "${searchQuery}". Try different search terms.`)
                  : (isEnglish
                    ? "No FAQ content is available at the moment. Please check back later."
                    : "No FAQ content is available at the moment. Please check back later.")
                }
              </p>
              {!searchQuery && locale !== DEFAULT_LOCALE && (
                <p className="text-sm text-gray-500 mt-2">
                  {isEnglish
                    ? "Content may not be available in this language yet."
                    : "Content may not be available in this language yet."}
                </p>
              )}
            </div>
          </div>
        </section>

        <StillHaveQuestions />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <HeroSection searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-6 md:space-y-12">
            {filteredCategories.map((category, i) => (
              <FaqCategory key={i} category={category} index={i} />
            ))}
          </div>
        </div>
      </section>

      <StillHaveQuestions />
    </div>
  )
}

// Helper function to get Lucide icon by name
function getIconByName(iconName) {
  if (!iconName) return HelpCircle

  const icons = {
    HelpCircle: HelpCircle,
    Clock: Clock,
    MessageSquare,
    CreditCard: CreditCard,
    FileText: FileText,
    Globe: Globe,
    Phone: Phone,
    Info: Info, 
    Settings: Settings, 
    Users: Users, 
    ShoppingCart: ShoppingCart,
    Shield: Shield,
    BookOpen: BookOpen,
    CheckCircle: CheckCircle,
    AlertCircle: AlertCircle,
    Zap: Zap,
    Package: Package, 
    Truck: Truck, 
  }

  return icons[iconName] || icons.HelpCircle
}
