"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Building2, Newspaper, BookOpen, ExternalLink } from "lucide-react"
import { useTranslation } from "@/lib/translations"

export function AboutNewsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const { t, isLoading } = useTranslation()

  // Fallback data in case translations are not loaded yet
  const fallbackNewsItems = [
    {
      title: "Fly Dubai adds 2 more destinations in Saudi Arabia",
      link: "https://www.dubaistandard.com/fly-dubai-adds-destination-saudi-arabia/",
    },
    {
      title: "Israel flights update 2024",
      link: "https://www.dubaistandard.com/israel-flights-update-2024/",
    },
    {
      title: "European Union and GCC discuss Schengen visa waiver for GCC citizens",
      link: "https://www.dubaistandard.com/gcc-eu-schengen-visa-waiver/",
    },
  ]

  const fallbackBlogPosts = [
    {
      title: "Difference between a fake ticket and a flight itinerary",
      link: "#",
    },
    {
      title: "Why Dubai is special, safe, and popular tourist spot",
      link: "https://www.dubaistandard.com/heres-why-dubai-is-special-safe-popular-tourist-spot-and-expats-as-a-first-choice/",
    },
  ]

  const newsItems = isLoading ? fallbackNewsItems :
    (Array.isArray(t('aboutNews.news.items')) ? t('aboutNews.news.items') : fallbackNewsItems)

  const blogPosts = isLoading ? fallbackBlogPosts :
    (Array.isArray(t('aboutNews.blog.posts')) ? t('aboutNews.blog.posts') : fallbackBlogPosts)

  return (
    <section ref={ref} className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 max-w-7xl mx-auto">
          {/* Left: About Us */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-8">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-[#0066FF] to-[#00D4AA] flex items-center justify-center">
                <Building2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t('aboutNews.about.title')}</h2>
            </div>

            <div className="bg-white rounded-3xl p-5 md:p-8 border border-gray-200 shadow-sm hover:shadow-lg transition-all">
              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-4 md:mb-6">
                {t('aboutNews.about.description1')}
              </p>

              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-4 md:mb-6">
                {t('aboutNews.about.description2')}
              </p>

              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                {t('aboutNews.about.description3')}
              </p>
            </div>
          </motion.div>

          {/* Right: News & Blog */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="space-y-4 md:space-y-6"
          >
            {/* Latest Travel News */}
            <div className="bg-white rounded-3xl p-4 md:p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all">
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-[#0066FF] to-[#00D4AA] flex items-center justify-center">
                  <Newspaper className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900">{t('aboutNews.news.title')}</h3>
              </div>
              <div className="space-y-2">
                {newsItems.map((item, index) => (
                  <motion.a
                    key={index}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center justify-between p-2.5 md:p-3 rounded-xl bg-gray-50 hover:bg-[#0066FF]/5 transition-all group"
                  >
                    <span className="text-gray-700 group-hover:text-[#0066FF] transition-colors text-xs md:text-sm">
                      {item.title}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 group-hover:text-[#0066FF] transition-colors flex-shrink-0 ml-2" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* From the Blog */}
            <div className="bg-white rounded-3xl p-4 md:p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all">
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-[#00D4AA] to-[#0066FF] flex items-center justify-center">
                  <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900">{t('aboutNews.blog.title')}</h3>
              </div>
              <div className="space-y-2">
                {blogPosts.map((post, index) => (
                  <motion.a
                    key={index}
                    href={post.link}
                    target={post.link === "#" ? "_self" : "_blank"}
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center justify-between p-2.5 md:p-3 rounded-xl bg-gray-50 hover:bg-[#00D4AA]/5 transition-all group"
                  >
                    <span className="text-gray-700 group-hover:text-[#00D4AA] transition-colors text-xs md:text-sm">
                      {post.title}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 group-hover:text-[#00D4AA] transition-colors flex-shrink-0 ml-2" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
