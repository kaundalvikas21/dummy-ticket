"use client"

import { TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function AnalyticsView() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-600 mt-1">Detailed insights and performance metrics</p>
      </div>

      {/* Coming Soon Placeholder */}
      <Card>
        <CardContent className="py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#0066FF] to-[#00D4AA] mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics Dashboard Coming Soon</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              We're building comprehensive analytics tools to help you track revenue, customer behavior, and business
              performance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
