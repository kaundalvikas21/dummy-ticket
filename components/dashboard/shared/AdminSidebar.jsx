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
  ChevronDown,
  ChevronUp,
  Plane,
  UserCircle,
  FileCheck,
  FileText,
  Code,
  HelpCircle,
  Phone,
  Info,
  Inbox,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

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
  { id: "pages", label: "Pages", icon: FileText, href: "/admin/pages", hasSubmenu: true,
    submenu: [
      { id: "contact", label: "Contact Us", icon: Phone, href: "/admin/pages/contact" },
      { id: "faq", label: "FAQ", icon: HelpCircle, href: "/admin/pages/faq" },
      { id: "about", label: "About Us", icon: Info, href: "/admin/pages/about" }
    ]
  },
  { id: "logs", label: "Logs", icon: Inbox, href: "/admin/logs", hasSubmenu: true,
    submenu: [
      { id: "contact-submissions", label: "Contact Submissions", icon: MessageSquare, href: "/admin/logs/contact-submissions" }
    ]
  },
  { id: "components", label: "Components", icon: Code, href: "/admin/components", hasSubmenu: true,
    submenu: [
      { id: "faq", label: "FAQ", icon: HelpCircle, href: "/admin/components/faq" }
    ]
  },
  { id: "settings", label: "Settings", icon: Settings, href: "/admin/settings" },
]

export function AdminSidebar({ sidebarOpen, setSidebarOpen }) {
  const pathname = usePathname()
  const [openSubmenu, setOpenSubmenu] = useState(null)

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
              const isSubmenuActive = item.hasSubmenu && item.submenu?.some(sub => pathname === sub.href)
              const isSubmenuOpen = openSubmenu === item.id

              if (item.hasSubmenu) {
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setOpenSubmenu(openSubmenu === item.id ? null : item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isSubmenuActive
                          ? "bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white shadow-lg"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <AnimatePresence>
                        {sidebarOpen && (
                          <>
                            <motion.span
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: "auto" }}
                              exit={{ opacity: 0, width: 0 }}
                              className="overflow-hidden whitespace-nowrap font-medium flex-1 text-left"
                            >
                              {item.label}
                            </motion.span>
                            <motion.div
                              initial={{ opacity: 0, rotate: 0 }}
                              animate={{ opacity: 1, rotate: isSubmenuOpen ? 180 : 0 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </button>

                    <AnimatePresence>
                      {sidebarOpen && isSubmenuOpen && (
                        <motion.ul
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-1 ml-4 space-y-1 overflow-hidden"
                        >
                          {item.submenu.map((subItem) => {
                            const SubIcon = subItem.icon
                            const isSubActive = pathname === subItem.href

                            return (
                              <li key={subItem.id}>
                                <Link
                                  href={subItem.href}
                                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                                    isSubActive
                                      ? "bg-white/20 text-white"
                                      : "text-white/60 hover:bg-white/10 hover:text-white"
                                  }`}
                                >
                                  <SubIcon className="w-4 h-4 flex-shrink-0" />
                                  <AnimatePresence>
                                    <motion.span
                                      initial={{ opacity: 0, width: 0 }}
                                      animate={{ opacity: 1, width: "auto" }}
                                      exit={{ opacity: 0, width: 0 }}
                                      className="overflow-hidden whitespace-nowrap text-sm"
                                    >
                                      {subItem.label}
                                    </motion.span>
                                  </AnimatePresence>
                                </Link>
                              </li>
                            )
                          })}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>
                )
              }

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
