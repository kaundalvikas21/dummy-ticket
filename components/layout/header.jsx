"use client"

import { useState, useEffect } from "react"
import { useMounted } from "@/lib/hooks/use-mounted"
import { motion, useScroll, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AvatarSkeleton } from "@/components/ui/avatar-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { Logo } from "@/components/ui/logo"
import { useLogo } from "@/hooks/useLogo"
import { Menu, X, User, ChevronDown, LogOut, Loader2 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LocaleSelector } from "@/components/ui/locale-selector"
import { CurrencySelector } from "@/components/ui/currency-selector"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useProfileSync } from "@/hooks/useProfileSync"
import { getAvatarDisplayUrl, getUserInitials } from "@/lib/utils"
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
  const { user, logout, isAuthenticated, isAdmin, isVendor, isUser } = useAuth()
  const { profile: syncedProfile, loading: profileLoading } = useProfileSync()
  const { toast } = useToast()
  const { logo: logoData, loading: logoLoading } = useLogo()

  // Check if we are on the password reset page or in password reset flow
  const isPasswordResetPage = pathname === "/update-password" || pathname?.startsWith("/update-password")

  // Check for password reset tokens in URL globally (affects all tabs)
  const isPasswordResetFlow = typeof window !== 'undefined' &&
    (window.location.search.includes('access_token') ||
      window.location.search.includes('refresh_token') ||
      window.location.search.includes('token_hash') ||
      window.location.search.includes('type=recovery'))

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setIsScrolled(latest > 50)
    })
  }, [scrollY])

  // Improved Scroll Locking: Prevents body scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      // Disable scrolling
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      // Re-enable scrolling
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen])

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

  // Get user display name (prefer profile name over email, but don't use email fallback)
  const getUserDisplayName = () => {
    if (syncedProfile?.first_name) {
      return `${syncedProfile.first_name} ${syncedProfile.last_name || ''}`.trim()
    }
    return 'User' // Don't use email fallback - return 'User' instead
  }

  // Get user initials for avatar (only name-based, never email)
  const getUserInitials = () => {
    if (syncedProfile?.first_name && syncedProfile?.last_name) {
      return `${syncedProfile.first_name.charAt(0)}${syncedProfile.last_name.charAt(0)}`.toUpperCase()
    }
    if (syncedProfile?.first_name && syncedProfile.first_name.length >= 2) {
      return syncedProfile.first_name.substring(0, 2).toUpperCase()
    }
    if (syncedProfile?.first_name) {
      return syncedProfile.first_name.charAt(0).toUpperCase()
    }
    if (syncedProfile?.last_name && syncedProfile.last_name.length >= 2) {
      return syncedProfile.last_name.substring(0, 2).toUpperCase()
    }
    if (syncedProfile?.last_name) {
      return syncedProfile.last_name.charAt(0).toUpperCase()
    }
    return 'U' // Final fallback
  }

  const navItems = [
    { name: "Services", href: "/services" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  return (
    <>
      {/* Mobile Backdrop - Placed outside the transformed header for full-page coverage */}
      <AnimatePresence>
        {mounted && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40 md:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-lg shadow-lg"
      >
        <nav className="container mx-auto px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/" className="flex items-center transition-colors">
                <Logo
                  size="md"
                  logo={logoData}
                  loading={logoLoading}
                />
              </Link>
            </motion.div>

            {/* Mobile Navigation Menu */}
            <AnimatePresence>
              {mounted && isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="md:hidden absolute top-full left-0 right-0 bg-white rounded-b-2xl p-4 shadow-2xl z-10 border-t border-gray-100 overflow-hidden"
                >
                  {/* Mobile Profile Section - Moved to Top */}
                  {mounted && (
                    <>
                      {isAuthenticated && !isPasswordResetPage && !isPasswordResetFlow ? (
                        <div className="mb-4">
                          <div className="py-2 flex items-center gap-3">
                            {profileLoading || !syncedProfile ? (
                              <div className="w-10 h-10 bg-gray-200/30 animate-pulse rounded-full"></div>
                            ) : (
                              <div className="flex w-10 h-10 items-center justify-center rounded-full bg-linear-to-br from-[#0066FF] to-[#00D4AA] ring-2 ring-white shadow-sm shrink-0">
                                {syncedProfile?.avatar_url ? (
                                  <Avatar className="w-9 h-9">
                                    <AvatarImage
                                      src={getAvatarDisplayUrl(syncedProfile?.avatar_url)}
                                      alt="Profile picture"
                                      title="Profile picture"
                                    />
                                  </Avatar>
                                ) : syncedProfile?.first_name || syncedProfile?.last_name ? (
                                  <Avatar className="w-9 h-9">
                                    <AvatarFallback className="bg-linear-to-br from-[#0066FF] to-[#00D4AA] text-white text-xs">
                                      {getUserInitials(syncedProfile?.first_name, syncedProfile?.last_name, user?.email)}
                                    </AvatarFallback>
                                  </Avatar>
                                ) : (
                                  <User className="w-5 h-5 text-white" />
                                )}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-base font-semibold text-gray-900 truncate">
                                {profileLoading || !syncedProfile ? <Skeleton className="w-32 h-5" /> : getUserDisplayName()}
                              </div>
                              <Link
                                href={`/${syncedProfile?.role || user?.role || user?.role}`}
                                className="text-sm text-[#0066FF] hover:underline font-medium"
                                onClick={() => setIsOpen(false)}
                              >
                                My Account
                              </Link>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-4">
                          <Link href="/login" onClick={() => setIsOpen(false)}>
                            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                              <User className="w-4 h-4" />
                              Login
                            </Button>
                          </Link>
                        </div>
                      )}
                      <hr className="mb-4 border-gray-100" />
                    </>
                  )}

                  {/* Navigation Pages */}
                  <div className="flex flex-col mb-4">
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
                  </div>

                  <hr className="mb-4 border-gray-100" />

                  <div className="flex items-center justify-between py-2">
                    <span className="font-medium text-gray-700">Currency</span>
                    <CurrencySelector />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="font-medium text-gray-700">Language</span>
                    <LocaleSelector />
                  </div>

                  <Link href="/buy-ticket" onClick={() => setIsOpen(false)}>
                    <Button className="w-full mt-6 bg-linear-to-r from-[#0066FF] to-[#00D4AA] text-white">
                      Buy Ticket
                    </Button>
                  </Link>

                  {/* Logout Button at Absolute Bottom */}
                  {mounted && isAuthenticated && !isPasswordResetPage && !isPasswordResetFlow && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <Button
                        variant="outline"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full flex items-center justify-center gap-2 text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 font-semibold"
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
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <motion.div key={item.name} whileHover={{ y: -2 }}>
                  <Link href={item.href} className="font-medium transition-colors text-gray-700 hover:text-[#0066FF]">
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              <CurrencySelector />
              <LocaleSelector />

              {/* Auth Section */}
              {mounted && (
                <>
                  {isAuthenticated && !isPasswordResetPage && !isPasswordResetFlow ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-3 border border-gray-300 rounded-full hover:bg-transparent transition-all cursor-pointer pl-1 pr-3 py-1.5 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus:ring-0 active:scale-95 bg-gray-200">
                          {profileLoading || !syncedProfile ? (
                            <div className="w-8 h-8 bg-gray-200/30 animate-pulse rounded-full"></div>
                          ) : (
                            <div className="flex w-9 h-9 items-center justify-center rounded-full bg-linear-to-br from-[#0066FF] to-[#00D4AA] ring-2 ring-white shadow-sm">
                              {syncedProfile?.avatar_url ? (
                                <Avatar className="w-8 h-8">
                                  <AvatarImage
                                    src={getAvatarDisplayUrl(syncedProfile?.avatar_url)}
                                    alt="Profile picture"
                                    title="Profile picture"
                                  />
                                </Avatar>
                              ) : syncedProfile?.first_name || syncedProfile?.last_name ? (
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="bg-linear-to-br from-[#0066FF] to-[#00D4AA] text-white text-xs">
                                    {getUserInitials(syncedProfile?.first_name, syncedProfile?.last_name, user?.email)}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <User className="w-5 h-5 text-white" />
                              )}
                            </div>
                          )}

                          <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:inline" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm p-1 min-w-[200px]">
                        <div className="flex flex-col space-y-1 p-2">
                          {profileLoading || !syncedProfile ? (
                            <>
                              <Skeleton className="w-24 h-4" />
                              <Skeleton className="w-32 h-3" />
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                              <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                            </>
                          )}
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/${syncedProfile?.role || user?.role || user?.role}`} className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            My Account
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
                    <Link href="/login">
                      <Button variant="outline" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Login
                      </Button>
                    </Link>
                  )}

                  <Link href="/buy-ticket">
                    <Button className="bg-linear-to-r from-[#0066FF] to-[#00D4AA] text-white hover:shadow-lg hover:shadow-[#0066FF]/30 transition-all cursor-pointer">
                      Buy Ticket
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden transition-colors text-gray-700 relative z-50 px-2 py-1" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="w-6 h-6 text-gray-900" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation - MOVED ABOVE to be sibling of Logo for better stacking */}
        </nav>
      </motion.header>
    </>
  )
}
