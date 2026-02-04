"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Lock, Eye, EyeOff, Check, X, SettingsIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"

export function UserSettings() {

  const { toast } = useToast()
  const { user } = useAuth()
  const supabase = createClient()

  // Password State
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordSettings, setPasswordSettings] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Calculate password strength
  useEffect(() => {
    const password = passwordSettings.newPassword
    if (!password) {
      setPasswordStrength(0)
      return
    }

    let strength = 0
    if (password.length >= 8) strength += 25
    if (password.length >= 12) strength += 25
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25
    if (/\d/.test(password)) strength += 15
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10

    setPasswordStrength(Math.min(strength, 100))
  }, [passwordSettings.newPassword])

  const handleChangePassword = async () => {
    // Basic validation
    if (!passwordSettings.currentPassword || !passwordSettings.newPassword || !passwordSettings.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Please fill in all password fields.",
        variant: "destructive",
      })
      return
    }

    if (passwordSettings.newPassword !== passwordSettings.confirmPassword) {
      toast({
        title: "Mismatch Error",
        description: "New passwords do not match.",
        variant: "destructive",
      })
      return
    }

    if (passwordSettings.newPassword.length < 8) {
      toast({
        title: "Security Warning",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsChangingPassword(true)

    try {
      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordSettings.currentPassword,
      })

      if (signInError) {
        throw new Error("Current password is incorrect.")
      }

      const { error } = await supabase.auth.updateUser({
        password: passwordSettings.newPassword
      })

      if (error) throw error

      // Call API to send email notification
      try {
        await fetch('/api/auth/profile/password-changed', {
          method: 'POST',
        });
      } catch (emailError) {
        console.error('Failed to send password change notification', emailError);
        // Don't block success message for email failure
      }

      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      })

      // Reset form
      setPasswordSettings({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      // Reset visibility states
      setShowCurrentPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)

    } catch (error) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const isPasswordFormValid = () => {
    return (
      passwordSettings.currentPassword &&
      passwordSettings.newPassword &&
      passwordSettings.confirmPassword &&
      passwordSettings.newPassword === passwordSettings.confirmPassword &&
      passwordSettings.newPassword.length >= 8
    )
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return "bg-red-500"
    if (passwordStrength < 70) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength < 40) return "Weak"
    if (passwordStrength < 70) return "Medium"
    return "Strong"
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="lg:text-3xl text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600 mt-1">Manage your account preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <div className="w-full h-full">
          <Card className="border-none shadow-sm ring-1 ring-gray-200">
            <CardHeader className="py-3 px-4 sm:px-6 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl font-semibold">Change Password</CardTitle>
                  <p className="text-sm text-gray-500 font-normal">Update your account credentials</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-2 sm:pt-2">
              <div className="grid gap-4">
                <div className="space-y-2">

                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordSettings.currentPassword}
                      onChange={(e) => setPasswordSettings({ ...passwordSettings, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      className="pr-10 pl-10"
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                      <span className="sr-only">Toggle password visibility</span>
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordSettings.newPassword}
                      onChange={(e) => setPasswordSettings({ ...passwordSettings, newPassword: e.target.value })}
                      placeholder="Enter new password"
                      className="pr-10 pl-10"
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                      <span className="sr-only">Toggle password visibility</span>
                    </Button>
                  </div>

                  {passwordSettings.newPassword && (
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Password Strength:</span>
                        <span
                          className={`font-medium ${passwordStrength < 40 ? "text-red-500" : passwordStrength < 70 ? "text-yellow-500" : "text-green-500"}`}
                        >
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <Progress value={passwordStrength} className={`h-2 ${getPasswordStrengthColor()}`} />
                      <p className="text-xs text-gray-500">
                        Use 8+ characters with a mix of uppercase, lowercase, numbers & symbols
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordSettings.confirmPassword}
                      onChange={(e) => setPasswordSettings({ ...passwordSettings, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                      className="pr-10 pl-10"
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                      <span className="sr-only">Toggle password visibility</span>
                    </Button>

                    {passwordSettings.confirmPassword && (
                      <div className="absolute right-10 top-1/2 -translate-y-1/2 mr-2">
                        {passwordSettings.newPassword === passwordSettings.confirmPassword ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <X className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Button
                className="bg-linear-to-r from-[#0066FF] to-[#00D4AA] text-white cursor-pointer w-full sm:w-auto min-h-[44px] shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200"

                onClick={handleChangePassword}
                disabled={!isPasswordFormValid() || isChangingPassword}
              >
                {isChangingPassword ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Update Password
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="hidden lg:block h-full">
          <div className="sticky top-6 h-full">
            <div className="relative h-full min-h-[400px] rounded-xl overflow-hidden shadow-2xl ring-1 ring-gray-200">
              <Image
                src="/change_password_3.jpg"
                alt="Security Illustration"
                fill
                priority
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                  <p className="text-white font-medium">Account Protection</p>
                  <p className="text-white/80 text-sm">Update your password regularly to keep your account safe and secure.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
