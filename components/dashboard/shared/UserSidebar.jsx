"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Ticket, User, CreditCard, FileText, HelpCircle, Settings, X, LogOut, Loader2 } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { useLogo } from "@/hooks/useLogo"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

const menuItems = [
  { id: "dashboard", href: "/user", label: "My Account", icon: Home },
  { id: "bookings", href: "/user/bookings", label: "My Bookings", icon: Ticket },
  { id: "profile", href: "/user/profile", label: "My Profile", icon: User },
  { id: "payments", href: "/user/payments", label: "Payment History", icon: CreditCard },
  { id: "documents", href: "/user/documents", label: "Travel Documents", icon: FileText },
  { id: "support", href: "/user/support", label: "Support", icon: HelpCircle },
  { id: "settings", href: "/user/settings", label: "Settings", icon: Settings },
]

export default function UserSidebar({ mobileMode = false, onClose = () => { } }) {
  const pathname = usePathname()
  const { logo, loading } = useLogo()
  const { logout } = useAuth()
  const { toast } = useToast()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

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

  const handleLinkClick = () => {
    if (mobileMode) {
      onClose()
    }
  }

  return (
    <aside className={cn(
      "h-screen w-64 bg-linear-to-b from-[#0a1628] to-[#1b263b] text-white",
      mobileMode ? "h-full overflow-y-auto" : "sticky top-0 left-0"
    )}>
      <div className="flex h-full flex-col">
        {/* Mobile Close Button */}
        {mobileMode && (
          <div className="flex justify-end p-4 lg:hidden">
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Logo Section */}
        <div className="border-b border-white/10 p-6">
          <Link href="/" className="flex items-center" onClick={handleLinkClick}>
            <Logo
              size="md"
              logo={logo}
              loading={loading}
              className="text-white"
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 space-y-1 p-4 overflow-y-auto"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255, 255, 255, 0.3) transparent",
          }}
        >
          <style jsx>{`
            nav::-webkit-scrollbar {
              width: 6px;
            }
            nav::-webkit-scrollbar-track {
              background: transparent;
            }
            nav::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.3);
              border-radius: 3px;
            }
            nav::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.5);
            }
          `}</style>
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== "/user" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 min-h-[44px] transition-colors touch-manipulation",
                  isActive
                    ? "bg-linear-to-r from-[#0066FF] to-[#00D4AA] text-white font-semibold"
                    : "text-gray-300 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout Section */}
        <div className="mt-auto border-t border-white/10 p-4">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-4 py-3 min-h-[44px] transition-all",
              "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-white/10 hover:text-white hover:border-transparent"
            )}
          >
            {isLoggingOut ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <LogOut className="h-5 w-5 shrink-0" />
            )}
            <span className="font-medium">
              {isLoggingOut ? "Logging out..." : "Log Out"}
            </span>
          </button>
        </div>
      </div>
    </aside>
  )
}
