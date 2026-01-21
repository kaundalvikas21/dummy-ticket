"use client"

import { LayoutDashboard, Package, ShoppingCart, DollarSign, UserCircle, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Logo } from "@/components/ui/logo"
import { useLogo } from "@/hooks/useLogo"

export function VendorSidebar() {
  const pathname = usePathname()
  const { logo, loading } = useLogo()

  const menuItems = [
    { id: "dashboard", label: "My Account", icon: LayoutDashboard, href: "/vendor" },
    { id: "services", label: "My Services", icon: Package, href: "/vendor/services" },
    { id: "bookings", label: "Bookings", icon: ShoppingCart, href: "/vendor/bookings" },
    { id: "revenue", label: "Revenue", icon: DollarSign, href: "/vendor/revenue" },
    { id: "profile", label: "Profile", icon: UserCircle, href: "/vendor/profile" },
    { id: "settings", label: "Settings", icon: Settings, href: "/vendor/settings" },
  ]

  return (
    <aside
      className="w-64 bg-linear-to-b from-[#0a1628] to-[#1b263b] text-white sticky top-0 h-screen flex flex-col border-r border-white/10"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(255, 255, 255, 0.3) transparent",
      }}
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="flex items-center">
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
        className="flex-1 overflow-y-auto py-6 px-3"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255, 255, 255, 0.3) transparent",
        }}
      >
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.id === "dashboard" && pathname === "/vendor")
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                    ? "bg-linear-to-r from-[#0066FF] to-[#00D4AA] text-white shadow-lg"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
