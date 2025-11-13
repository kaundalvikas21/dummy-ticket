"use client"

import { motion } from "framer-motion"
import { FileCheck, CheckCircle2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useLocale } from "@/contexts/locale-context"
import { SkeletonCard, SkeletonCardContent, SkeletonCardHeader } from "@/components/ui/skeleton-card"

export function WhatAreDummyTickets() {
  const { locale } = useLocale()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  // Default fallback steps
  const defaultSteps = [
    "Select your desired route and travel dates",
    "Complete the booking with your passenger details",
    "Receive your flight reservation instantly via email",
    "Submit it with your visa application",
    "Valid PNR code verifiable with airlines",
  ]

  // Fetch dynamic content from API
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch(`/api/about/dummy-tickets?locale=${locale}`)
        const result = await response.json()

        if (response.ok && result.tickets) {
          setTickets(result.tickets)
        }
      } catch (error) {
        console.error('Error fetching dummy tickets:', error)
        // Keep default content if API fails
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [locale])

  // Parse content based on content type
  const parseContent = (ticket) => {
    if (!ticket || !ticket.content) return []

    try {
      // Try to parse as JSON array first
      const parsed = JSON.parse(ticket.content)
      if (Array.isArray(parsed)) {
        return parsed.filter(item => item.trim()) // Filter out empty items
      }
    } catch (e) {
      // If JSON parse fails, treat as simple text and split by lines
      if (ticket.content_type === 'list') {
        const lines = ticket.content.split('\n')
          .map(line => line.replace(/^[\d.\-\s]+/, '').trim()) // Remove numbering/bullets
          .filter(line => line.trim())
        return lines
      }
      // For simple content, return as single paragraph array
      return [ticket.content]
    }
    return []
  }

  if (loading) {
    return (
      <section className="py-12 md:py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4">
          {/* Section Header Skeleton matching the actual structure */}
          <div className="max-w-4xl mx-auto text-center mb-10 md:mb-16">
            <div className="h-12 md:h-16 w-64 md:w-80 bg-gray-200 rounded mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 md:h-5 w-72 md:w-96 bg-gray-200 rounded-lg mx-auto animate-pulse"></div>
          </div>

          {/* Card Skeletons matching the 2-column layout with exact structure */}
          <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                {/* Gradient Icon Skeleton */}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-6 ${
                  i === 0
                    ? 'bg-gray-200 animate-pulse'
                    : 'bg-gray-200 animate-pulse'
                }`}>
                  <div className="w-6 h-6 bg-white/30 rounded"></div>
                </div>

                {/* Title Skeleton */}
                <div className="h-8 w-48 bg-gray-200 rounded mb-4 animate-pulse"></div>

                {/* Content Area Skeleton - Mix of list and text types */}
                <div className="text-base text-gray-700 space-y-4">
                  {i === 0 ? (
                    // List type skeleton
                    <ul className="space-y-3">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <li key={j} className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-gray-200 rounded-full mt-0.5 flex-shrink-0 animate-pulse"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                            {j % 2 === 0 && <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    // Text type skeleton
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, j) => (
                        <div key={j} className="space-y-2">
                          <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                          {j < 2 && <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center mb-10 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            What Are <span className="text-[#0066FF]">Dummy Tickets</span>?
          </h2>
          <p className="text-base md:text-lg text-gray-700 leading-relaxed">
            A dummy ticket, also known as a flight reservation or flight itinerary, is a temporary booking used as proof of travel plans for visa applications.
          </p>
        </motion.div>

        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <FileCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No content available yet
            </h3>
            <p className="text-gray-500">
              Content will appear here once added from the admin panel.
            </p>
          </div>
        ) : (
          <div className={`grid gap-8 max-w-6xl mx-auto ${
            tickets.length === 1 ? 'md:grid-cols-1' : 'md:grid-cols-2'
          }`}>
            {tickets.map((ticket, index) => {
              const contentItems = parseContent(ticket)
              const isFirstCard = index === 0
              const isEvenIndex = index % 2 === 0

              return (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, [isEvenIndex ? 'x' : 'x']: isEvenIndex ? -30 : 30 }}
                  whileInView={{ opacity: 1, [isEvenIndex ? 'x' : 'x']: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-6 ${
                    isFirstCard
                      ? 'from-[#0066FF] to-[#00D4AA]'
                      : 'from-[#00D4AA] to-[#0066FF]'
                  }`}>
                    {isFirstCard ? (
                      <FileCheck className="w-6 h-6 text-white" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {ticket.title}
                  </h3>
                  <div className="text-base text-gray-700">
                    {ticket.content_type === 'list' ? (
                      <ul className="space-y-3">
                        {contentItems.map((item, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-[#00D4AA] mt-0.5 flex-shrink-0" />
                            <span className="text-base text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="space-y-4">
                        {contentItems.map((paragraph, i) => (
                          <p key={i} className="mb-4 last:mb-0">{paragraph}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
