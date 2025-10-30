"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function MyProfile() {
  const { toast } = useToast()
  const fileInputRef = useRef(null)
  const [isEditing, setIsEditing] = useState(false)
  const [profileImage, setProfileImage] = useState("/placeholder.svg")
  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+1 234 567 8900",
    address: "123 Main Street, New York, NY 10001",
    dateOfBirth: "1990-01-15",
    nationality: "United States",
    passportNumber: "US123456789",
  })

  const handleSave = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    })
    setIsEditing(false)
  }

  const handleUploadPhoto = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result)
        toast({
          title: "Photo Uploaded",
          description: "Your profile picture has been updated.",
        })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">My Profile</h2>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
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
              <AvatarImage src={profileImage || "/placeholder.svg"} />
              <AvatarFallback className="text-2xl">JD</AvatarFallback>
            </Avatar>
            {isEditing && (
              <>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <Button variant="outline" className="mt-4 bg-transparent" size="sm" onClick={handleUploadPhoto}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Photo
                </Button>
              </>
            )}
            <div className="mt-6 w-full space-y-2 text-center">
              <p className="font-semibold text-lg">
                {profile.firstName} {profile.lastName}
              </p>
              <p className="text-sm text-gray-600">{profile.email}</p>
              <p className="text-sm text-gray-600">Member since Dec 2023</p>
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
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  disabled={!isEditing}
                />
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
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  value={profile.nationality}
                  onChange={(e) => setProfile({ ...profile, nationality: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="passportNumber">Passport Number</Label>
                <Input
                  id="passportNumber"
                  value={profile.passportNumber}
                  onChange={(e) => setProfile({ ...profile, passportNumber: e.target.value })}
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
