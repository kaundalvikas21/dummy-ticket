"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, Eye, EyeOff, FileCheck, CheckCircle2, Globe, Languages, List, ListOrdered, GripVertical, PlusCircle, MinusCircle, ChevronUp, ChevronDown, ChevronRight, FileText, Check, AlertCircle } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { LOCALES, DEFAULT_LOCALE } from "@/lib/locales"
import { FlagIcon } from "@/components/ui/flag-icon"

// Skeleton components (inline implementation)
const SkeletonCard = ({ children, className }) => (
  <div className={`border rounded-xl p-6 bg-white ${className}`}>
    {children}
  </div>
)

// List Display Component for rendering JSON array content as formatted list
const renderListContent = (contentString) => {
  if (!contentString) return null

  try {
    const parsedContent = JSON.parse(contentString)
    if (!Array.isArray(parsedContent) || parsedContent.length === 0) {
      return null
    }

    return (
      <ul className="space-y-2">
        {parsedContent.map((item, index) => (
          <li key={index} className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700 text-sm">{item}</span>
          </li>
        ))}
      </ul>
    )
  } catch (error) {
    // If JSON parsing fails, show as plain text
    return <span className="text-gray-600 text-sm">{contentString}</span>
  }
}

export function DummyTicketsManagement() {
  const { toast } = useToast()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [editingCard, setEditingCard] = useState(null)
  const [activeTab, setActiveTab] = useState(DEFAULT_LOCALE)

  // Helper functions for per-language list content management
  const getCurrentListContent = () => {
    const currentTranslation = formData.translations[activeTab]
    if (!currentTranslation?.content) {
      return [''] // Always return at least one empty item for editing
    }
    
    try {
      const parsed = JSON.parse(currentTranslation.content)
      const items = Array.isArray(parsed) ? parsed : []
      
      // Ensure we always have at least one item
      if (items.length === 0) {
        return ['']
      }
      
      return items
    } catch (e) {
      console.error('Error parsing list content:', e)
      return [''] // Return empty item on error
    }
  }

  const setCurrentListContent = (items) => {
    const currentTranslation = formData.translations[activeTab] || { locale: activeTab, title: '', content: '[]' }
    
    // Filter out empty strings except for the last one (placeholder)
    let cleanedItems = items.filter(item => item.trim())
    
    // If we filtered out items and the original had more items, keep the last empty placeholder
    if (cleanedItems.length === 0 && items.length > 0) {
      cleanedItems = [''] // Keep one empty placeholder for editing
    } else if (items.length > 0 && !items[items.length - 1].trim()) {
      // If the last item was empty, keep it as placeholder
      cleanedItems.push('')
    }
    
    currentTranslation.content = JSON.stringify(cleanedItems)
    
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [activeTab]: currentTranslation
      }
    }))
  }
  
  

  // Form data for all locales - FAQ-style integrated approach
  const [formData, setFormData] = useState({
    status: "active",
    sort_order: 1,
    content_type: "simple",
    translations: {}
  })

  // Initialize translations object for all locales
  useEffect(() => {
    const initialTranslations = {}
    Object.keys(LOCALES).forEach(locale => {
      initialTranslations[locale] = {
        title: "",
        content: ""
      }
    })
    setFormData(prev => ({
      ...prev,
      translations: initialTranslations
    }))
  }, [])

  // Fetch tickets from API
  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/about/dummy-tickets/admin')
      const result = await response.json()

      if (response.ok) {
        setTickets(result.tickets || [])
      } else {
        console.error('Failed to fetch dummy tickets:', result.error)
      }
    } catch (error) {
      console.error('Error fetching dummy tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  // Filter tickets based on search
  const filteredTickets = tickets.filter(ticket => {
    const searchLower = searchTerm.toLowerCase()

    // Check main ticket fields
    const mainMatch = ticket.title?.toLowerCase().includes(searchLower) ||
                     ticket.content?.toLowerCase().includes(searchLower)

    // Check translations
    const translationMatch = ticket.about_dummy_tickets_translations?.some(trans =>
      trans.title?.toLowerCase().includes(searchLower) ||
      trans.content?.toLowerCase().includes(searchLower)
    )

    return mainMatch || translationMatch
  })

  // Handle list content management - updated for per-language support
  const addListItem = () => {
    const currentList = getCurrentListContent()
    setCurrentListContent([...currentList, ""])
  }

  const removeListItem = (index) => {
    const currentList = getCurrentListContent()
    const updatedList = currentList.filter((_, i) => i !== index)
    
    // Ensure we always have at least one item
    if (updatedList.length === 0) {
      updatedList.push('')
    }
    
    setCurrentListContent(updatedList)
  }

  const updateListItem = (index, value) => {
    const currentList = getCurrentListContent()
    const updatedList = [...currentList]
    updatedList[index] = value
    setCurrentListContent(updatedList)
  }

  const moveListItem = (index, direction) => {
    const currentList = getCurrentListContent()
    const newIndex = direction === 'up' ? index - 1 : index + 1

    if (newIndex >= 0 && newIndex < currentList.length) {
      const updatedList = [...currentList]
      ;[updatedList[index], updatedList[newIndex]] = [updatedList[newIndex], updatedList[index]]
      setCurrentListContent(updatedList)
    }
  }

  // Get next available sort order
  const getNextAvailableOrder = () => {
    if (!tickets || tickets.length === 0) return 1
    const maxOrder = Math.max(...tickets.map(ticket => ticket.sort_order || 0))
    return maxOrder + 1
  }

  // Handle opening add dialog
  const handleOpenAddDialog = () => {
    // Complete state reset to prevent contamination
    const initialTranslations = {}
    Object.keys(LOCALES).forEach(locale => {
      initialTranslations[locale] = {
        title: "",
        content: ""
      }
    })

    setFormData({
      status: "active",
      sort_order: getNextAvailableOrder(),
      content_type: "simple",
      translations: initialTranslations
    })
    setEditingCard(null)
    setSelectedCard(null)
    setShowAddDialog(true)
    setActiveTab(DEFAULT_LOCALE)
  }

  // Handle form submission - FAQ-style unified approach
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate that English translation is filled
      const englishTranslation = formData.translations[DEFAULT_LOCALE]
      if (!englishTranslation?.title || !englishTranslation?.content) {
        toast({
          title: "Validation Error",
          description: "English translation is required",
          variant: "destructive"
        })
        return
      }

      // Prepare content based on type
      let finalContent
      if (formData.content_type === 'list') {
        // For list type, parse content from English translation
        try {
          const items = JSON.parse(englishTranslation.content)
          if (!Array.isArray(items) || items.length === 0) {
            throw new Error('At least one list item is required')
          }
          finalContent = JSON.stringify(items.filter(item => item.trim()))
        } catch (e) {
          throw new Error('Invalid list format. Please provide valid JSON array.')
        }
      } else {
        finalContent = englishTranslation.content
      }

      // Create/update main dummy ticket
      const url = editingCard ? `/api/about/dummy-tickets/${editingCard.id}` : '/api/about/dummy-tickets'
      const method = editingCard ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: englishTranslation.title,
          content: finalContent,
          content_type: formData.content_type,
          status: formData.status,
          sort_order: formData.sort_order
        }),
      })

      const result = await response.json()

      if (response.ok) {
        const ticketId = editingCard?.id || result.ticket.id

        // Handle translations using the new batch endpoint
        const translationsToSave = Object.entries(formData.translations)
          .filter(([locale, translation]) =>
            translation.title && translation.content
          )
          .map(([locale, translation]) => ({
            locale,
            title: translation.title,
            content: translation.content
          }))

        if (translationsToSave.length > 0) {
          const batchResponse = await fetch(`/api/about/dummy-tickets/${ticketId}/translations/batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ translations: translationsToSave })
          })

          if (!batchResponse.ok) {
            console.error('Failed to save translations:', await batchResponse.text())
          }
        }

        await fetchTickets()
        setShowAddDialog(false)
        setShowEditDialog(false)
        resetForm()
        setSelectedCard(null)
        setEditingCard(null)

        toast({
          title: "Success!",
          description: `Dummy ticket ${editingCard ? 'updated' : 'created'} successfully`,
        })
      } else {
        console.error('Failed to save dummy ticket:', result.error)
        toast({
          title: "Error",
          description: result.error || "Failed to save dummy ticket. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error saving dummy ticket:', error)
      toast({
        title: "Error",
        description: error.message || "Network error occurred. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset form
  const resetForm = () => {
    const initialTranslations = {}
    Object.keys(LOCALES).forEach(locale => {
      initialTranslations[locale] = {
        title: "",
        content: ""
      }
    })
    setFormData({
      status: "active",
      sort_order: 1,
      content_type: "simple",
      translations: initialTranslations
    })
  }

  // Handle delete
  const handleDelete = async () => {
    if (!selectedCard) return

    try {
      const response = await fetch(`/api/about/dummy-tickets/${selectedCard.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (response.ok) {
        await fetchTickets()
        setShowDeleteDialog(false)
        setSelectedCard(null)
        toast({
          title: "Success",
          description: "Dummy ticket deleted successfully",
        })
      } else {
        console.error('Failed to delete dummy ticket:', result.error)
        toast({
          title: "Error",
          description: "Failed to delete dummy ticket. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting dummy ticket:', error)
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Toggle status
  const toggleStatus = async (ticket) => {
    try {
      const response = await fetch(`/api/about/dummy-tickets/${ticket.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...ticket,
          status: ticket.status === 'active' ? 'inactive' : 'active'
        }),
      })

      if (response.ok) {
        await fetchTickets()
        toast({
          title: "Success",
          description: `Dummy ticket ${ticket.status === 'active' ? 'deactivated' : 'activated'} successfully`,
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

  // Open edit dialog
  const openEditDialog = (ticket) => {
    setSelectedCard(ticket)
    setEditingCard(ticket)

    // Initialize translations with existing data - prioritize translations table
    const translations = {}
    Object.keys(LOCALES).forEach(locale => {
      const translation = ticket.about_dummy_tickets_translations?.find(t => t.locale === locale)

      // All languages now prioritize translations table, fallback to main table for English
      translations[locale] = {
        title: translation?.title || (locale === DEFAULT_LOCALE ? ticket.title : ""),
        content: translation?.content || (locale === DEFAULT_LOCALE ? ticket.content : "")
      }
    })

    setFormData({
      status: ticket.status,
      sort_order: ticket.sort_order,
      content_type: ticket.content_type || 'simple',
      translations
    })
    setShowEditDialog(true)
    setActiveTab(DEFAULT_LOCALE)
  }

  // Get translation completion status
  const getTranslationStatus = (ticket) => {
    const totalLocales = Object.keys(LOCALES).length

    // Count all translations including English (from translations table)
    const translatedLocales = ticket.about_dummy_tickets_translations?.length || 0

    // Check if English exists (either in main table or translations table)
    const englishTranslation = ticket.about_dummy_tickets_translations?.find(t => t.locale === DEFAULT_LOCALE)
    const englishExists = (ticket.title && ticket.content) || (englishTranslation?.title && englishTranslation?.content)

    // Calculate completion based on all languages
    const completion = englishExists ? Math.round((translatedLocales / totalLocales) * 100) : 0
    return completion
  }

  // Handle content type change
  const handleContentTypeChange = (contentType) => {
    setFormData({
      ...formData,
      content_type: contentType
    })

    // Initialize list content for current locale if switching to list type
    if (contentType === 'list') {
      // Check if current language already has list content
      const currentTranslation = formData.translations[activeTab]
      if (!currentTranslation?.content) {
        // Initialize empty list for this language
        setCurrentListContent([''])
      }
      // If content exists, getCurrentListContent() will handle it automatically
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-600" />
            Multi-Language Dummy Tickets Management
          </h1>
          <p className="text-gray-600">Manage dummy tickets content in multiple languages</p>
        </div>
        <Button
          onClick={handleOpenAddDialog}
          className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Dummy Ticket
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search dummy tickets in any language..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Dummy Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Dummy Tickets ({filteredTickets.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {/* Skeleton cards matching the actual content structure */}
              {Array.from({ length: 2 }).map((_, i) => (
                <SkeletonCard key={i}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {/* Title and Badges Skeleton */}
                        <div className="flex-1">
                          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                            <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </div>
                      </div>

                      {/* Content Preview Skeleton */}
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                        {i % 2 === 0 ? (
                          // List type skeleton
                          <div className="space-y-2">
                            {Array.from({ length: 2 }).map((_, j) => (
                              <div key={j} className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          // Text type skeleton
                          <div className="space-y-1">
                            <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons Skeleton */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <div className="h-9 w-10 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-9 w-10 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-9 w-10 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-9 w-10 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </SkeletonCard>
              ))}
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No dummy tickets found. {searchTerm ? 'Try a different search term.' : 'Create your first multi-language dummy ticket!'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket, index) => {
                const completion = getTranslationStatus(ticket)
                // Prioritize English from translations table, fallback to main table
                const englishTranslation = ticket.about_dummy_tickets_translations?.find(t => t.locale === DEFAULT_LOCALE)
                const displayTitle = englishTranslation?.title || ticket.title
                const displayContent = englishTranslation?.content || ticket.content

                return (
                  <div
                    key={ticket.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-semibold truncate text-gray-900">
                            {displayTitle}
                          </h3>
                          <Badge
                            variant={ticket.status === 'active' ? 'default' : 'secondary'}
                            className={
                              ticket.status === 'active'
                                ? 'bg-green-100 text-green-800 border-green-200'
                                : 'bg-gray-100 text-gray-800 border-gray-200'
                            }
                          >
                            {ticket.status}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={
                              ticket.content_type === 'list'
                                ? 'border-purple-200 text-purple-700 bg-purple-50'
                                : 'border-blue-200 text-blue-700 bg-blue-50'
                            }
                          >
                            {ticket.content_type === 'list' ? (
                              <>
                                <List className="w-3 h-3 mr-1" />
                                List
                              </>
                            ) : (
                              <>
                                <FileText className="w-3 h-3 mr-1" />
                                Text
                              </>
                            )}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">Translation:</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  completion === 100 ? 'bg-green-500' :
                                  completion >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${completion}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600">{completion}%</span>
                          </div>
                        </div>
                        <div className="text-gray-600 text-sm">
                          {ticket.content_type === 'list' ? (
                            renderListContent(displayContent) || (
                              <p className="line-clamp-2 text-gray-400 italic">
                                No list items configured
                              </p>
                            )
                          ) : (
                            <p className="line-clamp-2">{displayContent}</p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {ticket.about_dummy_tickets_translations?.map(trans => (
                            <Badge key={trans.locale} variant="outline" className="text-xs flex items-center gap-1">
                              <FlagIcon
                                src={LOCALES[trans.locale]?.flag}
                                alt={LOCALES[trans.locale]?.name}
                                countryCode={LOCALES[trans.locale]?.countryCode}
                                size={12}
                                className="shrink-0"
                              />
                              {trans.locale.toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Status toggle */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleStatus(ticket)}
                          className={ticket.status === 'active' ? 'text-green-600' : 'text-gray-600'}
                        >
                          {ticket.status === 'active' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>

                        {/* Edit */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(ticket)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        {/* Delete */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCard(ticket)
                            setShowDeleteDialog(true)
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dummy Ticket Dialog */}
      <Dialog open={showAddDialog || showEditDialog} onOpenChange={() => {
        setShowAddDialog(false)
        setShowEditDialog(false)
        resetForm()
      }}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              {editingCard ? 'Edit Multi-Language Dummy Ticket' : 'Add Multi-Language Dummy Ticket'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status and Sort Order */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div>
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Content Type */}
            <div>
              <Label>Content Type</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="content_type"
                    value="simple"
                    checked={formData.content_type === 'simple'}
                    onChange={() => handleContentTypeChange('simple')}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Simple Text</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="content_type"
                    value="list"
                    checked={formData.content_type === 'list'}
                    onChange={() => handleContentTypeChange('list')}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">List Items</span>
                </label>
              </div>
            </div>

            {/* Language Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 h-auto p-1">
                {Object.entries(LOCALES).map(([code, locale]) => (
                  <TabsTrigger
                    key={code}
                    value={code}
                    className="flex items-center gap-1 px-2 py-2 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <FlagIcon
                      src={locale.flag}
                      alt={locale.name}
                      countryCode={locale.countryCode}
                      size={16}
                      className="shrink-0"
                    />
                    <span className="hidden sm:inline text-xs font-medium">{locale.name}</span>
                    {formData.translations[code]?.title && formData.translations[code]?.content && (
                      <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.entries(LOCALES).map(([code, locale]) => (
                <TabsContent key={code} value={code} className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <FlagIcon
                      src={locale.flag}
                      alt={locale.name}
                      countryCode={locale.countryCode}
                      size={20}
                      className="shrink-0"
                    />
                    <span className="font-medium">{locale.name}</span>
                    {code === DEFAULT_LOCALE && (
                      <Badge variant="outline" className="ml-auto">
                        Required
                      </Badge>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={`title-${code}`}>
                      Title {code === DEFAULT_LOCALE && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      id={`title-${code}`}
                      value={formData.translations[code]?.title || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        translations: {
                          ...formData.translations,
                          [code]: {
                            ...formData.translations[code],
                            title: e.target.value
                          }
                        }
                      })}
                      placeholder={`Enter title in ${locale.name}`}
                      required={code === DEFAULT_LOCALE}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`content-${code}`}>
                      Content {code === DEFAULT_LOCALE && <span className="text-red-500">*</span>}
                    </Label>
                    {formData.content_type === 'list' ? (
                      <div className="border rounded-lg p-4 bg-gray-50 max-h-[40vh] overflow-y-auto">
                        {code === activeTab ? (
                          <div className="space-y-2">
                            {getCurrentListContent().map((item, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                                <Input
                                  value={item}
                                  onChange={(e) => updateListItem(index, e.target.value)}
                                  placeholder={`Step ${index + 1}`}
                                  className="flex-1"
                                />
                                <div className="flex gap-1">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => moveListItem(index, 'up')}
                                    disabled={index === 0}
                                    title="Move up"
                                  >
                                    <ChevronUp className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => moveListItem(index, 'down')}
                                    disabled={index === getCurrentListContent().length - 1}
                                    title="Move down"
                                  >
                                    <ChevronDown className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeListItem(index)}
                                    className="text-red-600 hover:text-red-700"
                                    title="Remove item"
                                    disabled={getCurrentListContent().length <= 1}
                                  >
                                    <MinusCircle className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              onClick={addListItem}
                              className="w-full"
                            >
                              <PlusCircle className="w-4 h-4 mr-2" />
                              Add Step
                            </Button>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            Switch to this language tab to edit list items
                          </div>
                        )}
                      </div>
                    ) : (
                      <Textarea
                        id={`content-${code}`}
                        value={formData.translations[code]?.content || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          translations: {
                            ...formData.translations,
                            [code]: {
                              ...formData.translations[code],
                              content: e.target.value
                            }
                          }
                        })}
                        placeholder={`Enter content in ${locale.name}`}
                        rows={5}
                        required={code === DEFAULT_LOCALE}
                      />
                    )}
                  </div>

                  {locale.direction === 'rtl' && (
                    <div className="flex items-center gap-2 p-2 bg-blue-50 text-blue-700 rounded text-sm">
                      <AlertCircle className="w-4 h-4" />
                      RTL layout will be applied for Arabic content
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => {
                setShowAddDialog(false)
                setShowEditDialog(false)
                resetForm()
              }}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : (editingCard ? 'Update Dummy Ticket' : 'Create Dummy Ticket')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Dummy Ticket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this dummy ticket? This action cannot be undone and will remove all translations.
              <br /><br />
              <strong>Title:</strong> {(() => {
                const card = selectedCard
                const englishTranslation = card?.about_dummy_tickets_translations?.find(t => t.locale === DEFAULT_LOCALE)
                return englishTranslation?.title || card?.title
              })()}
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
    </div>
  )
}
