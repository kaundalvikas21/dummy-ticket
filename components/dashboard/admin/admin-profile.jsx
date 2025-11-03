"use client"

import { useState, useEffect, useRef } from "react"
import { Save, Lock, Camera, User, Upload, Check, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

export function AdminProfile() {
  const { toast } = useToast()
  const fileInputRef = useRef(null)

  const [profilePhoto, setProfilePhoto] = useState("")
  const [initialProfilePhoto] = useState("")
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const initialProfile = {
    name: "Admin User",
    email: "admin@visafly.com",
    phone: "+1 234 567 8900",
    role: "Super Administrator",
  }

  const [profileSettings, setProfileSettings] = useState(initialProfile)
  const [profileChanged, setProfileChanged] = useState(false)

  const [passwordSettings, setPasswordSettings] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [passwordStrength, setPasswordStrength] = useState(0)

  useEffect(() => {
    const dataChanged = JSON.stringify(profileSettings) !== JSON.stringify(initialProfile)
    const photoChanged = profilePhoto !== initialProfilePhoto
    setProfileChanged(dataChanged || photoChanged)
  }, [profileSettings, profilePhoto, initialProfilePhoto])

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

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file (JPG, PNG, GIF).",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    setIsUploadingPhoto(true)

    const reader = new FileReader()
    reader.onloadend = () => {
      setTimeout(() => {
        setProfilePhoto(reader.result)
        setIsUploadingPhoto(false)
        toast({
          title: "Photo Uploaded",
          description: "Your profile photo has been updated. Don't forget to save!",
        })
      }, 500)
    }
    reader.readAsDataURL(file)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleSaveProfile = () => {
    setIsSavingProfile(true)

    setTimeout(() => {
      setIsSavingProfile(false)
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      })
      setProfileChanged(false)
    }, 1000)
  }

  const handleResetProfile = () => {
    setProfileSettings(initialProfile)
    setProfilePhoto(initialProfilePhoto)
    toast({
      title: "Changes Discarded",
      description: "Your profile has been reset to the last saved state.",
    })
  }

  const handleChangePassword = () => {
    if (!passwordSettings.currentPassword || !passwordSettings.newPassword || !passwordSettings.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields.",
        variant: "destructive",
      })
      return
    }

    if (passwordSettings.newPassword !== passwordSettings.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      })
      return
    }

    if (passwordSettings.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsChangingPassword(true)

    setTimeout(() => {
      setIsChangingPassword(false)
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      })
      setPasswordSettings({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    }, 1000)
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
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">Manage your personal information and password</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-600" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            {profileChanged && (
              <span className="text-sm text-orange-600 font-medium flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse" />
                Unsaved changes
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 ring-4 ring-gray-100">
                {profilePhoto ? (
                  <AvatarImage src={profilePhoto || "/placeholder.svg"} alt={profileSettings.name} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-[#0066FF] to-[#00D4AA] text-white text-2xl">
                    {profileSettings.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                )}
              </Avatar>
              <Button
                size="icon"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-gradient-to-r from-[#0066FF] to-[#00D4AA] shadow-lg"
                onClick={triggerFileInput}
                disabled={isUploadingPhoto}
              >
                {isUploadingPhoto ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{profileSettings.name}</h3>
              <p className="text-sm text-gray-600">{profileSettings.role}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 bg-transparent"
                onClick={triggerFileInput}
                disabled={isUploadingPhoto}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploadingPhoto ? "Uploading..." : "Change Photo"}
              </Button>
              <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max size 5MB.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profileName">Full Name</Label>
              <Input
                id="profileName"
                value={profileSettings.name}
                onChange={(e) => setProfileSettings({ ...profileSettings, name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profileEmail">Email Address</Label>
              <Input
                id="profileEmail"
                type="email"
                value={profileSettings.email}
                onChange={(e) => setProfileSettings({ ...profileSettings, email: e.target.value })}
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profilePhone">Phone Number</Label>
              <Input
                id="profilePhone"
                value={profileSettings.phone}
                onChange={(e) => setProfileSettings({ ...profileSettings, phone: e.target.value })}
                placeholder="Enter your phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profileRole">Role</Label>
              <Input id="profileRole" value={profileSettings.role} disabled className="bg-gray-50" />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white cursor-pointer"
              onClick={handleSaveProfile}
              disabled={!profileChanged || isSavingProfile}
            >
              {isSavingProfile ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-gray-600" />
            <CardTitle>Change Password</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-1 gap-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordSettings.currentPassword}
                onChange={(e) => setPasswordSettings({ ...passwordSettings, currentPassword: e.target.value })}
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordSettings.newPassword}
                onChange={(e) => setPasswordSettings({ ...passwordSettings, newPassword: e.target.value })}
                placeholder="Enter new password"
              />
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
                  type="password"
                  value={passwordSettings.confirmPassword}
                  onChange={(e) => setPasswordSettings({ ...passwordSettings, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                />
                {passwordSettings.confirmPassword && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
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
            className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white cursor-pointer"
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
  )
}
