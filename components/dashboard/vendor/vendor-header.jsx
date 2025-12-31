"use client"

import { useState } from "react"
import { Bell, ChevronDown, UserCircle, Settings, LogOut, Loader2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AvatarSkeleton, AvatarFallbackSkeleton } from "@/components/ui/avatar-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useMounted } from "@/lib/hooks/use-mounted"
import { useAuth } from "@/contexts/auth-context"
import { getAvatarDisplayUrl, getUserInitials } from "@/lib/utils"

export function VendorHeader() {
  const mounted = useMounted()
  const { toast } = useToast()
  const router = useRouter()
  const { logout, profile, loading } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "New booking received for Flight Ticket Service",
      time: "5 min ago",
      read: false,
      type: "booking",
      href: "/vendor/bookings",
    },
    { id: 2, message: "Payment of $350 has been processed", time: "1 hour ago", read: false, type: "payment", href: "/vendor/revenue" },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleNotificationClick = (notificationId, href) => {
    setNotifications(notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
    router.push(href)
    toast({
      title: "Notification",
      description: "Navigating to relevant section",
    })
  }

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

        // Redirect to login page after successful logout
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

  // Get user display name from profile
  const getUserDisplayName = () => {
    if (profile?.first_name) {
      return `${profile.first_name} ${profile.last_name || ''}`.trim()
    }
    return "" // Return empty string - skeleton will handle loading state
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h2>
          <p className="text-sm text-gray-600">Manage your business operations</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-y-auto">
                {unreadCount === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm font-medium text-gray-900">All caught up!</p>
                    <p className="text-xs text-gray-500 mt-1">No new notifications</p>
                  </div>
                ) : (
                  notifications
                    .filter((n) => !n.read)
                    .map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className="p-4 cursor-pointer"
                        onClick={() => handleNotificationClick(notification.id, notification.href)}
                      >
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-medium">{notification.message}</p>
                          <p className="text-xs text-gray-500">{notification.time}</p>
                        </div>
                      </DropdownMenuItem>
                    ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-3 py-2 h-auto hover:bg-gray-100 transition-colors rounded-lg"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#0066FF] to-[#00D4AA] ring-2 ring-white shadow-sm">
                  {loading || !profile ? (
                    <div className="h-5 w-5 bg-gray-200/30 animate-pulse rounded-full"></div>
                  ) : (
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={getAvatarDisplayUrl(profile?.avatar_url)}
                        alt="Profile picture"
                        title="Profile picture"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-[#0066FF] to-[#00D4AA] text-white text-xs">
                        {profile?.first_name || profile?.last_name
                          ? getUserInitials(profile?.first_name, profile?.last_name, profile?.email)
                          : "U"
                        }
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-900">
                    {loading || !profile ? <Skeleton className="w-32 h-4" /> : getUserDisplayName()}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {profile?.email && (
                <div className="px-2 py-1.5">
                  <p className="text-sm font-semibold">
                    {loading || !profile ? <Skeleton className="w-32 h-4" /> : getUserDisplayName()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {profile?.email}
                  </p>
                </div>
              )}
              <DropdownMenuSeparator />
              <Link href="/vendor/profile">
                <DropdownMenuItem className="cursor-pointer">
                  <UserCircle className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
              </Link>
              <Link href="/vendor/settings">
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="cursor-pointer text-red-600 disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
