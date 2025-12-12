"use client"

import { useState, useEffect, useRef } from "react"
import { Save, Lock, Camera, User, Upload, Check, X, Eye, EyeOff, Trash2, Mail, Phone, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"

export function AdminProfile() {
  const { toast } = useToast()
  const { user, profile: authProfile, updateProfile } = useAuth()
  const fileInputRef = useRef(null)
  const supabase = createClient()

  // State for form fields
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState("")

  // State for avatar
  const [profilePhoto, setProfilePhoto] = useState("")
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [isRemovingPhoto, setIsRemovingPhoto] = useState(false)

  // State for operations
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [profileChanged, setProfileChanged] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Password Visibility State
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [passwordSettings, setPasswordSettings] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [passwordStrength, setPasswordStrength] = useState(0)

  // Initialize data from authProfile
  useEffect(() => {
    if (authProfile) {
      setFirstName(authProfile.first_name || "")
      setLastName(authProfile.last_name || "")
      setEmail(user?.email || "") // Email from auth user object is most reliable source
      setPhone(authProfile.phone_number || "")
      setRole(authProfile.role || "Admin")
      setProfilePhoto(authProfile.avatar_url || "")
    }
  }, [authProfile, user])

  // Check for changes
  useEffect(() => {
    if (!authProfile) return

    const hasChanged =
      firstName !== (authProfile.first_name || "") ||
      lastName !== (authProfile.last_name || "") ||
      phone !== (authProfile.phone_number || "")

    setProfileChanged(hasChanged)
  }, [firstName, lastName, phone, authProfile])

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

  const handlePhotoUpload = async (event) => {
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

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Get session for auth header
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch('/api/auth/profile/upload-avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()

      if (result.success) {
        setProfilePhoto(result.avatarUrl)

        toast({
          title: "Photo Updated",
          description: "Your profile photo has been successfully updated.",
        })

        // Trigger profile refresh in context
        if (updateProfile) {
          await updateProfile({ avatar_url: result.avatarUrl })
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Upload Failed",
        description: "Failed to upload profile photo. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploadingPhoto(false)
    }
  }


  const handleRemovePhoto = async () => {
    setIsRemovingPhoto(true)
    try {
      // Get session for auth header
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch('/api/auth/profile/remove-avatar', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to remove avatar')
      }

      const result = await response.json()

      if (result.success) {
        setProfilePhoto("")
        toast({
          title: "Photo Removed",
          description: "Your profile photo has been removed.",
        })

        // Update context if available
        if (updateProfile) {
          await updateProfile({ avatar_url: null })
        }

        // Force reload as requested
        window.location.reload()
      }
    } catch (error) {
      console.error('Remove avatar error:', error)
      toast({
        title: "Action Failed",
        description: "Failed to remove profile photo. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRemovingPhoto(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleSaveProfile = async () => {
    setIsSavingProfile(true)

    try {
      const result = await updateProfile({
        first_name: firstName,
        last_name: lastName,
        phone_number: phone
      })

      if (result.success) {
        toast({
          title: "Profile Updated",
          description: "Your profile information has been saved successfully.",
        })
        setProfileChanged(false)
        setIsEditing(false)
      } else {
        throw new Error(result.error || "Failed to update profile")
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to save profile changes.",
        variant: "destructive",
      })
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleResetProfile = () => {
    if (authProfile) {
      setFirstName(authProfile.first_name || "")
      setLastName(authProfile.last_name || "")
      setPhone(authProfile.phone_number || "")
      setProfileChanged(false)
      setIsEditing(false)
      toast({
        title: "Changes Discarded",
        description: "Your profile has been reset to the last saved state.",
      })
    }
  }

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
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your personal information and password</p>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              <CardTitle className="text-lg sm:text-xl">Profile Information</CardTitle>
            </div>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="w-full sm:w-auto min-h-[40px]"
              >
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="relative shrink-0">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-4 ring-gray-100">
                {profilePhoto ? (
                  <AvatarImage src={profilePhoto} alt={`${firstName} ${lastName}`} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-[#0066FF] to-[#00D4AA] text-white text-xl sm:text-2xl">
                    {(firstName || "A")[0]}
                    {(lastName || "U")[0]}
                  </AvatarFallback>
                )}
              </Avatar>
              <Button
                size="icon"
                className="absolute bottom-0 right-0 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-r from-[#0066FF] to-[#00D4AA] shadow-lg"
                onClick={triggerFileInput}
                disabled={isUploadingPhoto}
              >
                {isUploadingPhoto ? (
                  <div className="h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base sm:text-lg text-gray-900">{firstName} {lastName}</h3>
              <p className="text-sm text-gray-600 capitalize">{role}</p>
              <div className="flex flex-col sm:flex-row gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent min-h-[40px]"
                  onClick={triggerFileInput}
                  disabled={isUploadingPhoto || isRemovingPhoto}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploadingPhoto ? "Uploading..." : "Change Photo"}
                </Button>
                {profilePhoto && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 min-h-[40px]"
                    onClick={handleRemovePhoto}
                    disabled={isUploadingPhoto || isRemovingPhoto}
                  >
                    {isRemovingPhoto ? (
                      <div className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    {isRemovingPhoto ? "Removing..." : "Remove"}
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max size 5MB.</p>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <div className="relative">
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                  disabled={!isEditing}
                  className="pl-10"
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <div className="relative">
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                  disabled={!isEditing}
                  className="pl-10"
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profileEmail">Email Address</Label>
              <div className="relative">
                <Input
                  id="profileEmail"
                  type="email"
                  value={email}
                  disabled
                  className="bg-gray-50 cursor-not-allowed pl-10"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profilePhone">Phone Number</Label>
              <div className="relative">
                <Input
                  id="profilePhone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  disabled={!isEditing}
                  className="pl-10"
                />
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profileRole">Role</Label>
              <div className="relative">
                <Input
                  id="profileRole"
                  value={role}
                  disabled
                  className="bg-gray-50 capitalize pl-10"
                />
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white cursor-pointer w-full sm:w-auto min-h-[44px]"
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
              <Button
                variant="outline"
                onClick={handleResetProfile}
                disabled={isSavingProfile}
                className="w-full sm:w-auto min-h-[44px]"
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            <CardTitle className="text-lg sm:text-xl">Change Password</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="grid gap-4 max-w-md w-full">

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
            className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white cursor-pointer w-full sm:w-auto min-h-[44px]"
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
