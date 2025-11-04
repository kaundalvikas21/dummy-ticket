"use client"

import { useState, useEffect } from "react"
import { useMounted } from "@/lib/hooks/use-mounted"
import { motion, useScroll } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X, Plane } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LocaleSelector } from "@/components/ui/locale-selector"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { scrollY } = useScroll()
  const pathname = usePathname()
  const mounted = useMounted()

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setIsScrolled(latest > 50)
    })
  }, [scrollY])

  const navItems = [
    { name: "Services", href: "/services" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-lg shadow-lg"
    >
      <nav className="container mx-auto px-6 lg:px-8 py-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold transition-colors text-[#0066FF]">
              <div className="bg-gradient-to-br from-[#0066FF] to-[#00D4AA] p-2 rounded-xl">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] bg-clip-text text-transparent">
                VisaFly
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <motion.div key={item.name} whileHover={{ y: -2 }}>
                <Link href={item.href} className="font-medium transition-colors text-gray-700 hover:text-[#0066FF]">
                  {item.name}
                </Link>
              </motion.div>
            ))}
            <LocaleSelector />
            <Link href="/buy-ticket">
              <Button className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white hover:shadow-lg hover:shadow-[#0066FF]/30 transition-all cursor-pointer">
                Buy Ticket
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden transition-colors text-gray-700" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mounted && isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 pb-4 bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-lg"
          >
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block py-2 text-gray-700 hover:text-[#0066FF] font-medium"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex items-center justify-between py-2">
              <span className="font-medium text-gray-700">Language</span>
              <LocaleSelector />
            </div>
            <Link href="/buy-ticket">
              <Button className="w-full mt-4 bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white">
                Buy Ticket
              </Button>
            </Link>
          </motion.div>
        )}
      </nav>
    </motion.header>
  )
}
