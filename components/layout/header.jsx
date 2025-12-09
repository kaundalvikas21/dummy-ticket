"use client"

import { useState, useEffect } from "react"
import { useMounted } from "@/lib/hooks/use-mounted"
import { motion, useScroll } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AvatarSkeleton } from "@/components/ui/avatar-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { Menu, X, Plane, User, ChevronDown, LogOut, Loader2 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LocaleSelector } from "@/components/ui/locale-selector"
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
                      <Button variant="ghost" className="flex items-center gap-3 border border-gray-300 rounded-full hover:bg-transparent transition-all cursor-pointer pl-1 pr-3 py-1.5 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus:ring-0 active:scale-95 bg-gray-200">
                        {profileLoading || !syncedProfile ? (
                          <div className="w-8 h-8 bg-gray-200/30 animate-pulse rounded-full"></div>
                        ) : (
                          <div className="flex w-9 h-9 items-center justify-center rounded-full bg-gradient-to-br from-[#0066FF] to-[#00D4AA] ring-2 ring-white shadow-sm">
                            {syncedProfile?.avatar_url ? (
                              <Avatar className="w-8 h-8">
                                <AvatarImage
                                  src={getAvatarDisplayUrl(syncedProfile?.avatar_url)}
                                  alt="Profile picture"
                                />
                              </Avatar>
                            ) : syncedProfile?.first_name || syncedProfile?.last_name ? (
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-gradient-to-br from-[#0066FF] to-[#00D4AA] text-white text-xs">
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
                    <div className="py-2 border-t border-gray-200 mt-2 flex items-center gap-2">
                      {profileLoading || !syncedProfile ? (
                        <div className="w-9 h-9 bg-gray-200/30 animate-pulse rounded-full"></div>
                      ) : (
                        <div className="flex w-9 h-9 items-center justify-center rounded-full bg-gradient-to-br from-[#0066FF] to-[#00D4AA] ring-2 ring-white shadow-sm">
                          {syncedProfile?.avatar_url ? (
                            <Avatar className="w-8 h-8">
                              <AvatarImage
                                src={getAvatarDisplayUrl(syncedProfile?.avatar_url)}
                                alt="Profile picture"
                              />
                            </Avatar>
                          ) : syncedProfile?.first_name || syncedProfile?.last_name ? (
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-gradient-to-br from-[#0066FF] to-[#00D4AA] text-white text-xs">
                                {getUserInitials(syncedProfile?.first_name, syncedProfile?.last_name, user?.email)}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <User className="w-5 h-5 text-white" />
                          )}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-700">
                          {profileLoading || !syncedProfile ? <Skeleton className="w-32 h-4" /> : getUserDisplayName()}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {syncedProfile?.role || user?.role || user?.role} Account
                        </div>
                      </div>
                    </div>
                    <Link href={`/${syncedProfile?.role || user?.role || user?.role}`} className="block py-2 text-gray-700 hover:text-[#0066FF] font-medium">
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
