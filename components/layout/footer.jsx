"use client"

import { Plane, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

export function Footer() {
  const [footerData, setFooterData] = useState({})
  const [loading, setLoading] = useState(true)

  // Fetch footer data
  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const response = await fetch("/api/footer")
        if (response.ok) {
          const data = await response.json()
          setFooterData(data)
        }
      } catch (error) {
        console.error("Error fetching footer data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFooterData()
  }, [])

  // Fallback data in case API fails
  const fallbackData = {
    logo: {
      url: null,
      alt_text: "VisaFly Logo",
      company_name: "VisaFly"
    },
    description: "The most trusted platform for dummy tickets and flight reservations for visa applications. Serving customers worldwide since 1990.",
    address: "2 Woodberry Grove, North Finchley,\nLondon, N12 0DR",
    company_links: [
      { name: "About Us", href: "/about" },
      { name: "Services", href: "/services" },
      { name: "Register Agency", href: "/register-agency" },
      { name: "Buy Ticket", href: "/buy-ticket" },
      { name: "Contact", href: "/contact" },
    ],
    support_links: [
      { name: "FAQ", href: "/faq" },
      { name: "Terms of Service", href: "#" },
      { name: "Privacy Policy", href: "#" },
      { name: "Refund Policy", href: "#" },
    ],
    contact_items: [
      { icon: Phone, text: "USA: +1 308-888-6496", href: "tel:+13088886496" },
      { icon: Phone, text: "UK: +44 744 538 1114", href: "tel:+447445381114" },
      { icon: Phone, text: "UAE: +971 54-776-1925", href: "tel:+971547761925" },
      { icon: Mail, text: "info@visafly.com", href: "mailto:info@visafly.com" },
    ],
    social_links: [
      {
        name: "Facebook",
        icon: () => (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
          </svg>
        ),
        href: "https://facebook.com",
      },
      {
        name: "YouTube",
        icon: () => (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.58 7.19c-.23-.86-.9-1.52-1.76-1.75C18.25 5 12 5 12 5s-6.25 0-7.82.44c-.86.23-1.52.9-1.76 1.75C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.9 1.52 1.76 1.75C5.75 19 12 19 12 19s6.25 0 7.82-.44c.86-.23 1.52-.9 1.76-1.75C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5.2 3-5.2 3z" />
          </svg>
        ),
        href: "https://youtube.com",
      },
      {
        name: "Instagram",
        icon: () => (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        ),
        href: "https://instagram.com",
      },
      {
        name: "TikTok",
        icon: () => (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
          </svg>
        ),
        href: "https://tiktok.com",
      },
    ]
  }

  // Use dynamic data (only fallback during loading)
  const data = loading ? fallbackData : {
    logo: footerData.logo || null,
    description: footerData.description || "",
    address: footerData.address || "",
    company_links: footerData.company_links || [],
    support_links: footerData.support_links || [],
    contact_items: footerData.contact_items || [],
    social_links: footerData.social_links || []
  }

  // Social icon helper function
  const getSocialIcon = (iconName) => {
    const icons = {
      facebook: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      ),
      youtube: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21.58 7.19c-.23-.86-.9-1.52-1.76-1.75C18.25 5 12 5 12 5s-6.25 0-7.82.44c-.86.23-1.52.9-1.76 1.75C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.9 1.52 1.76 1.75C5.75 19 12 19 12 19s6.25 0 7.82-.44c.86-.23 1.52-.9 1.76-1.75C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5.2 3-5.2 3z" />
        </svg>
      ),
      instagram: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      tiktok: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      )
    }
    return icons[iconName] || icons.facebook
  }


  return (
    <footer className="relative bg-gradient-to-br from-[#0a1628] via-[#0d1b2a] to-[#1b263b] text-white overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0066FF] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00D4AA] rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-8 md:py-16">
        <div className="mb-8 md:mb-12">
          <Link href="/" className="flex w-fit items-center gap-4 text-2xl md:text-3xl font-bold mb-4 md:mb-6">
  {data.logo?.url ? (
    <img
      src={data.logo.url}
      alt={data.logo.alt_text || "VisaFly Logo"}
      className="h-10 md:h-14 lg:h-16 w-auto object-contain flex-shrink-0"
    />
  ) : (
    <span className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] bg-clip-text text-transparent">
      {data.logo?.company_name || "VisaFly"}
    </span>
  )}
</Link>

          {data.description && (
            <p className="text-gray-300 mb-6 md:mb-8 leading-relaxed max-w-3xl text-base md:text-lg">
              {data.description}
            </p>
          )}
          {data.address && (
            <div className="flex items-start gap-3 text-gray-300 bg-white/5 backdrop-blur-sm rounded-xl p-3 md:p-4 max-w-md border border-white/10">
              <MapPin className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 mt-1 text-[#00D4AA]" />
              <span className="text-xs md:text-sm leading-relaxed whitespace-pre-line">
                {data.address}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-12 mb-8 md:mb-12">
          {/* Company */}
          {data.company_links && data.company_links.length > 0 && (
            <div>
              <h3 className="font-bold text-base md:text-lg lg:text-xl mb-3 md:mb-4 lg:mb-6 text-white relative inline-block">
                Company
                <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-[#0066FF] to-[#00D4AA] rounded-full" />
              </h3>
              <ul className="space-y-2 md:space-y-3 lg:space-y-4 mt-4 md:mt-6 lg:mt-8">
                {data.company_links.map((link, index) => (
                  <li key={`company-${link.id || `link-${index}`}`}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-[#00D4AA] transition-all duration-300 text-xs md:text-sm flex items-center gap-2 group"
                    >
                      <span className="w-0 group-hover:w-2 h-0.5 bg-[#00D4AA] transition-all duration-300" />
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Support */}
          {data.support_links && data.support_links.length > 0 && (
            <div>
              <h3 className="font-bold text-base md:text-lg lg:text-xl mb-3 md:mb-4 lg:mb-6 text-white relative inline-block">
                Support
                <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-[#0066FF] to-[#00D4AA] rounded-full" />
              </h3>
              <ul className="space-y-2 md:space-y-3 lg:space-y-4 mt-4 md:mt-6 lg:mt-8">
                {data.support_links.map((link, index) => (
                  <li key={`support-${link.id || `link-${index}`}`}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-[#00D4AA] transition-all duration-300 text-xs md:text-sm flex items-center gap-2 group"
                    >
                      <span className="w-0 group-hover:w-2 h-0.5 bg-[#00D4AA] transition-all duration-300" />
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact */}
          {data.contact_items && data.contact_items.length > 0 && (
            <div>
              <h3 className="font-bold text-base md:text-lg lg:text-xl mb-3 md:mb-4 lg:mb-6 text-white relative inline-block">
                Contact
                <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-[#0066FF] to-[#00D4AA] rounded-full" />
              </h3>
              <ul className="space-y-2.5 md:space-y-3 lg:space-y-4 mt-4 md:mt-6 lg:mt-8">
                {data.contact_items.map((item, index) => {
                  const Icon = item.icon === "Mail" ? Mail : Phone
                  return (
                    <li key={`contact-${item.id || `item-${index}`}`} className="flex items-start gap-2 text-gray-300 group">
                      <Icon className="w-3.5 h-3.5 md:w-5 md:h-5 flex-shrink-0 mt-0.5 text-[#00D4AA] group-hover:scale-110 transition-transform" />
                      <a href={item.href} className="text-[10px] md:text-sm leading-tight group-hover:text-white transition-colors break-all">
                        {item.text}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {/* Follow Us */}
          {data.social_links && data.social_links.length > 0 && (
            <div>
              <h3 className="font-bold text-base md:text-lg lg:text-xl mb-3 md:mb-4 lg:mb-6 text-white relative inline-block">
                Follow Us
                <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-[#0066FF] to-[#00D4AA] rounded-full" />
              </h3>
              <div className="flex flex-wrap gap-2 md:gap-3 lg:gap-4 mt-4 md:mt-6 lg:mt-8">
                {data.social_links.map((social, index) => (
                  <a
                    key={`social-${social.id || `link-${index}`}`}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg md:rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-gradient-to-br hover:from-[#0066FF] hover:to-[#00D4AA] hover:border-transparent flex items-center justify-center transition-all duration-300 group hover:scale-110 hover:shadow-lg hover:shadow-[#0066FF]/30"
                    aria-label={social.name}
                  >
                    {typeof social.icon === "function" ? (
                      <social.icon />
                    ) : (
                      getSocialIcon(social.icon_name)()
                    )}
                  </a>
                ))}
              </div>
              <p className="text-gray-400 text-[10px] md:text-xs mt-3 md:mt-4 lg:mt-6 leading-relaxed">
                Stay connected with us on social media for updates and travel tips.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 pt-6 md:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
            <p className="text-gray-400 text-sm">
              © 2025 <span className="text-[#00D4AA] font-semibold">{data.logo?.company_name || "VisaFly"}</span>. All rights reserved.
            </p>
            <div className="flex gap-6 md:gap-8">
              <Link href="#" className="text-gray-400 hover:text-[#00D4AA] transition-colors text-sm relative group">
                Terms
                <span className="absolute -bottom-1 left-0 w-0 group-hover:w-full h-0.5 bg-[#00D4AA] transition-all duration-300" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-[#00D4AA] transition-colors text-sm relative group">
                Privacy
                <span className="absolute -bottom-1 left-0 w-0 group-hover:w-full h-0.5 bg-[#00D4AA] transition-all duration-300" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-[#00D4AA] transition-colors text-sm relative group">
                Cookies
                <span className="absolute -bottom-1 left-0 w-0 group-hover:w-full h-0.5 bg-[#00D4AA] transition-all duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
