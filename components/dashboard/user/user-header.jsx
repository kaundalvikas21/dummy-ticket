"use client"

import { createClient } from "@/lib/supabase/client"
import { Bell, LogOut, Settings, User, UserCircle, HelpCircle, ChevronDown, Loader2, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { getAvatarDisplayUrl, getUserInitials } from "@/lib/utils"
import { CURRENCY_SYMBOLS } from "@/lib/exchange-rate"
import { useProfileSync } from "@/hooks/useProfileSync"
import { useState, useEffect } from "react"

export function UserHeader({ onMenuClick, sidebarOpen }) {
  const router = useRouter()
  const { toast } = useToast()
  const { logout } = useAuth()
  const { profile, loading } = useProfileSync()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [mounted, setMounted] = useState(false);
  const supabase = createClient()
  const [notifications, setNotifications] = useState([])
  const [relatedBookings, setRelatedBookings] = useState({})
  const [loadingNotifications, setLoadingNotifications] = useState(true)

  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper to format notification message
  const getFormattedNotificationMessage = (notification) => {
    // If no metadata, return original
    if (!notification.metadata || !notification.metadata.booking_id) return notification.message

    // Check if we have booking details
    const bookingDetails = relatedBookings[notification.metadata.booking_id]
    if (!bookingDetails) return notification.message

    // User: Use Original Currency from Booking
    const currency = bookingDetails.currency || 'USD'
    const symbol = CURRENCY_SYMBOLS[currency] || '$'

    // Replace the "$" in the message with the correct symbol
    // The migration hardcodes "$" like "Payment of $100..."
    // We want "Payment of AED 100..." (or just symbol if preferred, user said "display converted with usd" for admin, 
    // and "user dashboard notifications received with there user make payment with currency to make bookings."
    // Assuming this means "AED 100" or similar.

    try {
      // Replace "$" followed by digits with "Symbol digits"
      // Or if the symbol is '$' (like USD), keep it unless we want to distinguish.
      // Let's replace `$` with `symbol ` (with space? or without?)
      // Symbols in CURRENCY_SYMBOLS are like '₹', 'د.إ', '$'.
      // Format: 'د.إ100' looks weird. 'د.إ 100' is better.
      // Existing message: "... $100 ...".
      // Replaced: "... د.إ100 ..." (whitespace might be eaten if I match strict `$`).
      // Regex `\$` matches the dollar sign. 
      // We replace it with the symbol.
      return notification.message.replace('$', symbol)
    } catch (e) {
      return notification.message
    }
  }

  // Fetch notifications and set up realtime subscription
  useEffect(() => {
    if (!profile?.id) return

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', profile.auth_user_id || profile.user_id)
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) throw error
        setNotifications(data || [])

        // Fetch related bookings
        const bookingIds = (data || [])
          .filter(n => n.metadata && n.metadata.booking_id)
          .map(n => n.metadata.booking_id)

        if (bookingIds.length > 0) {
          const { data: bookingsData, error: bookingsError } = await supabase
            .from('bookings')
            .select('id, amount, currency')
            .in('id', bookingIds)

          if (!bookingsError && bookingsData) {
            const map = {}
            bookingsData.forEach(b => {
              map[b.id] = b
            })
            setRelatedBookings(map)
          }
        }

      } catch (error) {
        console.error('Error fetching notifications:', error)
      } finally {
        setLoadingNotifications(false)
      }
    }

    fetchNotifications()

    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${profile.auth_user_id}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newNotif = payload.new
            setNotifications((prev) => [newNotif, ...prev])

            // If new notification has booking_id, fetch it
            if (newNotif.metadata && newNotif.metadata.booking_id) {
              const { data: bookingData } = await supabase
                .from('bookings')
                .select('id, amount, currency')
                .eq('id', newNotif.metadata.booking_id)
                .single()

              if (bookingData) {
                setRelatedBookings(prev => ({
                  ...prev,
                  [bookingData.id]: bookingData
                }))
              }
            }

            toast({
              title: newNotif.title,
              description: newNotif.message,
            })
          } else if (payload.eventType === 'UPDATE') {
            setNotifications((prev) =>
              prev.map((n) => (n.id === payload.new.id ? payload.new : n))
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile, supabase, toast])

  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false)

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', notification.id)

        if (error) throw error

        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        )
      } catch (error) {
        console.error('Error marking notification as read:', error)
      }
    }

    if (notification.link) {
      router.push(notification.link)
      toast({
        title: "Navigating",
        description: `Opening ${notification.title}`,
      })
    }
    setNotificationDropdownOpen(false)
  }

  const handleClearAllNotifications = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', profile.auth_user_id || profile.user_id)
        .eq('read', false)

      if (error) throw error

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      )

      toast({
        title: "Notifications Cleared",
        description: "All notifications have been marked as read",
      })
    } catch (error) {
      console.error('Error clearing notifications:', error)
      toast({
        title: "Error",
        description: "Failed to clear notifications",
        variant: "destructive",
      })
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

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
    <header className="flex items-center justify-between border-b bg-white px-4 sm:px-6 py-4">
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Hamburger Menu */}
        <button
          type="button"
          onClick={onMenuClick}
          className={`
            relative w-10 h-10 lg:hidden flex items-center justify-center
            rounded-lg hover:bg-gray-100 active:bg-gray-200
            transition-colors focus-visible:outline-2
            focus-visible:outline-[#0066FF] focus-visible:outline-offset-2
            touch-manipulation
          `}
          aria-expanded={sidebarOpen}
          aria-controls="mobile-sidebar"
          aria-label={sidebarOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          <span className="sr-only">Toggle navigation menu</span>
          <Menu className="w-5 h-5 text-gray-700" />
        </button>

        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Dashboard</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications */}
        <DropdownMenu open={notificationDropdownOpen} onOpenChange={setNotificationDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`
                relative h-10 w-10 min-h-[44px] min-w-[44px] rounded-full touch-manipulation transition-all duration-300
                ${unreadCount > 0
                  ? "bg-blue-50 text-blue-600 border border-blue-100 animate-notification-pulse"
                  : "bg-slate-50 text-gray-600 border border-slate-100 hover:bg-slate-100"
                }
              `}
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            >
              <Bell className="h-5 w-5" />
              {mounted && unreadCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500 text-white">{unreadCount}</Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 max-w-[90vw] sm:max-w-full"
            sideOffset={8}
            collisionPadding={8}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 text-lg">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleClearAllNotifications}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
              {unreadCount === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0066FF] to-[#00D4AA] flex items-center justify-center mb-3">
                    <Bell className="h-8 w-8 text-white" />
                  </div>
                  <p className="font-medium text-gray-900 mb-1">All caught up!</p>
                  <p className="text-sm text-gray-500">You have no new notifications</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications
                    .filter((n) => !n.read)
                    .map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className="text-sm p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 bg-blue-50"
                      >
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-gray-500">{getFormattedNotificationMessage(notification)}</p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="
                flex items-center gap-2 px-3 py-2 h-auto
                hover:bg-gray-100 transition-colors rounded-lg
                min-h-[44px] touch-manipulation
              "
              aria-label="User menu"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#0066FF] to-[#00D4AA] ring-2 ring-white shadow-sm">
                {loading || !profile ? (
                  <div className="h-5 w-5 bg-gray-200/30 animate-pulse rounded-full"></div>
                ) : profile?.avatar_url ? (
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={getAvatarDisplayUrl(profile?.avatar_url)}
                      alt="Profile picture"
                      title="Profile picture"
                    />
                  </Avatar>
                ) : profile?.first_name || profile?.last_name ? (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-[#0066FF] to-[#00D4AA] text-white text-xs">
                      {getUserInitials(profile?.first_name, profile?.last_name, profile?.email)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-8 w-8 bg-gradient-to-br from-[#0066FF] to-[#00D4AA] ring-2 ring-white shadow-sm flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <div className="flex flex-col items-start hidden sm:block">
                <span className="text-sm font-medium text-gray-900">
                  {loading || !profile ? <Skeleton className="w-24 sm:w-32 h-4" /> : getUserDisplayName()}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 max-w-[85vw] sm:max-w-full"
            sideOffset={8}
            collisionPadding={8}
          >
            <div className="px-2 py-1.5">
              <p className="text-sm font-semibold">
                {loading || !profile ? <Skeleton className="w-32 h-4" /> : getUserDisplayName()}
              </p>
              {profile?.email && (
                <p className="text-xs text-gray-500">
                  {profile?.email}
                </p>
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/user/profile")} className="cursor-pointer">
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Edit Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/user/support")} className="cursor-pointer">
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Support</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/user/settings")} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="cursor-pointer text-red-600 disabled:opacity-50"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Logging out...</span>
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
