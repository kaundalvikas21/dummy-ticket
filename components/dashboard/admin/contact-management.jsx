"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, Phone, Mail, MapPin, Clock, Globe, Save, X, Flag, Users } from "lucide-react"
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { FlagIcon } from "@/components/ui/flag-icon"
import { SkeletonCard, SkeletonCardContent } from "@/components/ui/skeleton-card"

export function ContactManagement() {
  const { toast } = useToast()
  const supabase = createClient()

  // Helper function to get auth headers
  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      throw new Error('No authentication session found')
    }
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
  }
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedSetting, setSelectedSetting] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  // Working Hours deletion state
  const [showWorkingHoursDeleteDialog, setShowWorkingHoursDeleteDialog] = useState(false)
  const [workingHoursToDelete, setWorkingHoursToDelete] = useState(null)

  // Country Support deletion state
  const [showCountrySupportDeleteDialog, setShowCountrySupportDeleteDialog] = useState(false)
  const [countrySupportToDelete, setCountrySupportToDelete] = useState(null)

  // Loading states for deletion
  const [isDeleting, setIsDeleting] = useState(false)

  // Working hours state
  const [workingHours, setWorkingHours] = useState([])
  const [showWorkingHoursDialog, setShowWorkingHoursDialog] = useState(false)
  const [editingWorkingHours, setEditingWorkingHours] = useState(null)
  const [workingHoursFormData, setWorkingHoursFormData] = useState({
    day: "",
    hours: ""
  })

  // Country support state
  const [countrySupport, setCountrySupport] = useState([])
  const [showCountrySupportDialog, setShowCountrySupportDialog] = useState(false)
  const [editingCountrySupport, setEditingCountrySupport] = useState(null)
  const [countrySupportFormData, setCountrySupportFormData] = useState({
    country: "",
    phone: ""
  })

  // Form data
  const [formData, setFormData] = useState({
    settings_key: "",
    settings_value: "",
    settings_type: "text",
    description: ""
  })

  // Days of week for working hours
  const daysOfWeek = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Holiday"
  ]

  // Common countries for support
  const countries = [
    "USA", "India", "UAE", "UK", "Canada", "Australia", "Singapore", "Philippines"
  ]

  // Country codes for flag icons
  const countryCodes = {
    "USA": "us",
    "India": "in",
    "UAE": "ae",
    "UK": "gb",
    "Canada": "ca",
    "Australia": "au",
    "Singapore": "sg",
    "Philippines": "ph"
  }

  // Predefined contact settings for better organization
  const contactSettingCategories = [
    {
      title: "Basic Contact Information",
      settings: [
        { key: "phone", label: "Phone Number", type: "text", icon: Phone },
        { key: "email", label: "Email Address", type: "text", icon: Mail },
        { key: "address", label: "Address", type: "text", icon: MapPin }
      ]
    }
  ]

  // Settings that have their own dedicated management sections and should not appear in Additional Settings
  const specialManagedSettings = ['working_hours', 'country_support']

  // Parse working hours from settings
  const parseWorkingHours = (settings) => {
    const hoursData = settings.working_hours?.value
    if (hoursData) {
      try {
        return JSON.parse(hoursData)
      } catch {
        return []
      }
    }
    return []
  }

  // Parse country support from settings
  const parseCountrySupport = (settings) => {
    const supportData = settings.country_support?.value
    if (supportData) {
      try {
        return JSON.parse(supportData)
      } catch {
        return []
      }
    }
    return []
  }

  // Fetch contact settings
  const fetchSettings = async () => {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch('/api/contact/settings', {
        headers
      })
      const result = await response.json()

      if (response.ok) {
        setSettings(result.settings || {})
        setWorkingHours(parseWorkingHours(result.settings || {}))
        setCountrySupport(parseCountrySupport(result.settings || {}))
      } else {
        console.error('Failed to fetch contact settings:', result.error)
        toast({
          title: "Error",
          description: "Failed to fetch contact settings",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching contact settings:', error)
      toast({
        title: "Error",
        description: "Failed to fetch contact settings",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  // Reset form
  const resetForm = () => {
    setFormData({
      settings_key: "",
      settings_value: "",
      settings_type: "text",
      description: ""
    })
    setSelectedSetting(null)
  }

  // Handle edit
  const handleEdit = (settingKey) => {
    const setting = settings[settingKey]
    if (setting) {
      setFormData({
        settings_key: settingKey,
        settings_value: setting.value,
        settings_type: setting.type,
        description: setting.description || ""
      })
      setSelectedSetting(settingKey)
      setShowEditDialog(true)
    }
  }

  // Handle save (create/update)
  const handleSave = async () => {
    if (!formData.settings_key || !formData.settings_value) {
      toast({
        title: "Validation Error",
        description: "Key and value are required",
        variant: "destructive"
      })
      return
    }

    setIsSaving(true)
    try {
      const url = selectedSetting ? '/api/contact/settings' : '/api/contact/settings'
      const method = selectedSetting ? 'PUT' : 'POST'

      const headers = await getAuthHeaders()
      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: `Contact setting ${selectedSetting ? 'updated' : 'created'} successfully`
        })

        fetchSettings()
        setShowAddDialog(false)
        setShowEditDialog(false)
        resetForm()
      } else {
        toast({
          title: "Error",
          description: result.error || `Failed to ${selectedSetting ? 'update' : 'create'} setting`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error saving contact setting:', error)
      toast({
        title: "Error",
        description: "Failed to save setting",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!selectedSetting) return

    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`/api/contact/settings?key=${selectedSetting}`, {
        method: 'DELETE',
        headers
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Contact setting deleted successfully"
        })

        fetchSettings()
        setShowDeleteDialog(false)
        setSelectedSetting(null)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete setting",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting contact setting:', error)
      toast({
        title: "Error",
        description: "Failed to delete setting",
        variant: "destructive"
      })
    }
  }

  // Working hours management functions
  const handleAddWorkingHours = () => {
    setWorkingHoursFormData({ day: "", hours: "" })
    setEditingWorkingHours(null)
    setShowWorkingHoursDialog(true)
  }

  const handleEditWorkingHours = (item) => {
    // Clean existing hours value (remove " hours" suffix if present)
    const cleanHours = item.hours.toString().replace(' hours', '').trim()
    setWorkingHoursFormData({ day: item.day, hours: cleanHours })
    setEditingWorkingHours(item)
    setShowWorkingHoursDialog(true)
  }

  const handleSaveWorkingHours = async () => {
    if (!workingHoursFormData.day || !workingHoursFormData.hours) {
      toast({
        title: "Validation Error",
        description: "Day and hours are required",
        variant: "destructive"
      })
      return
    }

    const hours = parseInt(workingHoursFormData.hours)
    if (isNaN(hours) || hours < 0 || hours > 24) {
      toast({
        title: "Validation Error",
        description: "Hours must be a number between 0 and 24",
        variant: "destructive"
      })
      return
    }

    // Ensure we store the numeric value
    const cleanedFormData = {
      ...workingHoursFormData,
      hours: hours.toString() // Store as string for consistency but ensure it's a clean number
    }

    let updatedWorkingHours
    if (editingWorkingHours) {
      // Update existing item
      updatedWorkingHours = workingHours.map(item =>
        item.day === editingWorkingHours.day ? cleanedFormData : item
      )
      toast({
        title: "Success",
        description: "Working hours updated successfully"
      })
    } else {
      // Add new item
      // Check if day already exists
      if (workingHours.some(item => item.day === workingHoursFormData.day)) {
        toast({
          title: "Validation Error",
          description: "This day already exists",
          variant: "destructive"
        })
        return
      }
      updatedWorkingHours = [...workingHours, cleanedFormData]
      toast({
        title: "Success",
        description: "Working hours added successfully"
      })
    }

    setWorkingHours(updatedWorkingHours)

    // Save to settings
    await saveWorkingHoursToSettings(updatedWorkingHours)

    setShowWorkingHoursDialog(false)
    setWorkingHoursFormData({ day: "", hours: "" })
    setEditingWorkingHours(null)
  }

  const handleDeleteWorkingHours = (dayToDelete) => {
    setWorkingHoursToDelete(dayToDelete)
    setShowWorkingHoursDeleteDialog(true)
  }

  const handleConfirmDeleteWorkingHours = async () => {
    if (!workingHoursToDelete) return

    setIsDeleting(true)

    try {
      const updatedWorkingHours = workingHours.filter(item => item.day !== workingHoursToDelete)
      setWorkingHours(updatedWorkingHours)

      await saveWorkingHoursToSettings(updatedWorkingHours)

      toast({
        title: "Success",
        description: `Working hours for ${workingHoursToDelete} deleted successfully`,
      })

      setShowWorkingHoursDeleteDialog(false)
      setWorkingHoursToDelete(null)
    } catch (error) {
      console.error('Error deleting working hours:', error)
      toast({
        title: "Error",
        description: "Failed to delete working hours",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const saveWorkingHoursToSettings = async (hoursData) => {
    try {
      const headers = await getAuthHeaders()
      await fetch('/api/contact/settings', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          settings_key: 'working_hours',
          settings_value: JSON.stringify(hoursData),
          settings_type: 'json',
          description: 'Working hours for each day of the week'
        })
      })
    } catch (error) {
      console.error('Error saving working hours:', error)
    }
  }

  // Country support management functions
  const handleAddCountrySupport = () => {
    setCountrySupportFormData({ country: "", phone: "" })
    setEditingCountrySupport(null)
    setShowCountrySupportDialog(true)
  }

  const handleEditCountrySupport = (item) => {
    setCountrySupportFormData({ country: item.country, phone: item.phone })
    setEditingCountrySupport(item)
    setShowCountrySupportDialog(true)
  }

  const handleSaveCountrySupport = async () => {
    if (!countrySupportFormData.country || !countrySupportFormData.phone) {
      toast({
        title: "Validation Error",
        description: "Country and phone number are required",
        variant: "destructive"
      })
      return
    }

    let updatedCountrySupport
    if (editingCountrySupport) {
      // Update existing item
      updatedCountrySupport = countrySupport.map(item =>
        item.country === editingCountrySupport.country ? countrySupportFormData : item
      )
      toast({
        title: "Success",
        description: "Country support updated successfully"
      })
    } else {
      // Add new item
      // Check if country already exists
      if (countrySupport.some(item => item.country === countrySupportFormData.country)) {
        toast({
          title: "Validation Error",
          description: "This country already exists",
          variant: "destructive"
        })
        return
      }
      updatedCountrySupport = [...countrySupport, countrySupportFormData]
      toast({
        title: "Success",
        description: "Country support added successfully"
      })
    }

    setCountrySupport(updatedCountrySupport)

    // Save to settings
    await saveCountrySupportToSettings(updatedCountrySupport)

    setShowCountrySupportDialog(false)
    setCountrySupportFormData({ country: "", phone: "" })
    setEditingCountrySupport(null)
  }

  const handleDeleteCountrySupport = (countryToDelete) => {
    setCountrySupportToDelete(countryToDelete)
    setShowCountrySupportDeleteDialog(true)
  }

  const handleConfirmDeleteCountrySupport = async () => {
    if (!countrySupportToDelete) return

    setIsDeleting(true)

    try {
      const updatedCountrySupport = countrySupport.filter(item => item.country !== countrySupportToDelete)
      setCountrySupport(updatedCountrySupport)

      await saveCountrySupportToSettings(updatedCountrySupport)

      toast({
        title: "Success",
        description: `Country support for ${countrySupportToDelete} deleted successfully`,
      })

      setShowCountrySupportDeleteDialog(false)
      setCountrySupportToDelete(null)
    } catch (error) {
      console.error('Error deleting country support:', error)
      toast({
        title: "Error",
        description: "Failed to delete country support",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const saveCountrySupportToSettings = async (supportData) => {
    try {
      const headers = await getAuthHeaders()
      await fetch('/api/contact/settings', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          settings_key: 'country_support',
          settings_value: JSON.stringify(supportData),
          settings_type: 'json',
          description: 'Country-wise support phone numbers'
        })
      })
    } catch (error) {
      console.error('Error saving country support:', error)
    }
  }

  // Filter settings based on search
  const filteredSettings = Object.entries(settings).filter(([key, setting]) => {
    const searchLower = searchTerm.toLowerCase()
    return key.toLowerCase().includes(searchLower) ||
           setting.value.toLowerCase().includes(searchLower) ||
           (setting.description && setting.description.toLowerCase().includes(searchLower))
  })

  // Comprehensive search function for all contact settings
  const searchContactSettings = () => {
    if (!searchTerm.trim()) {
      // Return all sections when search is empty
      return {
        filteredCategories: contactSettingCategories,
        filteredWorkingHours: workingHours,
        filteredCountrySupport: countrySupport,
        filteredAdditionalSettings: filteredSettings,
        hasResults: true
      }
    }

    const searchLower = searchTerm.toLowerCase()

    // Filter contact setting categories
    const filteredCategories = contactSettingCategories.map(category => ({
      ...category,
      settings: category.settings.filter(setting => {
        const settingData = settings[setting.key]
        return (
          setting.key.toLowerCase().includes(searchLower) ||
          setting.label.toLowerCase().includes(searchLower) ||
          (settingData?.value && settingData.value.toLowerCase().includes(searchLower)) ||
          (settingData?.description && settingData.description.toLowerCase().includes(searchLower))
        )
      })
    })).filter(category => category.settings.length > 0)

    // Filter working hours
    const filteredWorkingHours = workingHours.filter(item =>
      item.day.toLowerCase().includes(searchLower) ||
      item.hours.toString().toLowerCase().includes(searchLower)
    )

    // Filter country support
    const filteredCountrySupport = countrySupport.filter(item =>
      item.country.toLowerCase().includes(searchLower) ||
      item.phone.toLowerCase().includes(searchLower)
    )

    // Filter additional settings (already has filteredSettings)
    const filteredAdditionalSettings = filteredSettings

    // Check if any section has results
    const hasResults = filteredCategories.length > 0 ||
                      filteredWorkingHours.length > 0 ||
                      filteredCountrySupport.length > 0 ||
                      filteredAdditionalSettings.length > 0

    return {
      filteredCategories,
      filteredWorkingHours,
      filteredCountrySupport,
      filteredAdditionalSettings,
      hasResults
    }
  }

  const searchResults = searchContactSettings()

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton for header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        {/* Loading skeleton for search */}
        <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>

        {/* Loading skeleton for contact categories */}
        <div className="space-y-6">
          {/* Basic Contact Information skeleton */}
          <div className="shadow-sm rounded-lg border border-gray-200 p-6">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="flex gap-1">
                      <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Working Hours skeleton */}
          <div className="shadow-sm rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex gap-1">
                      <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Country Support skeleton */}
          <div className="shadow-sm rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-8 w-28 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="flex gap-1">
                      <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Settings</h1>
          <p className="text-gray-600 mt-1">Manage contact page content and information</p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setShowAddDialog(true)
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Setting
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search settings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* No Results Message */}
      {searchTerm && !searchResults.hasResults && (
        <Card className="shadow-sm">
          <CardContent className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500 mb-4">
              Try searching for different keywords like "phone", "email", "working hours", or country names
            </p>
            <Button onClick={() => setSearchTerm('')} variant="outline">
              <X className="w-4 h-4 mr-2" />
              Clear Search
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Only show sections when there's no search or when there are results */}
      {!searchTerm || searchResults.hasResults ? (
        <>
          {/* Organized Settings by Category */}
          {searchResults.filteredCategories.map((category, categoryIndex) => (
        <Card key={categoryIndex} className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {category.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {category.settings.map((settingTemplate) => {
                const setting = settings[settingTemplate.key]
                const Icon = settingTemplate.icon

                return (
                  <Card key={settingTemplate.key} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-gray-900">
                            {settingTemplate.label}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(settingTemplate.key)}
                            disabled={!setting}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedSetting(settingTemplate.key)
                              setShowDeleteDialog(true)
                            }}
                            disabled={!setting}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {setting ? (
                        <div className="space-y-1">
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {setting.value}
                          </p>
                          {setting.description && (
                            <p className="text-xs text-gray-500">
                              {setting.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {setting.type}
                            </span>
                            {setting.updated_at && (
                              <span className="text-xs text-gray-400">
                                Updated {new Date(setting.updated_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500 mb-2">Not configured</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setFormData({
                                settings_key: settingTemplate.key,
                                settings_value: "",
                                settings_type: settingTemplate.type,
                                description: `${settingTemplate.label} for contact page`
                              })
                              setShowAddDialog(true)
                            }}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Working Hours Management */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Working Hours
            </CardTitle>
            <Button
              size="sm"
              onClick={handleAddWorkingHours}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Day
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {searchResults.filteredWorkingHours.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No working hours match your search' : 'No working hours set'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Try searching for different days or hours' : 'Add working hours for each day of the week'}
              </p>
              {!searchTerm && (
                <Button onClick={handleAddWorkingHours} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Day
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {searchResults.filteredWorkingHours.map((item, index) => (
                <Card key={index} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{item.day}</h4>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditWorkingHours(item)}
                          className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteWorkingHours(item.day)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{item.hours}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Country Support Management */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Country Support
            </CardTitle>
            <Button
              size="sm"
              onClick={handleAddCountrySupport}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Country
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {searchResults.filteredCountrySupport.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No countries match your search' : 'No country support added'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Try searching for different countries or phone numbers' : 'Add support phone numbers for different countries'}
              </p>
              {!searchTerm && (
                <Button onClick={handleAddCountrySupport} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Country
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.filteredCountrySupport.map((item, index) => (
                <Card key={index} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        <FlagIcon
                          src={`https://flagcdn.com/w80/${countryCodes[item.country] || item.country.toLowerCase()}.png`}
                          alt={`${item.country} flag`}
                          countryCode={countryCodes[item.country] || item.country.toLowerCase()}
                          size={16}
                          className="flex-shrink-0"
                        />
                        {item.country}
                      </h4>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditCountrySupport(item)}
                          className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteCountrySupport(item.country)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <a
                      href={`tel:${item.phone.replace(/[^+\d]/g, "")}`}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {item.phone}
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Settings */}
      {Object.keys(settings).some(key =>
        !contactSettingCategories.some(cat =>
          cat.settings.some(template => template.key === key)
        ) &&
        !specialManagedSettings.includes(key)
      ) && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Additional Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSettings
                .filter(([key]) =>
                  !contactSettingCategories.some(cat =>
                    cat.settings.some(template => template.key === key)
                  ) &&
                  !specialManagedSettings.includes(key)
                )
                .map(([key, setting]) => (
                  <Card key={key} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="mb-2">
                          <span className="font-medium text-gray-900">
                            {key}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(key)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedSetting(key)
                              setShowDeleteDialog(true)
                            }}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {setting.value}
                        </p>
                        {setting.description && (
                          <p className="text-xs text-gray-500">
                            {setting.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {setting.type}
                          </span>
                          {setting.updated_at && (
                            <span className="text-xs text-gray-400">
                              Updated {new Date(setting.updated_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Setting Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Contact Setting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="add-key">Setting Key</Label>
              <Input
                id="add-key"
                value={formData.settings_key}
                onChange={(e) => setFormData(prev => ({ ...prev, settings_key: e.target.value }))}
                placeholder="e.g., phone, email, address"
                disabled={isSaving}
              />
            </div>

            <div>
              <Label htmlFor="add-value">Setting Value</Label>
              {formData.settings_type === 'textarea' ? (
                <Textarea
                  id="add-value"
                  value={formData.settings_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, settings_value: e.target.value }))}
                  placeholder="Enter setting value"
                  rows={3}
                  disabled={isSaving}
                />
              ) : (
                <Input
                  id="add-value"
                  value={formData.settings_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, settings_value: e.target.value }))}
                  placeholder="Enter setting value"
                  disabled={isSaving}
                />
              )}
            </div>

            <div>
              <Label htmlFor="add-type">Type</Label>
              <Select
                value={formData.settings_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, settings_type: value }))}
                disabled={isSaving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="textarea">Textarea</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="url">URL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="add-description">Description (Optional)</Label>
              <Textarea
                id="add-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this setting"
                rows={2}
                disabled={isSaving}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={isSaving}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Setting Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Contact Setting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-key">Setting Key</Label>
              <Input
                id="edit-key"
                value={formData.settings_key}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div>
              <Label htmlFor="edit-value">Setting Value</Label>
              {formData.settings_type === 'textarea' ? (
                <Textarea
                  id="edit-value"
                  value={formData.settings_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, settings_value: e.target.value }))}
                  placeholder="Enter setting value"
                  rows={3}
                  disabled={isSaving}
                />
              ) : (
                <Input
                  id="edit-value"
                  value={formData.settings_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, settings_value: e.target.value }))}
                  placeholder="Enter setting value"
                  disabled={isSaving}
                />
              )}
            </div>

            <div>
              <Label htmlFor="edit-type">Type</Label>
              <Select
                value={formData.settings_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, settings_type: value }))}
                disabled={isSaving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="textarea">Textarea</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="url">URL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this setting"
                rows={2}
                disabled={isSaving}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={isSaving}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Updating..." : "Update"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Working Hours Dialog */}
      <Dialog open={showWorkingHoursDialog} onOpenChange={setShowWorkingHoursDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingWorkingHours ? "Edit Working Hours" : "Add Working Hours"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="working-hours-day">Day</Label>
              {editingWorkingHours ? (
                <Input
                  value={workingHoursFormData.day}
                  disabled
                  className="bg-gray-50"
                />
              ) : (
                <Select
                  value={workingHoursFormData.day}
                  onValueChange={(value) => setWorkingHoursFormData(prev => ({ ...prev, day: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map(day => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <Label htmlFor="working-hours-hours">Working Hours</Label>
              <Input
                id="working-hours-hours"
                type="number"
                min="0"
                max="24"
                value={workingHoursFormData.hours}
                onChange={(e) => setWorkingHoursFormData(prev => ({ ...prev, hours: e.target.value }))}
                placeholder="e.g., 24, 18, 15, 0"
              />
              <p className="text-xs text-gray-500 mt-1">Enter number of hours (0-24). 0 means closed.</p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowWorkingHoursDialog(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveWorkingHours}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Country Support Dialog */}
      <Dialog open={showCountrySupportDialog} onOpenChange={setShowCountrySupportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCountrySupport ? "Edit Country Support" : "Add Country Support"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="country-support-country">Country</Label>
              {editingCountrySupport ? (
                <Input
                  value={countrySupportFormData.country}
                  disabled
                  className="bg-gray-50"
                />
              ) : (
                <Select
                  value={countrySupportFormData.country}
                  onValueChange={(value) => setCountrySupportFormData(prev => ({ ...prev, country: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(country => (
                      <SelectItem key={country} value={country}>
                        <div className="flex items-center gap-2">
                          <FlagIcon
                            src={`https://flagcdn.com/w80/${countryCodes[country] || country.toLowerCase()}.png`}
                            alt={`${country} flag`}
                            countryCode={countryCodes[country] || country.toLowerCase()}
                            size={16}
                            className="flex-shrink-0"
                          />
                          {country}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <Label htmlFor="country-support-phone">Support Phone Number</Label>
              <Input
                id="country-support-phone"
                value={countrySupportFormData.phone}
                onChange={(e) => setCountrySupportFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="e.g., +1-800-123-4567"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCountrySupportDialog(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveCountrySupport}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
        </>
      ) : null}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact Setting</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the "{selectedSetting}" contact setting? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Working Hours Delete Confirmation Dialog */}
      <AlertDialog open={showWorkingHoursDeleteDialog} onOpenChange={setShowWorkingHoursDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-600" />
              Delete Working Hours
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the working hours for "<strong>{workingHoursToDelete}</strong>"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteWorkingHours}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Country Support Delete Confirmation Dialog */}
      <AlertDialog open={showCountrySupportDeleteDialog} onOpenChange={setShowCountrySupportDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-red-600" />
              Delete Country Support
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the country support for "<strong>{countrySupportToDelete}</strong>"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteCountrySupport}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}