"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import * as LucideIcons from "lucide-react"
import { useLocale } from "@/contexts/locale-context"
import { useTranslation } from "@/lib/translations"

export function StatsSection() {
  const { t } = useTranslation()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })
  const { locale } = useLocale()
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch stats from API with locale support
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/about/stats?locale=${locale}`)
        const result = await response.json()

        if (response.ok) {
          if (result.stats && result.stats.length > 0) {
            setStats(result.stats)
          } else {
            // No stats found - don't use fallbacks
            setStats([])
          }
        } else {
          console.error('API Error:', result.error)
          setError(result.error || 'Failed to load statistics')
          setStats([])
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
        setError('Network error occurred while loading statistics')
        setStats([])
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [locale]) // Refetch when locale changes

  // Function to get Lucide icon component by name
  const getIcon = (iconName) => {
    try {
      const IconComponent = LucideIcons[iconName]
      return IconComponent || LucideIcons.Star // Fallback to Star icon
    } catch (error) {
      return LucideIcons.Star // Fallback to Star icon
    }
  }

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div
      className={`grid gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto ${
        stats.length === 1 ? 'grid-cols-1' :
        stats.length === 2 ? 'grid-cols-2 md:grid-cols-2' :
        stats.length === 3 ? 'grid-cols-2 md:grid-cols-3' :
        stats.length === 4 ? 'grid-cols-2 lg:grid-cols-4' :
        'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
      }`}
    >
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gray-200 mb-3 md:mb-4 animate-pulse"></div>
          <div className="h-8 w-16 md:h-10 md:w-20 bg-gray-200 rounded mb-1 md:mb-2 animate-pulse mx-auto"></div>
          <div className="h-4 w-24 md:h-5 md:w-32 bg-gray-200 rounded animate-pulse mx-auto"></div>
        </div>
      ))}
    </div>
  )

  if (loading) {
    return (
      <section ref={ref} className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="text-xl font-semibold text-gray-900">{t('about.stats.loading')}</div>
            <div className="text-sm text-gray-600 mt-1">{t('about.stats.loadingSubtitle')}</div>
          </div>
          <LoadingSkeleton />
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section ref={ref} className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <LucideIcons.AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('about.stats.errorLoading')}</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('about.stats.tryAgain')}
            </button>
          </div>
        </div>
      </section>
    )
  }

  if (stats.length === 0) {
    return (
      <section ref={ref} className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <LucideIcons.BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('about.stats.noStats')}</h3>
            <p className="text-gray-600">{t('about.stats.noStatsMessage')}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section ref={ref} className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div
          className={`grid gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto ${
            stats.length === 1 ? 'grid-cols-1' :
            stats.length === 2 ? 'grid-cols-2 md:grid-cols-2' :
            stats.length === 3 ? 'grid-cols-2 md:grid-cols-3' :
            stats.length === 4 ? 'grid-cols-2 lg:grid-cols-4' :
            'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
          }`}
        >
          {stats.map((stat, index) => {
            const IconComponent = getIcon(stat.icon)
            return (
              <motion.div
                key={stat.id || index}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-[#0066FF] to-[#00D4AA] mb-3 md:mb-4 shadow-lg shadow-[#0066FF]/20">
                  <IconComponent className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2">{stat.value}</div>
                <div className="text-sm md:text-base text-gray-600">{stat.label}</div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
