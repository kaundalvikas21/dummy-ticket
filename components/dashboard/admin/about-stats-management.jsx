"use client"

import { useState, useEffect } from "react"
import {
  Search, Plus, Edit, Trash2, Eye, EyeOff, Info, GripVertical, Award, Globe, Users,
  CheckCircle2, TrendingUp, Star, Target, Zap, Heart, Shield, Rocket, Clock, MapPin, Plane, Briefcase, Loader2,
  Languages
} from "lucide-react"
import { LOCALES, DEFAULT_LOCALE } from "@/lib/locales"
import { FlagIcon } from "@/components/ui/flag-icon"

// Icon mapping object for dynamic rendering
const iconMap = {
  Users,
  Globe,
  Award,
  CheckCircle2,
  TrendingUp,
  Star,
  Target,
  Zap,
  Heart,
  Shield,
  Rocket,
  Clock,
  MapPin,
  Plane,
  Briefcase,
  Info // fallback icon
}

// Get available icon names for the select dropdown
const availableIconNames = Object.keys(iconMap).filter(icon => icon !== 'Info')
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

export function AboutStatsManagement() {
  const { toast } = useToast()
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedStat, setSelectedStat] = useState(null)
  const [showTranslationsDialog, setShowTranslationsDialog] = useState(false)
  const [translationLocale, setTranslationLocale] = useState(DEFAULT_LOCALE)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingTranslations, setIsSavingTranslations] = useState(false)
  const [formData, setFormData] = useState({
    icon: "",
    value: "",
    label: "",
    status: "active",
    sort_order: 1,
    translations: {}
  })

  // Fetch stats from API
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/about/stats/admin')
      const result = await response.json()

      if (response.ok) {
        setStats(result.stats || [])
      } else {
        console.error('Failed to fetch about stats:', result.error)
      }
    } catch (error) {
      console.error('Error fetching about stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  // Filter stats based on search
  const filteredStats = stats.filter(stat =>
    stat.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stat.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stat.icon.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = selectedStat ? `/api/about/stats/${selectedStat.id}` : '/api/about/stats'
      const method = selectedStat ? 'PUT' : 'POST'

      // Show saving toast
      const savingToast = toast({
        title: "Saving...",
        description: `Please wait while we ${selectedStat ? 'update' : 'create'} the stat.`,
      })

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      // Dismiss saving toast
      savingToast.dismiss()

      if (response.ok) {
        await fetchStats()
        setShowAddDialog(false)
        setShowEditDialog(false)
        setFormData({ icon: "", value: "", label: "", status: "active", sort_order: 1 })
        setSelectedStat(null)
        toast({
          title: "✅ Success!",
          description: `Stat ${selectedStat ? 'updated' : 'created'} successfully`,
        })
      } else {
        console.error('Failed to save stat:', result.error)
        toast({
          title: "❌ Error",
          description: result.error || "Failed to save stat. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error saving stat:', error)
      toast({
        title: "❌ Error",
        description: "Network error occurred. Please check your connection and try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!selectedStat) return

    try {
      const response = await fetch(`/api/about/stats/${selectedStat.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (response.ok) {
        await fetchStats()
        setShowDeleteDialog(false)
        setSelectedStat(null)
        toast({
          title: "Success",
          description: "Stat deleted successfully",
        })
      } else {
        console.error('Failed to delete stat:', result.error)
        toast({
          title: "Error",
          description: "Failed to delete stat. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting stat:', error)
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Toggle status
  const toggleStatus = async (stat) => {
    try {
      const response = await fetch(`/api/about/stats/${stat.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...stat,
          status: stat.status === 'active' ? 'inactive' : 'active'
        }),
      })

      if (response.ok) {
        await fetchStats()
        toast({
          title: "Success",
          description: `Stat ${stat.status === 'active' ? 'deactivated' : 'activated'} successfully`,
        })
      }
    } catch (error) {
      console.error('Error toggling status:', error)
      toast({
        title: "Error",
        description: "Failed to toggle status. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Update stat order
  const updateStatOrder = async (stat, newOrder) => {
    try {
      const response = await fetch(`/api/about/stats/${stat.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...stat,
          sort_order: parseInt(newOrder)
        }),
      })

      if (response.ok) {
        await fetchStats()
        toast({
          title: "Success",
          description: "Stat order updated successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update stat order. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating stat order:', error)
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Open edit dialog
  const openEditDialog = (stat) => {
    setSelectedStat(stat)

    // Initialize translations with existing data
    const translations = {}
    Object.keys(LOCALES).forEach(locale => {
      const translation = stat.about_stats_translations?.find(t => t.locale === locale)
      translations[locale] = {
        label: translation?.label || (locale === DEFAULT_LOCALE ? stat.label : ""),
        value: translation?.value || (locale === DEFAULT_LOCALE ? stat.value : "")
      }
    })

    setFormData({
      icon: stat.icon,
      value: stat.value,
      label: stat.label,
      status: stat.status,
      sort_order: stat.sort_order,
      translations
    })
    setShowEditDialog(true)
  }

  // Open translations dialog
  const openTranslationsDialog = async (stat) => {
    setSelectedStat(stat)
    setTranslationLocale(DEFAULT_LOCALE)

    // Initialize formData with empty translations
    const initialTranslations = {}
    Object.keys(LOCALES).forEach(locale => {
      initialTranslations[locale] = {
        label: '',
        value: ''
      }
    })

    try {
      // Load existing translations
      const response = await fetch(`/api/about-stats-translations?stat_id=${stat.id}`)
      const result = await response.json()

      if (response.ok && result.translations) {
        result.translations.forEach(translation => {
          if (initialTranslations[translation.locale]) {
            initialTranslations[translation.locale] = {
              label: translation.label || '',
              value: translation.value || ''
            }
          }
        })
      }

      // Set default (English) content if no translation exists
      if (!initialTranslations[DEFAULT_LOCALE].label && !initialTranslations[DEFAULT_LOCALE].value) {
        initialTranslations[DEFAULT_LOCALE] = {
          label: stat.label || '',
          value: stat.value || ''
        }
      }
    } catch (error) {
      console.error('Error loading translations:', error)
      // Set default content on error
      initialTranslations[DEFAULT_LOCALE] = {
        label: stat.label || '',
        value: stat.value || ''
      }
    }

    setFormData(prev => ({
      ...prev,
      translations: initialTranslations
    }))

    setShowTranslationsDialog(true)
  }

  // Translation update functions
  const updateTranslationLabel = (locale, label) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...(prev.translations || {}),
        [locale]: {
          ...(prev.translations?.[locale] || {}),
          label: label
        }
      }
    }))
  }

  const updateTranslationValue = (locale, value) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...(prev.translations || {}),
        [locale]: {
          ...(prev.translations?.[locale] || {}),
          value: value
        }
      }
    }))
  }

  // Handle save all translations
  const handleSaveAllTranslations = async () => {
    if (!selectedStat) return

    const stat = selectedStat
    const translationsToSave = []

    // Check if English (DEFAULT_LOCALE) translation is filled
    const englishTranslation = formData.translations[DEFAULT_LOCALE]
    if (!englishTranslation || (!englishTranslation.label?.trim() && !englishTranslation.value?.trim())) {
      toast({
        title: "Required",
        description: "English translation label or value is required",
        variant: "destructive"
      })
      return
    }

    // Prepare translations for all languages
    Object.entries(LOCALES).forEach(([code, locale]) => {
      const translation = formData.translations[code]
      if (translation && (translation.label?.trim() || translation.value?.trim())) {
        translationsToSave.push({
          stat_id: stat.id,
          locale: code,
          label: translation.label?.trim() || '',
          value: translation.value?.trim() || ''
        })
      }
    })

    setIsSavingTranslations(true)

    try {
      const savePromises = translationsToSave.map(async (translation) => {
        const response = await fetch('/api/about-stats-translations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(translation),
        })
        const result = await response.json()
        return { response, result }
      })

      const saveResults = await Promise.all(savePromises)
      const hasErrors = saveResults.some(({ response }) => !response.ok)

      if (!hasErrors) {
        toast({
          title: "✅ Success!",
          description: "All translations saved successfully",
        })
        await fetchStats() // Refresh the data
        setShowTranslationsDialog(false)
      } else {
        const errors = saveResults
          .filter(({ response }) => !response.ok)
          .map(({ result }) => result.error)
        console.error('Some translations failed to save:', errors)
        toast({
          title: "⚠️ Partial Success",
          description: "Some translations failed to save. Please check and try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error saving translations:', error)
      toast({
        title: "❌ Error",
        description: "Network error occurred while saving translations. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSavingTranslations(false)
    }
  }

  // Get translation completion status
  const getTranslationStatus = (stat) => {
    const totalLocales = Object.keys(LOCALES).length
    const translatedLocales = stat.about_stats_translations?.length || 0
    const englishExists = stat.label && stat.value
    const completion = englishExists ? Math.round((translatedLocales / totalLocales) * 100) : 0
    return completion
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">About Us Stats Management</h1>
          <p className="text-gray-600">Manage statistics displayed on the About Us page</p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Stat
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search stats..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats List */}
      <Card>
        <CardHeader>
          <CardTitle>All Stats ({filteredStats.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {/* Loading skeleton */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse"></div>
                        <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-12 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-center py-4 text-sm text-gray-500">
                Loading statistics data...
              </div>
            </div>
          ) : filteredStats.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Award className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No stats found' : 'No statistics yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm
                  ? 'Try adjusting your search terms or browse all statistics.'
                  : 'Create your first statistic to display on the About Us page.'
                }
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => setShowAddDialog(true)}
                  className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Stat
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStats.map((stat, index) => (
                <div
                  key={stat.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#0066FF] to-[#00D4AA]">
                          {(() => {
                            const IconComponent = iconMap[stat.icon] || iconMap.Info
                            return <IconComponent className="w-4 h-4 text-white" />
                          })()}
                        </div>
                        <h3 className="font-semibold text-gray-900">{stat.value}</h3>
                        <Badge
                          variant={stat.status === 'active' ? 'default' : 'secondary'}
                          className={
                            stat.status === 'active'
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : 'bg-gray-100 text-gray-800 border-gray-200'
                          }
                        >
                          {stat.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {stat.icon}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm">{stat.label}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Order input */}
                      <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <Input
                          type="number"
                          min="1"
                          max="99"
                          value={stat.sort_order || 1}
                          onChange={(e) => updateStatOrder(stat, e.target.value)}
                          className="w-12 h-6 text-xs text-center bg-transparent border-0 p-0 focus:ring-0"
                          title="Set order (1 = first, 2 = second, etc.)"
                        />
                      </div>

                      {/* Status toggle */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleStatus(stat)}
                        className={stat.status === 'active' ? 'text-green-600' : 'text-gray-600'}
                      >
                        {stat.status === 'active' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>

                      {/* Edit */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(stat)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      {/* Translations */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openTranslationsDialog(stat)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Languages className="w-4 h-4" />
                      </Button>

                      {/* Delete */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedStat(stat)
                          setShowDeleteDialog(true)
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Stat Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Stat</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="icon">Icon</Label>
              <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an icon" />
                </SelectTrigger>
                <SelectContent>
                  {availableIconNames.map((iconName) => (
                    <SelectItem key={iconName} value={iconName}>
                      {iconName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="Enter the value (e.g., 500K+, 150+, 99.9%)"
                required
              />
            </div>

            <div>
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="Enter the label (e.g., Happy Customers)"
                required
              />
            </div>

            <div>
              <Label htmlFor="sort-order">Display Order</Label>
              <Input
                id="sort-order"
                type="number"
                min="1"
                max="99"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 1 })}
                placeholder="1 = first, 2 = second, etc."
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="status"
                checked={formData.status === 'active'}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, status: checked ? 'active' : 'inactive' })
                }
              />
              <Label htmlFor="status">Active (visible on website)</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Stat
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Stat Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Stat</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-icon">Icon</Label>
              <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an icon" />
                </SelectTrigger>
                <SelectContent>
                  {availableIconNames.map((iconName) => (
                    <SelectItem key={iconName} value={iconName}>
                      {iconName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-value">Value</Label>
              <Input
                id="edit-value"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="Enter the value (e.g., 500K+, 150+, 99.9%)"
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-label">Label</Label>
              <Input
                id="edit-label"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="Enter the label (e.g., Happy Customers)"
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-sort-order">Display Order</Label>
              <Input
                id="edit-sort-order"
                type="number"
                min="1"
                max="99"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 1 })}
                placeholder="1 = first, 2 = second, etc."
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-status"
                checked={formData.status === 'active'}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, status: checked ? 'active' : 'inactive' })
                }
              />
              <Label htmlFor="edit-status">Active (visible on website)</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Update Stat
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Stat</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this stat? This action cannot be undone.
              <br /><br />
              <strong>Value:</strong> {selectedStat?.value}
              <br />
              <strong>Label:</strong> {selectedStat?.label}
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

      {/* Translations Dialog */}
      <Dialog open={showTranslationsDialog} onOpenChange={setShowTranslationsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Translations for "{selectedStat?.label}"
            </DialogTitle>
          </DialogHeader>

          <Tabs value={translationLocale} onValueChange={setTranslationLocale} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-4">
              {Object.entries(LOCALES).map(([code, locale]) => (
                <TabsTrigger
                  key={code}
                  value={code}
                  className="flex items-center gap-2 data-[state=active]:bg-[#0066FF] data-[state=active]:text-white"
                >
                  <FlagIcon
                    src={locale.flag}
                    alt={locale.name}
                    countryCode={locale.countryCode}
                  />
                  <span>{code.toUpperCase()}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(LOCALES).map(([code, locale]) => (
              <TabsContent key={code} value={code} className="space-y-4">
                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 mb-3">
                    <FlagIcon
                      src={locale.flag}
                      alt={locale.name}
                      countryCode={locale.countryCode}
                    />
                    <span className="font-medium">{locale.name}</span>
                    {code === DEFAULT_LOCALE && (
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">Required</span>
                    )}
                  </div>

                  {/* Translation Label */}
                  <div className="mb-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      Label
                      {code === DEFAULT_LOCALE && <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Edit from main stat</span>}
                    </Label>
                    <Input
                      value={formData.translations?.[code]?.label || ''}
                      onChange={(e) => updateTranslationLabel(code, e.target.value)}
                      placeholder="Enter label (e.g., Happy Customers)"
                      className="mt-1"
                      required={code === DEFAULT_LOCALE}
                      disabled={code === DEFAULT_LOCALE}
                    />
                  </div>

                  {/* Translation Value */}
                  <div className="mb-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      Value
                      {code === DEFAULT_LOCALE && <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Edit from main stat</span>}
                    </Label>
                    <Input
                      value={formData.translations?.[code]?.value || ''}
                      onChange={(e) => updateTranslationValue(code, e.target.value)}
                      placeholder="Enter value (e.g., 500K+, 150+, 99.9%)"
                      className="mt-1"
                      disabled={code === DEFAULT_LOCALE}
                    />
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowTranslationsDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveAllTranslations}
              className="bg-[#0066FF] hover:bg-[#0055CC]"
              disabled={isSavingTranslations}
            >
              {isSavingTranslations ? (
                <>
                  <Languages className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Languages className="w-4 h-4 mr-2" />
                  Save All Translations
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}