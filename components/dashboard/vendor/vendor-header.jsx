"use client"

import { useState } from "react"
import { Bell, ChevronDown, UserCircle, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useMounted } from "@/lib/hooks/use-mounted"

export function VendorHeader() {
  const mounted = useMounted()
  const { toast } = useToast()
  const router = useRouter()
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

  const handleLogout = () => {
    toast({
      title: "Logged out successfully",
      description: "Redirecting to homepage...",
    })
    setTimeout(() => {
      window.location.href = "/"
    }, 1500)
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h2>
          <p className="text-sm text-gray-600">Manage your business operations</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {mounted && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
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

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-100 transition-colors">
                <Avatar className="w-8 h-8 ring-2 ring-blue-500">
                  <AvatarFallback className="bg-gradient-to-br from-[#0066FF] to-[#00D4AA] text-white text-sm">
                    GT
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">Global Travel</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Global Travel Agency</p>
                  <p className="text-xs text-gray-500">contact@globaltravel.com</p>
                </div>
              </DropdownMenuLabel>
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
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
