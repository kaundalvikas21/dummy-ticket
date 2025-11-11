"use client"

import { useState, useEffect } from "react"
import HeroSection from "@/components/pages/faq/HeroSection"
import FaqCategory from "@/components/pages/faq/FaqCategory"
import StillHaveQuestions from "@/components/pages/faq/StillHaveQuestions"
import { HelpCircle, Clock, CreditCard, FileText, Globe, Loader2 } from "lucide-react"

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch FAQ sections with items from API
  useEffect(() => {
    const fetchFAQSections = async () => {
      try {
        const response = await fetch('/api/faq-page/sections')
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
  }, [])

  // Transform API data to match existing component structure
  const faqCategories = sections.map(section => ({
    title: section.title,
    icon: getIconByName(section.icon),
    faqs: section.items || []
  }))

  // Filter logic preserved
  const filteredCategories = faqCategories.map((category) => ({
    ...category,
    faqs: category.faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  })).filter(category => category.faqs.length > 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading FAQ content...</p>
        </div>
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
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
        <HeroSection searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <section className="py-10 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No FAQs Found</h2>
              <p className="text-gray-600">
                {searchQuery
                  ? `No FAQs found matching "${searchQuery}". Try different search terms.`
                  : "No FAQ content is available at the moment. Please check back later."
                }
              </p>
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
    CreditCard: CreditCard,
    FileText: FileText,
    Globe: Globe,
    Info: HelpCircle, // Fallback
    Settings: HelpCircle, // Fallback
    Users: HelpCircle, // Fallback
    ShoppingCart: HelpCircle, // Fallback
    Shield: HelpCircle, // Fallback
    BookOpen: HelpCircle, // Fallback
    CheckCircle: HelpCircle, // Fallback
    AlertCircle: HelpCircle, // Fallback
    Zap: HelpCircle, // Fallback
    Package: HelpCircle, // Fallback
    Truck: HelpCircle, // Fallback
    Phone: HelpCircle, // Fallback
  }

  return icons[iconName] || icons.HelpCircle
}
