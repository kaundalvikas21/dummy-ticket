"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SettingsIcon } from "lucide-react"

export function UserSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="lg:text-3xl text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600 mt-1">Manage your account preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-teal-100 mb-4">
              <SettingsIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings Managed Through Profile</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Your account settings and preferences are managed through your profile page. Navigate to the Profile
              section to update your personal information and account details.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
