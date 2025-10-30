"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function VendorSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-600">Settings are managed through your Profile section</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
