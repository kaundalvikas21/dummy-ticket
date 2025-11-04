"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Ticket,
  Building2,
  MessageSquare,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plane,
  UserCircle,
  FileCheck,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { id: "orders", label: "Orders", icon: ShoppingCart, href: "/admin/orders" },
  { id: "documents", label: "Review Documents", icon: FileCheck, href: "/admin/documents" },
  { id: "profile", label: "Profile", icon: UserCircle, href: "/admin/profile" },
  { id: "customers", label: "Customers", icon: Users, href: "/admin/customers" },
  { id: "service-plans", label: "Service Plans", icon: Ticket, href: "/admin/service-plans" },
  { id: "vendors", label: "Vendors", icon: Building2, href: "/admin/vendors" },
  { id: "support", label: "Support", icon: MessageSquare, href: "/admin/support" },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
  { id: "settings", label: "Settings", icon: Settings, href: "/admin/settings" },
]

export function AdminSidebar({ sidebarOpen, setSidebarOpen }) {
  const pathname = usePathname()

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 256 : 80 }}
      className="fixed left-0 top-0 h-screen bg-gradient-to-b from-[#0a1628] to-[#1b263b] text-white z-50 shadow-2xl border-r border-white/10"
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#0066FF] to-[#00D4AA] p-2.5 rounded-xl">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden"
                >
                  <span className="text-xl font-bold text-white whitespace-nowrap">
                    VisaFly
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
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
              const isActive = pathname === item.href || (item.id === "dashboard" && pathname === "/admin")
              
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white shadow-lg"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <AnimatePresence>
                      {sidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className="overflow-hidden whitespace-nowrap font-medium"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Toggle Button */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-all"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </motion.aside>
  )
}
