"use client"

import { useState, useEffect } from "react"
import { useMounted } from "@/lib/hooks/use-mounted"
import { motion, useScroll } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X, Plane, User, LogOut, Loader2 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LocaleSelector } from "@/components/ui/locale-selector"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { scrollY } = useScroll()
  const pathname = usePathname()
  const mounted = useMounted()
  const { user, profile, logout, isAuthenticated, isAdmin, isVendor, isUser } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setIsScrolled(latest > 50)
    })
  }, [scrollY])

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      const result = await logout()

      if (result.success) {
        toast({
          title: "Logged Out Successfully 👋",
          description: "You have been logged out of your account",
          variant: "success",
        })

        // Force redirect to login page after successful logout
        setTimeout(() => {
          window.location.href = '/login'
        }, 1000)
      } else {
        toast({
          title: "Logout Failed",
          description: result.error || "Something went wrong during logout",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Get user display name (prefer profile name over email)
  const getUserDisplayName = () => {
    if (profile?.first_name) {
      return `${profile.first_name} ${profile.last_name || ''}`.trim()
    }
    return user?.email?.split('@')[0] || 'User'
  }

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

            {/* Auth Section */}
            {mounted && (
              <>
                {isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="hidden sm:inline">
                          {getUserDisplayName()}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/${profile?.role || user?.role}`} className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex items-center gap-2 text-red-600"
                      >
                        {isLoggingOut ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Logging out...
                          </>
                        ) : (
                          <>
                            <LogOut className="w-4 h-4" />
                            Logout
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Account
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href="/login" className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Login
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/register" className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Register
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                <Link href="/buy-ticket">
                  <Button className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white hover:shadow-lg hover:shadow-[#0066FF]/30 transition-all cursor-pointer">
                    Buy Ticket
                  </Button>
                </Link>
              </>
            )}
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

            {/* Mobile Auth Section */}
            {mounted && (
              <>
                {isAuthenticated ? (
                  <>
                    <div className="py-2 border-t border-gray-200 mt-2">
                      <div className="text-sm font-medium text-gray-700">
                        {getUserDisplayName()}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {profile?.role || user?.role} Account
                      </div>
                    </div>
                    <Link href={`/${profile?.role || user?.role}`} className="block py-2 text-gray-700 hover:text-[#0066FF] font-medium">
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="block w-full text-left py-2 text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                    >
                      {isLoggingOut ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Logging out...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <LogOut className="w-4 h-4" />
                          Logout
                        </div>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block py-2 text-gray-700 hover:text-[#0066FF] font-medium">
                      Login
                    </Link>
                    <Link href="/register" className="block py-2 text-gray-700 hover:text-[#0066FF] font-medium">
                      Register
                    </Link>
                  </>
                )}
              </>
            )}

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
