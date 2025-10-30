"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"

export function VendorProfile() {
  const { toast } = useToast()
  const fileInputRef = useRef(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileChanged, setProfileChanged] = useState(false)

  const [profileData, setProfileData] = useState({
    name: "Global Travel Agency",
    email: "contact@globaltravel.com",
    phone: "+1 234 567 8900",
    address: "123 Business St, New York, NY",
    commission: "15%",
    description: "Leading travel agency providing comprehensive travel solutions",
  })

  const [initialProfileData] = useState(profileData)
  const [avatarUrl, setAvatarUrl] = useState(null)

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      })
      return
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    setIsUploadingPhoto(true)
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarUrl(reader.result)
      setProfileChanged(true)
      setIsUploadingPhoto(false)
      toast({
        title: "Photo uploaded",
        description: "Don't forget to save your changes",
      })
    }
    reader.readAsDataURL(file)
  }

  const handleInputChange = (field, value) => {
    setProfileData({ ...profileData, [field]: value })
    setProfileChanged(JSON.stringify({ ...profileData, [field]: value }) !== JSON.stringify(initialProfileData))
  }

  const handleSaveProfile = async () => {
    setIsSavingProfile(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSavingProfile(false)
    setProfileChanged(false)
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Vendor Profile</h1>
        <p className="text-gray-600 mt-1">Manage your vendor profile information</p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Profile Information</CardTitle>
            {profileChanged && (
              <span className="text-sm text-orange-600 flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></span>
                Unsaved changes
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl || "/placeholder.svg"} alt="Profile" />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-[#0066FF] to-[#00D4AA] text-white text-2xl">
                    GT
                  </AvatarFallback>
                )}
              </Avatar>
              <button
                onClick={handlePhotoClick}
                disabled={isUploadingPhoto}
                className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white rounded-full flex items-center justify-center hover:shadow-lg transition-shadow disabled:opacity-50"
              >
                {isUploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{profileData.name}</h3>
              <p className="text-sm text-gray-600 mt-1">Click the camera icon to upload a new photo</p>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max size 5MB</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Vendor Name *</Label>
              <Input id="name" value={profileData.name} onChange={(e) => handleInputChange("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commission">Commission Rate</Label>
              <Input
                id="commission"
                value={profileData.commission}
                onChange={(e) => handleInputChange("commission", e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={profileData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={profileData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white"
              onClick={handleSaveProfile}
              disabled={!profileChanged || isSavingProfile}
            >
              {isSavingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
