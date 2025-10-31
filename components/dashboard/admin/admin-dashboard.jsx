"use client"

import { useState } from "react"
import { AdminSidebar } from "./admin-sidebar"
import { AdminHeader } from "./admin-header"
import { DashboardOverview } from "./dashboard-overview"
import { OrdersManagement } from "./orders-management"
import { CustomersManagement } from "./customers-management"
import { ServicePlansManagement } from "./service-plans-management"
import { VendorsManagement } from "./vendors-management"
import { SupportTickets } from "./support-tickets"
import { AnalyticsView } from "./analytics-view"
import { SettingsView } from "./settings-view"
import { AdminProfile } from "./admin-profile"
import { DocumentReview } from "./document-review"

export function AdminDashboard() {
  const [activeView, setActiveView] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardOverview />
      case "orders":
        return <OrdersManagement />
      case "customers":
        return <CustomersManagement />
      case "service-plans":
        return <ServicePlansManagement />
      case "vendors":
        return <VendorsManagement />
      case "support":
        return <SupportTickets />
      case "analytics":
        return <AnalyticsView />
      case "profile":
        return <AdminProfile />
      case "documents":
        return <DocumentReview />
      case "settings":
        return <SettingsView />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar
        activeView={activeView}
        setActiveView={setActiveView}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        <AdminHeader setActiveView={setActiveView} />
        <main className="p-8">{renderView()}</main>
      </div>
    </div>
  )
}
