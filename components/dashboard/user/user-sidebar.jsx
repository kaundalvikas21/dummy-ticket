"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Ticket, User, CreditCard, FileText, HelpCircle, Settings, Plane } from "lucide-react"

const menuItems = [
  { id: "dashboard", href: "/user", label: "Dashboard", icon: Home },
  { id: "bookings", href: "/user/bookings", label: "My Bookings", icon: Ticket },
  { id: "profile", href: "/user/profile", label: "My Profile", icon: User },
  { id: "payments", href: "/user/payments", label: "Payment History", icon: CreditCard },
  { id: "documents", href: "/user/documents", label: "Travel Documents", icon: FileText },
  { id: "support", href: "/user/support", label: "Support", icon: HelpCircle },
  { id: "settings", href: "/user/settings", label: "Settings", icon: Settings },
]


export default function UserSidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 left-0 h-screen w-64 bg-gradient-to-b from-[#0a1628] to-[#1b263b] text-white">
      <div className="flex h-full flex-col">
         <div className="border-b border-white/10 p-6">
      <Link href="/" className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-[#0066FF] to-[#00D4AA] p-2.5 rounded-xl">
          <Plane className="w-6 h-6 text-white" />
        </div>
        <div>
          <span className="text-xl font-bold text-white">VisaFly</span>
        </div>
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
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors",
                  isActive
                    ? "bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white font-semibold"
                    : "text-gray-300 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
