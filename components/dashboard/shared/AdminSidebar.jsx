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
  ChevronDown,
  UserCircle,
  FileCheck,
  FileText,
  Code,
  HelpCircle,
  Phone,
  Info,
  Inbox,
  LogOut,
  Loader2,
  Home,
  BookOpen,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { Logo } from "@/components/ui/logo"
import { useLogo } from "@/hooks/useLogo"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

const menuItems = [
  { id: "dashboard", label: "My Account", icon: LayoutDashboard, href: "/admin" },
  { id: "orders", label: "Orders", icon: ShoppingCart, href: "/admin/orders" },
  { id: "documents", label: "Review Documents", icon: FileCheck, href: "/admin/documents" },
  { id: "profile", label: "Profile", icon: UserCircle, href: "/admin/profile" },
  { id: "customers", label: "Customers", icon: Users, href: "/admin/customers" },
  { id: "service-plans", label: "Service Plans", icon: Ticket, href: "/admin/service-plans" },
  { id: "vendors", label: "Vendors", icon: Building2, href: "/admin/vendors" },
  { id: "support", label: "Support", icon: MessageSquare, href: "/admin/support" },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
  { id: "blogs", label: "Blogs", icon: BookOpen, href: "/admin/blogs" },
  {
    id: "pages", label: "Pages", icon: FileText, href: "/admin/pages", hasSubmenu: true,
    submenu: [
      { id: "home", label: "Home", icon: Home, href: "/admin/pages/home" },
      { id: "contact", label: "Contact Us", icon: Phone, href: "/admin/pages/contact" },
      { id: "faq", label: "FAQ", icon: HelpCircle, href: "/admin/pages/faq" },
      { id: "about", label: "About Us", icon: Info, href: "/admin/pages/about" },
      { id: "footer", label: "Footer", icon: FileText, href: "/admin/pages/footer" }
    ]
  },
  {
    id: "logs", label: "Logs", icon: Inbox, href: "/admin/logs", hasSubmenu: true,
    submenu: [
      { id: "contact-submissions", label: "Contact Submissions", icon: MessageSquare, href: "/admin/logs/contact-submissions" }
    ]
  },
  {
    id: "components", label: "Components", icon: Code, href: "/admin/components", hasSubmenu: true,
    submenu: [
      { id: "faq", label: "FAQ", icon: HelpCircle, href: "/admin/components/faq" }
    ]
  },
  { id: "settings", label: "Settings", icon: Settings, href: "/admin/settings" },
]

export function AdminSidebar({ sidebarOpen, setSidebarOpen, mobileMode = false, onClose = () => { } }) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const { logout } = useAuth()
  const [openSubmenu, setOpenSubmenu] = useState(null)
  const { logo, loading } = useLogo()
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
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 256 : 80 }}
      className={`fixed left-0 top-0 h-screen bg-linear-to-b from-[#0a1628] to-[#1b263b] text-white z-50 shadow-2xl border-r border-white/10 ${mobileMode ? 'w-64' : ''
        }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-white/10">
          <Link href="/" className="flex items-center" onClick={handleLinkClick}>
            <Logo
              size="md"
              logo={logo}
              loading={loading}
              className="text-white"
            />
          </Link>

          {/* Mobile Close Button */}
          {mobileMode && (
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 transition-colors lg:hidden"
              aria-label="Close sidebar"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 overflow-y-auto py-4 lg:py-6 px-3"
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
              const shouldShowText = sidebarOpen || mobileMode

              if (item.hasSubmenu) {
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setOpenSubmenu(openSubmenu === item.id ? null : item.id)}
                      className={`w-full flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg transition-all min-h-[44px] ${isSubmenuActive
                        ? "bg-linear-to-r from-[#0066FF] to-[#00D4AA] text-white shadow-lg"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                        }`}
                    >
                      <Icon className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
                      <AnimatePresence>
                        {shouldShowText && (
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
                              <ChevronDown className="w-3 h-3 lg:w-4 lg:h-4" />
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </button>

                    <AnimatePresence>
                      {shouldShowText && isSubmenuOpen && (
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
                                  onClick={handleLinkClick}
                                  className={`w-full flex items-center gap-3 px-3 lg:px-4 py-2 rounded-lg transition-all min-h-[40px] ${isSubActive
                                    ? "bg-white/20 text-white"
                                    : "text-white/60 hover:bg-white/10 hover:text-white"
                                    }`}
                                >
                                  <SubIcon className="w-3 h-3 lg:w-4 lg:h-4 shrink-0" />
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
                    onClick={handleLinkClick}
                    className={`w-full flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg transition-all min-h-[44px] ${isActive
                      ? "bg-linear-to-r from-[#0066FF] to-[#00D4AA] text-white shadow-lg"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                  >
                    <Icon className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
                    <AnimatePresence>
                      {shouldShowText && (
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

        {/* Logout Button - replaced toggle button as requested */}
        {!mobileMode && (
          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`w-full flex items-center ${sidebarOpen ? 'justify-start px-4' : 'justify-center'} gap-3 p-2.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-white/10 hover:text-white hover:border-transparent transition-all`}
            >
              {isLoggingOut ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <LogOut className="w-5 h-5 shrink-0" />
              )}
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden whitespace-nowrap font-medium"
                  >
                    {isLoggingOut ? "Logging out..." : "Log Out"}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        )}
      </div>
    </motion.aside>
  )
}
