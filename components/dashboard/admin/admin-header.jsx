"use client"

import { createClient } from "@/lib/supabase/client"
import { Bell, User, ChevronDown, UserCircle, Settings, LogOut, Loader2, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AvatarSkeleton, AvatarFallbackSkeleton } from "@/components/ui/avatar-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { getAvatarDisplayUrl, getUserInitials } from "@/lib/utils"

export function AdminHeader({ onMenuClick, sidebarOpen }) {
  const { toast } = useToast()
  const router = useRouter()
  const { logout, profile, loading } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const supabase = createClient()
  const [notifications, setNotifications] = useState([])
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false)
  const [loadingNotifications, setLoadingNotifications] = useState(true)

  // Fetch notifications and set up realtime subscription
  useEffect(() => {
    if (!profile?.id) return

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', profile.auth_user_id || profile.user_id) // Handle both ID fields just in case
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) throw error
        setNotifications(data || [])
      } catch (error) {
        console.error('Error fetching notifications:', error)
      } finally {
        setLoadingNotifications(false)
      }
    }

    fetchNotifications()

    // Subscribe to realtime changes
    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${profile.auth_user_id || profile.user_id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotifications((prev) => [payload.new, ...prev])
            toast({
              title: payload.new.title,
              description: payload.new.message,
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

  const handleNotificationClick = async (notification) => {
    // Mark as read in DB
    if (!notification.read) {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', notification.id)

        if (error) throw error

        // Optimistic update
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

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between p-4 lg:p-6">
        {/* Left Section - Mobile Menu Button & Admin Dashboard Info */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex flex-col">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-xs lg:text-sm text-gray-600">Manage your platform effectively</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Notifications */}
          <DropdownMenu open={notificationDropdownOpen} onOpenChange={setNotificationDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9 lg:h-10 lg:w-10">
                <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
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
                          <p className="text-gray-500">{notification.message}</p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 lg:px-3 py-2 h-auto hover:bg-gray-100 transition-colors rounded-lg"
              >
                <div className="flex h-8 w-8 lg:h-9 lg:w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#0066FF] to-[#00D4AA] ring-2 ring-white shadow-sm">
                  {loading || !profile ? (
                    <div className="h-4 w-4 lg:h-5 lg:w-5 bg-gray-200/30 animate-pulse rounded-full"></div>
                  ) : (
                    <Avatar className="h-7 w-7 lg:h-8 lg:w-8">
                      <AvatarImage
                        src={getAvatarDisplayUrl(profile?.avatar_url)}
                        alt="Profile picture"
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
                <div className="hidden lg:flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-900">
                    {loading || !profile ? <Skeleton className="w-32 h-4" /> : getUserDisplayName()}
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 lg:h-4 lg:w-4 text-gray-500" />
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
              <DropdownMenuItem onClick={() => router.push("/admin/profile")} className="cursor-pointer">
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/admin/settings")} className="cursor-pointer">
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
      </div>
    </header>
  )
}
