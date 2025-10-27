import { Plane, Mail, Phone, MapPin, Facebook, Youtube, Instagram } from "lucide-react"
import Link from "next/link"

export function Footer() {
  const footerLinks = {
    Company: [
      { name: "About Us", href: "/about" },
      { name: "Services", href: "/services" },
      { name: "Register Agency", href: "/register-agency" }, // Added Register Agency link
      { name: "Buy Ticket", href: "/buy-ticket" },
      { name: "Contact", href: "/contact" },
    ],
    Support: [
      { name: "FAQ", href: "/faq" }, // Added FAQ link to Support section
      { name: "Terms of Service", href: "#" },
      { name: "Privacy Policy", href: "#" },
      { name: "Refund Policy", href: "#" },
    ],
    Contact: [
      { icon: Phone, text: "USA: +1 308-888-6496" },
      { icon: Phone, text: "UK: +44 744 538 1114" },
      { icon: Phone, text: "UAE: +971 54-776-1925" },
      { icon: Mail, text: "info@visafly.com" },
    ],
  }

 const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "https://facebook.com" },
  { name: "YouTube", icon: Youtube, href: "https://youtube.com" },
  { name: "Instagram", icon: Instagram, href: "https://instagram.com" },
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


  return (
    <footer className="relative bg-gradient-to-br from-[#0a1628] via-[#0d1b2a] to-[#1b263b] text-white overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0066FF] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00D4AA] rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-8 md:py-16">
        <div className="mb-8 md:mb-12">
          <div className="flex items-center gap-3 text-2xl md:text-3xl font-bold mb-4 md:mb-6">
            <div className="bg-gradient-to-br from-[#0066FF] to-[#00D4AA] p-2 md:p-3 rounded-2xl shadow-lg shadow-[#0066FF]/20">
              <Plane className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <span className="bg-gradient-to-r from-[#0066FF] via-[#00D4AA] to-[#0066FF] bg-clip-text text-transparent">
              VisaFly
            </span>
          </div>
          <p className="text-gray-300 mb-6 md:mb-8 leading-relaxed max-w-3xl text-base md:text-lg">
            The most trusted platform for dummy tickets and flight reservations for visa applications. Serving customers
            worldwide since 1990.
          </p>
          <div className="flex items-start gap-3 text-gray-300 bg-white/5 backdrop-blur-sm rounded-xl p-3 md:p-4 max-w-md border border-white/10">
            <MapPin className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 mt-1 text-[#00D4AA]" />
            <span className="text-xs md:text-sm leading-relaxed">
              2 Woodberry Grove, North Finchley,
              <br />
              London, N12 0DR
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-12 mb-8 md:mb-12">
          {/* Company */}
          <div>
            <h3 className="font-bold text-base md:text-lg lg:text-xl mb-3 md:mb-4 lg:mb-6 text-white relative inline-block">
              Company
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-[#0066FF] to-[#00D4AA] rounded-full" />
            </h3>
            <ul className="space-y-2 md:space-y-3 lg:space-y-4 mt-4 md:mt-6 lg:mt-8">
              {footerLinks.Company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-[#00D4AA] transition-all duration-300 text-xs md:text-sm flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-[#00D4AA] transition-all duration-300" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-base md:text-lg lg:text-xl mb-3 md:mb-4 lg:mb-6 text-white relative inline-block">
              Support
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-[#0066FF] to-[#00D4AA] rounded-full" />
            </h3>
            <ul className="space-y-2 md:space-y-3 lg:space-y-4 mt-4 md:mt-6 lg:mt-8">
              {footerLinks.Support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-[#00D4AA] transition-all duration-300 text-xs md:text-sm flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-[#00D4AA] transition-all duration-300" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-base md:text-lg lg:text-xl mb-3 md:mb-4 lg:mb-6 text-white relative inline-block">
              Contact
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-[#0066FF] to-[#00D4AA] rounded-full" />
            </h3>
            <ul className="space-y-2.5 md:space-y-3 lg:space-y-4 mt-4 md:mt-6 lg:mt-8">
              {footerLinks.Contact.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-300 group">
                  <item.icon className="w-3.5 h-3.5 md:w-5 md:h-5 flex-shrink-0 mt-0.5 text-[#00D4AA] group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] md:text-sm leading-tight group-hover:text-white transition-colors break-all">
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="font-bold text-base md:text-lg lg:text-xl mb-3 md:mb-4 lg:mb-6 text-white relative inline-block">
              Follow Us
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-[#0066FF] to-[#00D4AA] rounded-full" />
            </h3>
            <div className="flex flex-wrap gap-2 md:gap-3 lg:gap-4 mt-4 md:mt-6 lg:mt-8">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg md:rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-gradient-to-br hover:from-[#0066FF] hover:to-[#00D4AA] hover:border-transparent flex items-center justify-center transition-all duration-300 group hover:scale-110 hover:shadow-lg hover:shadow-[#0066FF]/30"
                  aria-label={social.name}
                >
                  {typeof social.icon === "function" ? (
                    <social.icon />
                  ) : (
                    <social.icon className="w-3.5 h-3.5 md:w-5 md:h-5 text-gray-300 group-hover:text-white transition-colors" />
                  )}
                </a>
              ))}
            </div>
            <p className="text-gray-400 text-[10px] md:text-xs mt-3 md:mt-4 lg:mt-6 leading-relaxed">
              Stay connected with us on social media for updates and travel tips.
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 md:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
            <p className="text-gray-400 text-sm">
              © 2025 <span className="text-[#00D4AA] font-semibold">VisaFly</span>. All rights reserved.
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
