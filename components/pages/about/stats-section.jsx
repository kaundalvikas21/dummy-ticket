"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import * as LucideIcons from "lucide-react"

export function StatsSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)

  // Default stats as fallback
  const defaultStats = [
    { icon: "Users", value: "500K+", label: "Happy Customers", sort_order: 1 },
    { icon: "Globe", value: "150+", label: "Countries Served", sort_order: 2 },
    { icon: "Award", value: "35+", label: "Years Experience", sort_order: 3 },
    { icon: "CheckCircle2", value: "99.9%", label: "Success Rate", sort_order: 4 },
  ]

  // Fetch stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/about/stats')
        const result = await response.json()

        if (response.ok && result.stats && result.stats.length > 0) {
          setStats(result.stats)
        } else {
          // Use default stats if API fails or returns empty
          setStats(defaultStats)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
        // Use default stats on error
        setStats(defaultStats)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Function to get Lucide icon component by name
  const getIcon = (iconName) => {
    try {
      const IconComponent = LucideIcons[iconName]
      return IconComponent || LucideIcons.Star // Fallback to Star icon
    } catch (error) {
      return LucideIcons.Star // Fallback to Star icon
    }
  }

  return (
    <section ref={ref} className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
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
