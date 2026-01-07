"use client"

import { useState, useRef, useEffect } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, Trash2, Lock, Eye, EyeOff, Check, X, User, Mail, FileText, Building2, MapPin, Phone, Globe, Languages } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useCurrency } from "@/contexts/currency-context"
import { createClient } from "@/lib/supabase/client"
import { DatePicker } from "@/components/ui/input/DatePicker"
import { SelectInput } from "@/components/ui/input/SelectInput"
import { PhoneInputSingle } from "@/components/ui/input/PhoneInputSingle"
import { getUserInitials, getAvatarDisplayUrl } from "@/lib/utils"
import { formatFileSize, truncateFilename } from "@/lib/avatar-utils"
import { useProfileSync } from "@/hooks/useProfileSync"
import { CURRENCY_SYMBOLS } from "@/lib/exchange-rate"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const nationalityOptions = [
  { value: "United States", label: "United States" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Canada", label: "Canada" },
  { value: "Australia", label: "Australia" },
  { value: "India", label: "India" },
  { value: "Germany", label: "Germany" },
  { value: "France", label: "France" },
  { value: "Italy", label: "Italy" },
  { value: "Spain", label: "Spain" },
  { value: "Japan", label: "Japan" },
  { value: "China", label: "China" },
  { value: "Singapore", label: "Singapore" },
  { value: "United Arab Emirates", label: "United Arab Emirates" },
  { value: "Saudi Arabia", label: "Saudi Arabia" },
  { value: "New Zealand", label: "New Zealand" },
  { value: "South Korea", label: "South Korea" },
  { value: "Brazil", label: "Brazil" },
  { value: "South Africa", label: "South Africa" },
  { value: "Mexico", label: "Mexico" },
  { value: "Thailand", label: "Thailand" },
];

const languageOptions = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "it", label: "Italiano" },
  { value: "pt", label: "Português" },
  { value: "zh", label: "中文" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
  { value: "ar", label: "العربية" },
  { value: "hi", label: "हिन्दी" },
  { value: "ru", label: "Русский" },
];

// ... imports ...

export function MyProfile({ stats }) {
  // ...
  const { toast } = useToast()
  const { user, profile: authProfile, updateProfile } = useAuth()
  const { formatPrice } = useCurrency()
  const {
    profile: syncedProfile,
    loading,
    profileVersion,
    isProfileFresh,
    manualRefresh
  } = useProfileSync()
  const fileInputRef = useRef(null)
  const supabase = createClient()

  // Function to format member since date with fallback
  const getMemberSinceText = () => {
    if (user?.created_at) {
      try {
        const createdDate = new Date(user.created_at)
        // Check if date is valid
        if (isNaN(createdDate.getTime())) {
          return "Member since recently"
        }
        return `Member since ${format(createdDate, 'MMM yyyy')}`
      } catch (error) {
        console.error('Error formatting member since date:', error)
        return "Member since recently"
      }
    }
    return "Member since recently"
  }
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

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [profileImage, setProfileImage] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const [imageLoading, setImageLoading] = useState(false)
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [avatarFileName, setAvatarFileName] = useState("")
  const [avatarFileSize, setAvatarFileSize] = useState(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [nationality, setNationality] = useState("")
  const [passportNumber, setPassportNumber] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [countryCode, setCountryCode] = useState("")
  const [preferredLanguage, setPreferredLanguage] = useState("en")

  // Initialize profile data from AuthContext
  useEffect(() => {
    if (authProfile) {
      setFirstName(authProfile.first_name || "")
      setLastName(authProfile.last_name || "")
      setPhone(authProfile.phone_number || "")
      setAddress(authProfile.address || "")
      setDateOfBirth(authProfile.date_of_birth || "")
      setNationality(authProfile.nationality || "")
      setPassportNumber(authProfile.passport_number || "")
      setCity(authProfile.city || "")
      setPostalCode(authProfile.postal_code || "")
      setCountryCode(authProfile.country_code || "")
      setPreferredLanguage(authProfile.preferred_language || "en")

      // Set profile image and filename from database
      setProfileImage(getAvatarDisplayUrl(authProfile.avatar_url))
      setAvatarFileName(authProfile.avatar_filename || "")
      setAvatarFileSize(authProfile.avatar_file_size || null)
    }
  }, [authProfile, user])

  const handleCancel = () => {
    // Reset the form to original values from authProfile
    if (authProfile) {
      setFirstName(authProfile.first_name || "")
      setLastName(authProfile.last_name || "")
      setPhone(authProfile.phone_number || "")
      setAddress(authProfile.address || "")
      setDateOfBirth(authProfile.date_of_birth || "")
      setNationality(authProfile.nationality || "")
      setPassportNumber(authProfile.passport_number || "")
      setCity(authProfile.city || "")
      setPostalCode(authProfile.postal_code || "")
      setCountryCode(authProfile.country_code || "")
      setPreferredLanguage(authProfile.preferred_language || "en")
    }
    // Clear any selected file
    setSelectedFile(null)
    // Exit editing mode
    setIsEditing(false)
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      // Check if user is authenticated
      if (!user?.id) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please log in again to update your profile. Your session may have expired.",
        })
        setIsSaving(false)
        return
      }


      // Validate required fields
      if (!firstName?.trim() || !lastName?.trim()) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "First name and last name are required.",
        })
        setIsSaving(false)
        return
      }

      // Validate nationality
      if (!nationality) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Nationality is required.",
        })
        setIsSaving(false)
        return
      }

      // Upload image if selected
      let avatarUrl = null
      let uploadedFileName = null
      let uploadedFileSize = null

      if (selectedFile) {
        const uploadResult = await uploadImage(selectedFile)
        if (uploadResult) {
          avatarUrl = uploadResult.avatarUrl
          uploadedFileName = uploadResult.avatarFileName
          uploadedFileSize = uploadResult.avatarFileSize
        } else {
          // Image upload failed, but we'll continue with profile update
          console.error('Image upload failed during profile save')
          toast({
            variant: "destructive",
            title: "Photo Upload Failed",
            description: "Your profile picture could not be uploaded. This might be due to storage configuration issues. Your other profile changes will still be saved.",
            duration: 6000, // Show for longer to help with debugging
          })
        }
      }

      // Prepare data for API (convert to database field names)
      // Note: Email is excluded as it cannot be changed for security reasons
      const profileData = {
        // Required fields - never send null/undefined to database
        first_name: firstName?.trim() || authProfile?.first_name || '',
        last_name: lastName?.trim() || authProfile?.last_name || '',
        nationality: nationality || null,

        // Optional fields - can be null/empty
        phone_number: phone?.trim() || null,
        address: address?.trim() || null,
        date_of_birth: dateOfBirth || null,
        passport_number: passportNumber?.trim() || null,
        city: city?.trim() || null,
        postal_code: postalCode?.trim() || null,
        country_code: countryCode?.trim() || null,
        preferred_language: preferredLanguage || 'en',

        // Include uploaded image URL, or keep existing one if no new image uploaded
        avatar_url: avatarUrl || authProfile?.avatar_url || null
      }


      // Call updateProfile function from AuthContext (now enhanced with auto-refresh)
      const result = await updateProfile(profileData)

      if (result.success) {
        toast({
          title: "Profile Updated Successfully!",
          description: avatarUrl
            ? "Your profile and profile picture have been saved and synchronized."
            : "Your profile changes have been saved and synchronized across all pages.",
        })
        setIsEditing(false)
        setSelectedFile(null) // Clear selected file after successful save

        // Note: No need to manually update local state - AuthContext handles it
        // The profile sync system ensures all components get the fresh data
      } else {
        // Provide more specific error messages
        let errorMessage = result.error || "Failed to update profile. Please try again."

        if (result.error?.includes('First name')) {
          errorMessage = "First name is required and cannot be empty."
        } else if (result.error?.includes('Last name')) {
          errorMessage = "Last name is required and cannot be empty."
        } else if (result.error?.includes('database') || result.error?.includes('server')) {
          errorMessage = "Server error occurred. Please try again in a moment."
        }

        toast({
          variant: "destructive",
          title: "Update Failed",
          description: errorMessage,
        })
      }
    } catch (error) {
      console.error('Profile save error:', error)
      toast({
        variant: "destructive",
        title: "Unexpected Error",
        description: "An error occurred while saving your profile. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleUploadPhoto = () => {
    fileInputRef.current?.click()
  }

  const uploadImage = async (file) => {
    if (!file || !user?.id) return null

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    // Removed userId - backend now uses authenticated user's ID for security

    try {
      // Get JWT token for authenticated request
      const { data: { session } } = await supabase.auth.getSession()

      const headers = {}
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch('/api/auth/profile/upload-avatar', {
        method: 'POST',
        headers,
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Upload API error details:', errorData)

        // Create more specific error message
        let errorMessage = errorData.error || 'Failed to upload image'
        if (errorData.code === 'AUTH_REQUIRED' || response.status === 401) {
          errorMessage = 'Authentication required. Please log in again and try again.'
        } else if (errorData.code === 'STORAGE_ERROR') {
          errorMessage = 'Storage configuration error. Please contact support.'
        } else if (errorData.details?.includes('bucket')) {
          errorMessage = 'Photo storage not configured. Please contact administrator.'
        } else if (errorData.details?.includes('permission') || response.status === 403) {
          errorMessage = 'You do not have permission to upload photos.'
        }

        throw new Error(errorMessage)
      }

      const result = await response.json()

      // Handle warning messages
      if (result.warning) {
        toast({
          variant: "destructive",
          title: "Partial Success",
          description: result.warning,
        })
      }

      // Return both URL and filename information
      return {
        avatarUrl: result.avatarUrl,
        avatarFileName: result.avatarFileName,
        avatarFileSize: result.avatarFileSize
      }
    } catch (error) {
      console.error('Image upload error:', error)
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Failed to upload profile picture.",
      })
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveAvatar = async () => {
    setIsRemoving(true)

    try {
      const supabase = createClient()

      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please log in again to remove your profile photo.",
        })
        return
      }

      const response = await fetch('/api/auth/profile/remove-avatar', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (result.success) {
        // Clear local state
        setProfileImage('')
        setSelectedFile(null)
        setAvatarFileName('')
        setAvatarFileSize(null)

        // Update profile via auth context to clear avatar fields
        if (result.code !== 'NO_AVATAR') {
          await updateProfile({
            avatar_url: null,
            avatar_filename: null,
            avatar_storage_path: null
          })
        }

        toast({
          title: result.code === 'NO_AVATAR' ? "No Avatar to Remove" : "Avatar Removed Successfully",
          description: result.message,
        })

        setIsRemoveDialogOpen(false)

        // Refresh page to update header with initials
        if (result.code !== 'NO_AVATAR') {
          setTimeout(() => window.location.reload(), 500)
        }
      } else {
        throw new Error(result.error || 'Failed to remove avatar')
      }
    } catch (error) {
      console.error('Avatar removal error:', error)
      toast({
        variant: "destructive",
        title: "Removal Failed",
        description: error.message || "Failed to remove profile picture.",
      })
    } finally {
      setIsRemoving(false)
      setIsRemoveDialogOpen(false)
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Only JPEG, PNG, GIF, and WebP images are allowed.",
        })
        return
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: "Maximum file size is 5MB.",
        })
        return
      }

      // Store the file for upload and create preview
      setSelectedFile(file)
      setProfileImage(URL.createObjectURL(file))
      toast({
        title: "Photo Selected",
        description: "Your profile picture has been selected. Save changes to upload.",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="lg:text-3xl text-2xl font-bold">My Profile</h2>
        {!isEditing ? (
          <Button className="cursor-pointer" onClick={() => setIsEditing(true)}>Edit Profile</Button>
        ) : (
          <div className="flex gap-2">
            <Button className="cursor-pointer" variant="outline" onClick={handleCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button className="cursor-pointer" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Picture */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
              <AvatarImage
                src={profileImage || undefined}
                alt="Profile picture"
                title="Profile picture"
                onLoad={() => setImageLoading(false)}
                onError={(e) => {
                  // If image fails to load, hide it to show fallback
                  e.target.style.display = 'none'
                  setImageLoading(false)
                }}
                onLoadStart={() => setImageLoading(true)}
              />
              <AvatarFallback className="text-3xl font-bold bg-linear-to-br from-blue-500 to-purple-600 text-white">
                {imageLoading ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : firstName || lastName ? (
                  getUserInitials(firstName, lastName, user?.email)
                ) : (
                  // Show skeleton avatar when no name is provided
                  <div className="w-full h-full bg-gray-200/20 animate-pulse rounded-full"></div>
                )}
              </AvatarFallback>
            </Avatar>

            {/* Filename Display - Only show when avatar exists */}
            {profileImage && avatarFileName && (
              <div className="text-center mt-2">
                <p
                  className="text-xs text-gray-600 truncate max-w-[140px] mx-auto"
                  title={avatarFileName}
                >
                  {truncateFilename(avatarFileName, 20).displayText}
                </p>
                {avatarFileSize && (
                  <p className="text-xs text-gray-400">
                    {formatFileSize(avatarFileSize)}
                  </p>
                )}
              </div>
            )}
            {isEditing && (
              <>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <Button
                  variant="outline"
                  className="mt-4 bg-transparent"
                  size="sm"
                  onClick={handleUploadPhoto}
                  disabled={isUploading || isRemoving || isSaving}
                >
                  {isUploading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Photo
                    </>
                  )}
                </Button>

                {/* Show remove button only when user has a custom avatar (not default placeholder) */}
                {isEditing && profileImage && profileImage !== '/placeholder.svg' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsRemoveDialogOpen(true)}
                    disabled={isUploading || isRemoving || isSaving}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {isRemoving ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-red-300 border-t-red-600"></div>
                        Removing...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove Photo
                      </>
                    )}
                  </Button>
                )}
              </>
            )}
            <div className="mt-6 w-full space-y-2 text-center">
              {authProfile ? (
                <>
                  <p className="font-semibold text-lg">
                    {firstName} {lastName}
                  </p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                  <p className="text-sm text-gray-600">{getMemberSinceText()}</p>
                </>
              ) : (
                // Skeleton loading for profile info
                <>
                  <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mx-auto mb-1"></div>
                  <div className="h-4 w-40 bg-gray-200 animate-pulse rounded mx-auto mb-1"></div>
                  <div className="h-4 w-36 bg-gray-200 animate-pulse rounded mx-auto"></div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            {!authProfile ? (
              // Skeleton loading for profile form
              <div className="grid gap-6 md:grid-cols-2">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">

                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
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
                      disabled={!isEditing}
                      className="pl-10"
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="group relative">
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="bg-gray-50 cursor-not-allowed pl-10"
                        readOnly
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                      <p>Email cannot be changed for security reasons.</p>
                      <div className="absolute bottom-0 left-4 transform translate-y-full">
                        <div className="border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <PhoneInputSingle
                    label="Phone Number"
                    icon={Phone}
                    value={{
                      countryCode: countryCode,
                      phoneNumber: phone
                    }}
                    onChange={(newValue) => {
                      setCountryCode(newValue.countryCode)
                      setPhone(newValue.phoneNumber)
                    }}
                    placeholder="Enter phone number"
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <Textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      disabled={!isEditing}
                      rows={2}
                      className="pl-10"
                    />
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <DatePicker
                    key={`${isEditing ? 'editing' : 'view'}-${dateOfBirth || 'empty'}`}
                    value={dateOfBirth}
                    onChange={(date) => setDateOfBirth(date)}
                    label="Date of Birth"
                    placeholder="Select your date of birth"
                    disabled={!isEditing}
                    disabledDate={(date) => {
                      const today = new Date()
                      const birthDate = new Date(date)
                      let age = today.getFullYear() - birthDate.getFullYear()
                      const monthDiff = today.getMonth() - birthDate.getMonth()

                      // Adjust age if birthday hasn't occurred yet this year
                      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                        age--
                      }

                      return age < 18 // Must be 18 years or older
                    }}
                    captionLayout="dropdown"
                    fromYear={1920}
                    toYear={new Date().getFullYear() - 18}
                    defaultMonth={new Date(2000, 0)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passportNumber">Passport Number</Label>
                  <div className="relative">
                    <Input
                      id="passportNumber"
                      value={passportNumber}
                      onChange={(e) => setPassportNumber(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your passport number"
                      className="pl-10"
                    />
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <div className="relative">
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your city"
                      className="pl-10"
                    />
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <div className="relative">
                    <Input
                      id="postalCode"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your postal code"
                      className="pl-10"
                    />
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <SelectInput
                    label="Nationality"
                    icon={Globe}
                    value={nationality}
                    onChange={(value) => setNationality(value)}
                    options={nationalityOptions}
                    placeholder="Select nationality"
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <SelectInput
                    label="Preferred Language"
                    icon={Languages}
                    value={preferredLanguage}
                    onChange={(value) => setPreferredLanguage(value)}
                    options={languageOptions}
                    placeholder="Select preferred language"
                    disabled={!isEditing}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Account Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Account Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-3 sm:p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats?.totalBookings || 0}</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Total Bookings</p>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats?.completedBookings || 0}</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Completed Trips</p>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <p className="text-2xl sm:text-3xl font-bold text-orange-600">{stats?.activeBookings || 0}</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Active Bookings</p>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                {stats?.isMultiCurrency
                  ? `$${(stats?.totalSpent || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                  : `${CURRENCY_SYMBOLS[stats?.currencyCode || 'USD'] || '$'}${(stats?.totalSpent || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                }
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Total Spent</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Section */}
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
            className="bg-black text-white hover:bg-black/90"
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



      {/* Avatar Removal Confirmation Dialog */}
      <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Profile Photo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove your profile photo? This action cannot be undone.
              Your initials will be shown instead of your photo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveAvatar}
              disabled={isRemoving}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRemoving ? 'Removing...' : 'Remove Photo'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
