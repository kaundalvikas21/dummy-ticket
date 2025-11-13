"use client"

import { AboutStatsManagement } from "@/components/dashboard/admin/about-stats-management"
import { DummyTicketsManagement } from "@/components/dashboard/admin/dummy-tickets-management"

export default function AboutPage() {
  return (
    <div className="p-6 space-y-8">
      <AboutStatsManagement />
      <DummyTicketsManagement />
    </div>
  )
}