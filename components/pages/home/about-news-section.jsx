"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { Building2, Newspaper, BookOpen, ExternalLink } from "lucide-react"
import { useTranslation } from "@/lib/translations"

export function AboutNewsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const { t, locale } = useTranslation()

  const [newsItems, setNewsItems] = useState([])
  const [blogPosts, setBlogPosts] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch dynamic data from API
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch("/api/homepage-news-blog")
        const result = await response.json()

        if (result.success) {
          setNewsItems(result.data.news || [])
          setBlogPosts(result.data.blog || [])
        } else {
          // Fallback to static data if API fails
          setNewsItems([
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
          ])
          setBlogPosts([
            {
              title: "Difference between a fake ticket and a flight itinerary",
              link: "#",
            },
            {
              title: "Why Dubai is special, safe, and popular tourist spot",
              link: "https://www.dubaistandard.com/heres-why-dubai-is-special-safe-popular-tourist-spot-and-expats-as-a-first-choice/",
            },
          ])
        }
      } catch (error) {
        console.error("Error fetching homepage content:", error)
        // Fallback to static data
        setNewsItems([
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
        ])
        setBlogPosts([
          {
            title: "Difference between a fake ticket and a flight itinerary",
            link: "#",
          },
          {
            title: "Why Dubai is special, safe, and popular tourist spot",
            link: "https://www.dubaistandard.com/heres-why-dubai-is-special-safe-popular-tourist-spot-and-expats-as-a-first-choice/",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [])

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
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t('homepage.aboutNews.about.title')}</h2>
            </div>

            <div className="bg-white rounded-3xl p-5 md:p-8 border border-gray-200 shadow-sm hover:shadow-lg transition-all">
              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-4 md:mb-6">
                {t('homepage.aboutNews.about.description1')}
              </p>

              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-4 md:mb-6">
                {t('homepage.aboutNews.about.description2')}
              </p>

              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                {t('homepage.aboutNews.about.description3')}
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
                <h3 className="text-lg md:text-xl font-bold text-gray-900">{t('homepage.aboutNews.news.title')}</h3>
              </div>
              <div className="space-y-2">
                {newsItems.map((item, index) => {
                  // Get localized title or fallback to English
                  const getLocalizedTitle = (item) => {
                    if (item.translations && item.translations[locale] && item.translations[locale].title) {
                      return item.translations[locale].title
                    }
                    return item.translations?.en?.title || item.title || 'No title'
                  }

                  return (
                    <motion.a
                      key={item.id || index}
                      href={item.external_link || item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center justify-between p-2.5 md:p-3 rounded-xl bg-gray-50 hover:bg-[#0066FF]/5 transition-all group"
                    >
                      <span className="text-gray-700 group-hover:text-[#0066FF] transition-colors text-xs md:text-sm">
                        {getLocalizedTitle(item)}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 group-hover:text-[#0066FF] transition-colors flex-shrink-0 ml-2" />
                    </motion.a>
                  )
                })}
              </div>
            </div>

            {/* From the Blog */}
            <div className="bg-white rounded-3xl p-4 md:p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all">
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-[#00D4AA] to-[#0066FF] flex items-center justify-center">
                  <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900">{t('homepage.aboutNews.blog.title')}</h3>
              </div>
              <div className="space-y-2">
                {blogPosts.map((post, index) => {
                  // Get localized title or fallback to English
                  const getLocalizedTitle = (item) => {
                    if (item.translations && item.translations[locale] && item.translations[locale].title) {
                      return item.translations[locale].title
                    }
                    return item.translations?.en?.title || item.title || 'No title'
                  }

                  const postLink = post.external_link || post.link

                  return (
                    <motion.a
                      key={post.id || index}
                      href={postLink}
                      target={postLink === "#" ? "_self" : "_blank"}
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center justify-between p-2.5 md:p-3 rounded-xl bg-gray-50 hover:bg-[#00D4AA]/5 transition-all group"
                    >
                      <span className="text-gray-700 group-hover:text-[#00D4AA] transition-colors text-xs md:text-sm">
                        {getLocalizedTitle(post)}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 group-hover:text-[#00D4AA] transition-colors flex-shrink-0 ml-2" />
                    </motion.a>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
