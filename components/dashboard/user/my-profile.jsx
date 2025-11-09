"use client"

import { useState, useRef, useEffect } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { DatePicker } from "@/components/ui/input/DatePicker"
import { SelectInput } from "@/components/ui/input/SelectInput"
import { getUserInitials, getAvatarDisplayUrl } from "@/lib/utils"

const nationalityOptions = [
  { value: "US", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "IN", label: "India" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "IT", label: "Italy" },
  { value: "ES", label: "Spain" },
  { value: "JP", label: "Japan" },
  { value: "CN", label: "China" },
  { value: "SG", label: "Singapore" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "SA", label: "Saudi Arabia" },
  { value: "NZ", label: "New Zealand" },
  { value: "KR", label: "South Korea" },
  { value: "BR", label: "Brazil" },
  { value: "ZA", label: "South Africa" },
  { value: "MX", label: "Mexico" },
  { value: "TH", label: "Thailand" },
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

export function MyProfile() {
  const { toast } = useToast()
  const { user, profile: authProfile, updateProfile } = useAuth()
  const fileInputRef = useRef(null)

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
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [profileImage, setProfileImage] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const [imageLoading, setImageLoading] = useState(false)
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    nationality: "",
    passportNumber: "",
    city: "",
    postalCode: "",
    countryCode: "",
    preferredLanguage: "en",
  })

  // Initialize profile data from AuthContext
  useEffect(() => {
    if (authProfile) {
      setProfile({
        firstName: authProfile.first_name || "",
        lastName: authProfile.last_name || "",
        email: user?.email || "",
        phone: authProfile.phone_number || "",
        address: authProfile.address || "",
        dateOfBirth: authProfile.date_of_birth || "",
        nationality: authProfile.nationality || "",
        passportNumber: authProfile.passport_number || "",
        city: authProfile.city || "",
        postalCode: authProfile.postal_code || "",
        countryCode: authProfile.country_code || "",
        preferredLanguage: authProfile.preferred_language || "en",
      })

      // Set profile image from database
      setProfileImage(getAvatarDisplayUrl(authProfile.avatar_url))
    }
  }, [authProfile, user])

  const handleSave = async () => {
    setIsSaving(true)

    try {
      // Check if user is authenticated
      if (!user?.id) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "You must be logged in to update your profile.",
        })
        setIsSaving(false)
        return
      }

      console.log('Saving profile for user:', user.id)
      console.log('Current profile data:', profile)

      // Validate required fields
      if (!profile.firstName?.trim() || !profile.lastName?.trim()) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "First name and last name are required.",
        })
        setIsSaving(false)
        return
      }

      // Upload image if selected
      let avatarUrl = null
      if (selectedFile) {
        avatarUrl = await uploadImage(selectedFile)
        if (!avatarUrl) {
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
        first_name: profile.firstName?.trim(),
        last_name: profile.lastName?.trim(),
        phone_number: profile.phone?.trim(),
        address: profile.address?.trim(),
        date_of_birth: profile.dateOfBirth,
        nationality: profile.nationality?.trim(),
        passport_number: profile.passportNumber?.trim(),
        city: profile.city?.trim(),
        postal_code: profile.postalCode?.trim(),
        country_code: profile.countryCode?.trim(),
        preferred_language: profile.preferredLanguage,
        // Include uploaded image URL, or keep existing one if no new image uploaded
        avatar_url: avatarUrl || authProfile?.avatar_url
      }

      console.log('Prepared profile data for API:', profileData)

      // Call updateProfile function from AuthContext
      const result = await updateProfile(profileData)
      console.log('Update profile result:', result)

      if (result.success) {
        toast({
          title: "Profile Updated Successfully!",
          description: avatarUrl
            ? "Your profile and profile picture have been saved."
            : "Your profile changes have been saved.",
        })
        setIsEditing(false)
        setSelectedFile(null) // Clear selected file after successful save

        // Update local profile image state if avatar was uploaded
        if (avatarUrl) {
          setProfileImage(avatarUrl)
        }
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
    formData.append('userId', user.id)

    try {
      const response = await fetch('/api/auth/profile/upload-avatar', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Upload API error details:', errorData)

        // Create more specific error message
        let errorMessage = errorData.error || 'Failed to upload image'
        if (errorData.code === 'STORAGE_ERROR') {
          errorMessage = 'Storage configuration error. Please contact support.'
        } else if (errorData.details?.includes('bucket')) {
          errorMessage = 'Photo storage not configured. Please contact administrator.'
        } else if (errorData.details?.includes('permission')) {
          errorMessage = 'You do not have permission to upload photos.'
        }

        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('Upload successful:', result)

      // Handle warning messages
      if (result.warning) {
        toast({
          variant: "destructive",
          title: "Partial Success",
          description: result.warning,
        })
      }

      return result.avatarUrl
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
        <h2 className="text-3xl font-bold">My Profile</h2>
        {!isEditing ? (
          <Button className="cursor-pointer" onClick={() => setIsEditing(true)}>Edit Profile</Button>
        ) : (
          <div className="flex gap-2">
            <Button className="cursor-pointer" variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
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
            <Avatar className="h-32 w-32">
              <AvatarImage
                src={profileImage || "/placeholder.svg"}
                alt="Profile picture"
                onLoad={() => setImageLoading(false)}
                onError={(e) => {
                  // If image fails to load, hide it to show fallback
                  e.target.style.display = 'none'
                  setImageLoading(false)
                }}
                onLoadStart={() => setImageLoading(true)}
              />
              <AvatarFallback className="text-2xl">
                {imageLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                ) : (
                  getUserInitials(profile.firstName, profile.lastName, profile.email)
                )}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <Button
                  variant="outline"
                  className="mt-4 bg-transparent"
                  size="sm"
                  onClick={handleUploadPhoto}
                  disabled={isUploading || isSaving}
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
              </>
            )}
            <div className="mt-6 w-full space-y-2 text-center">
              <p className="font-semibold text-lg">
                {profile.firstName} {profile.lastName}
              </p>
              <p className="text-sm text-gray-600">{profile.email}</p>
              <p className="text-sm text-gray-600">{getMemberSinceText()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="group relative">
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-gray-50 cursor-not-allowed"
                    readOnly
                  />
                  <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <p>Email cannot be changed for security reasons.</p>
                    <div className="absolute bottom-0 left-4 transform translate-y-full">
                      <div className="border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  disabled={!isEditing}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <DatePicker
                  key={`${isEditing ? 'editing' : 'view'}-${profile.dateOfBirth || 'empty'}`}
                  value={profile.dateOfBirth}
                  onChange={(date) => setProfile({ ...profile, dateOfBirth: date })}
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
                <Input
                  id="passportNumber"
                  value={profile.passportNumber}
                  onChange={(e) => setProfile({ ...profile, passportNumber: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Enter your passport number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Enter your city"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={profile.postalCode}
                  onChange={(e) => setProfile({ ...profile, postalCode: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Enter your postal code"
                />
              </div>
              <div className="space-y-2">
                <SelectInput
                  label="Nationality"
                  value={profile.nationality}
                  onChange={(value) => setProfile({ ...profile, nationality: value })}
                  options={nationalityOptions}
                  placeholder="Select nationality"
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <SelectInput
                  label="Preferred Language"
                  value={profile.preferredLanguage}
                  onChange={(value) => setProfile({ ...profile, preferredLanguage: value })}
                  options={languageOptions}
                  placeholder="Select preferred language"
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Account Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">12</p>
              <p className="text-sm text-gray-600">Total Bookings</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">9</p>
              <p className="text-sm text-gray-600">Completed Trips</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">3</p>
              <p className="text-sm text-gray-600">Active Bookings</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">$247</p>
              <p className="text-sm text-gray-600">Total Spent</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
