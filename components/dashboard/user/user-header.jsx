"use client"

import { Bell, LogOut, Settings, User, UserCircle, HelpCircle, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { useState } from "react"

export function UserHeader() {
  const router = useRouter()
  const { toast } = useToast()

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Booking Confirmed",
      description: "Your ticket #12345 is ready",
      type: "booking",
      targetSection: "bookings",
      read: false,
    },
    {
      id: 2,
      title: "Payment Successful",
      description: "$35.00 processed successfully",
      type: "payment",
      targetSection: "payments",
      read: false,
    },
    {
      id: 3,
      title: "Document Available",
      description: "Download your travel document",
      type: "document",
      targetSection: "documents",
      read: false,
    },
  ])

  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false)

  const handleNotificationClick = (notification) => {
    setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)))
    const targetRoute = `/user/${notification.targetSection}`
    router.push(targetRoute)
    setNotificationDropdownOpen(false)
    toast({
      title: "Navigating",
      description: `Opening ${notification.title}`,
    })
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
    setTimeout(() => {
      router.push("/")
    }, 1000)
  }

  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-4">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <DropdownMenu open={notificationDropdownOpen} onOpenChange={setNotificationDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500 text-white">{unreadCount}</Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-4">
              <h3 className="font-semibold mb-2">Notifications</h3>
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
                        <p className="text-gray-500">{notification.description}</p>
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
              className="flex items-center gap-2 px-3 py-2 h-auto hover:bg-gray-100 transition-colors rounded-lg"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#0066FF] to-[#00D4AA] ring-2 ring-white shadow-sm">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium text-gray-900">John Doe</span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-semibold">John Doe</p>
              <p className="text-xs text-gray-500">john@example.com</p>
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
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
