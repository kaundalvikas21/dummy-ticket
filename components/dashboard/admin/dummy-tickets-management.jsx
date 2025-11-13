"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, Eye, EyeOff, FileCheck, CheckCircle2, Globe, Languages, List, ListOrdered, GripVertical, PlusCircle, MinusCircle, ChevronUp, ChevronDown, ChevronRight, FileText } from "lucide-react"
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


export function DummyTicketsManagement() {
  const { toast } = useToast()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showTranslationsDialog, setShowTranslationsDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [editingCard, setEditingCard] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    content_type: "simple",
    status: "active",
    sort_order: 1,
    translations: {}
  })
  const [listContent, setListContent] = useState([])
  const [translationLocale, setTranslationLocale] = useState('en')
  const [isSavingTranslations, setIsSavingTranslations] = useState(false)

  
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
  const filteredTickets = tickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle list content management
  const addListItem = () => {
    setListContent([...listContent, ""])
  }

  const removeListItem = (index) => {
    setListContent(listContent.filter((_, i) => i !== index))
  }

  const updateListItem = (index, value) => {
    const updatedList = [...listContent]
    updatedList[index] = value
    setListContent(updatedList)
  }

  const moveListItem = (index, direction) => {
    const newList = [...listContent]
    const newIndex = direction === 'up' ? index - 1 : index + 1

    if (newIndex >= 0 && newIndex < newList.length) {
      [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]]
      setListContent(newList)
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
    setFormData({
      title: "",
      content: "",
      content_type: "simple",
      status: "active",
      sort_order: getNextAvailableOrder(),
      translations: {}
    })
    setListContent([]) // Critical: Reset list content completely
    setEditingCard(null) // Ensure no editing state
    setSelectedCard(null) // Ensure no selection state
    setShowAddDialog(true)
  }

  // Handle form submission - FIXED: Enhanced state isolation
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form data before submission
      if (!formData.title?.trim()) {
        throw new Error('Title is required')
      }

      // Prepare content based on type with proper validation
      let finalContent
      if (formData.content_type === 'list') {
        const filteredListContent = listContent.filter(item => item.trim() !== '')
        if (filteredListContent.length === 0) {
          throw new Error('At least one list item is required for list content type')
        }
        finalContent = JSON.stringify(filteredListContent)
      } else {
        if (!formData.content?.trim()) {
          throw new Error('Content is required for simple text content type')
        }
        finalContent = formData.content.trim()
      }

      // Create clean submission data without translation state
      const submitData = {
        title: formData.title.trim(),
        content: finalContent,
        content_type: formData.content_type,
        status: formData.status || 'active',
        sort_order: parseInt(formData.sort_order) || 1
      }

      const url = editingCard ? `/api/about/dummy-tickets/${editingCard.id}` : '/api/about/dummy-tickets'
      const method = editingCard ? 'PUT' : 'POST'

      const savingToast = toast({
        title: "Saving...",
        description: `Please wait while we ${editingCard ? 'update' : 'create'} the dummy ticket content.`,
      })

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      const result = await response.json()

      savingToast.dismiss()

      if (response.ok) {
        await fetchTickets()

        // Comprehensive state cleanup after successful operation
        setShowAddDialog(false)
        setShowEditDialog(false)
        setFormData({
          title: "",
          content: "",
          content_type: "simple",
          status: "active",
          sort_order: 1,
          translations: {}
        })
        setListContent([])
        setEditingCard(null)
        setSelectedCard(null) // Also clear selected card state

        toast({
          title: "✅ Success!",
          description: `Dummy ticket content ${editingCard ? 'updated' : 'created'} successfully`,
        })
      } else {
        console.error('Failed to save dummy ticket:', result.error)
        toast({
          title: "❌ Error",
          description: result.error || "Failed to save dummy ticket. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error saving dummy ticket:', error)
      toast({
        title: "❌ Error",
        description: error.message || "Network error occurred. Please check your connection and try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
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
    // Clean state reset before loading new ticket data
    setEditingCard(ticket)
    setSelectedCard(null) // Clear selection state
    setShowTranslationsDialog(false) // Ensure translation dialog is closed

    // Parse content if it's a list type
    let parsedContent = ""
    let parsedListContent = []

    if (ticket.content_type === 'list') {
      try {
        parsedListContent = JSON.parse(ticket.content || "[]")
        if (Array.isArray(parsedListContent)) {
          setListContent(parsedListContent.filter(item => item.trim())) // Clean up empty items
        } else {
          setListContent([]) // Ensure clean state
        }
      } catch (e) {
        // Fallback: treat as simple content
        parsedContent = ticket.content || ""
        setListContent([]) // Ensure clean state on parsing error
      }
    } else {
      parsedContent = ticket.content || ""
      setListContent([]) // Critical: Always reset list content for simple type
    }

    // Load clean form data with proper isolation
    setFormData({
      title: ticket.title || "",
      content: parsedContent,
      content_type: ticket.content_type || 'simple',
      status: ticket.status || 'active',
      sort_order: ticket.sort_order || 1,
      translations: {} // Start with clean translations state
    })
    setShowEditDialog(true)
  }

  // Open translations dialog
  const openTranslationsDialog = async (ticket) => {
    setSelectedCard(ticket)
    setTranslationLocale('en')

    // Initialize formData with empty translations
    const initialTranslations = {}
    Object.keys(LOCALES).forEach(locale => {
      initialTranslations[locale] = {
        title: '',
        content: ''
      }
    })

    try {
      // Load existing translations
      const response = await fetch(`/api/about/dummy-tickets/translations?ticket_id=${ticket.id}`)
      const result = await response.json()

      if (response.ok && result.translations) {
        result.translations.forEach(translation => {
          if (initialTranslations[translation.locale]) {
            initialTranslations[translation.locale] = {
              title: translation.title || '',
              content: translation.content || ''
            }
          }
        })
      }

      // Set default (English) content if no translation exists
      if (!initialTranslations[DEFAULT_LOCALE].title && !initialTranslations[DEFAULT_LOCALE].content) {
        initialTranslations[DEFAULT_LOCALE] = {
          title: ticket.title || '',
          content: ticket.content || ''
        }
      }
    } catch (error) {
      console.error('Error loading translations:', error)
      // Set default content on error
      initialTranslations[DEFAULT_LOCALE] = {
        title: ticket.title || '',
        content: ticket.content || ''
      }
    }

    setFormData(prev => ({
      ...prev,
      translations: initialTranslations
    }))

    setShowTranslationsDialog(true)
  }

  // New bulk translation functions - FIXED: Removed bidirectional contamination
  const updateTranslationTitle = (locale, title) => {
    // Only update translation state, never modify main ticket data
    setFormData(prev => ({
      ...prev,
      translations: {
        ...(prev.translations || {}),
        [locale]: {
          ...(prev.translations?.[locale] || {}),
          title: title
        }
      }
    }))

    // REMOVED: Real-time update that was causing contamination
    // Translation edits should only affect translation state, not main ticket data
  }

  const updateTranslationContent = (locale, content) => {
    // Only update translation state, never modify main ticket data
    setFormData(prev => ({
      ...prev,
      translations: {
        ...(prev.translations || {}),
        [locale]: {
          ...(prev.translations?.[locale] || {}),
          content: content
        }
      }
    }))

    // REMOVED: Real-time update that was causing contamination
    // Translation edits should only affect translation state, not main ticket data
  }

  const getTranslationListItems = (locale) => {
    const translation = formData.translations?.[locale]
    if (!translation || !translation.content) {
      return [''] // Default to one empty item for new translations
    }

    try {
      const parsed = JSON.parse(translation.content)
      return Array.isArray(parsed) ? parsed : [translation.content]
    } catch (e) {
      // If it's not valid JSON, treat as single line items split by newline
      return translation.content.split('\n').filter(item => item.trim())
    }
  }

  const updateTranslationListItem = (locale, index, value) => {
    const items = getTranslationListItems(locale)
    items[index] = value
    updateTranslationContent(locale, JSON.stringify(items.filter(item => item.trim())))
  }

  const addTranslationListItem = (locale) => {
    const items = getTranslationListItems(locale)
    items.push('')
    updateTranslationContent(locale, JSON.stringify(items))
  }

  const removeTranslationListItem = (locale, index) => {
    const items = getTranslationListItems(locale)
    if (items.length > 1) {
      items.splice(index, 1)
      updateTranslationContent(locale, JSON.stringify(items))
    }
  }

  const handleSaveAllTranslations = async () => {
    if (!selectedCard && !editingCard) return

    const ticket = selectedCard || editingCard
    const translationsToSave = []

    // Check if English (DEFAULT_LOCALE) translation is filled
    const englishTranslation = formData.translations[DEFAULT_LOCALE]
    if (!englishTranslation || (!englishTranslation.title?.trim() && !englishTranslation.content?.trim())) {
      toast({
        title: "Required",
        description: "English translation title or content is required",
        variant: "destructive"
      })
      return
    }

    // Prepare translations for all languages
    Object.entries(LOCALES).forEach(([code, locale]) => {
      const translation = formData.translations[code]
      if (translation && (translation.title?.trim() || translation.content?.trim())) {
        translationsToSave.push({
          ticket_id: ticket.id,
          locale: code,
          title: translation.title?.trim() || '',
          content: translation.content?.trim() || ''
        })
      }
    })

    setIsSavingTranslations(true)

    try {
      const savePromises = translationsToSave.map(async (translation) => {
        const response = await fetch('/api/about/dummy-tickets/translations', {
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
        await fetchTickets() // Refresh the data
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">     
              What Are Dummy Tickets Management
            </h1>
            <p className="text-gray-600 mt-2">Manage content for the "What Are Dummy Tickets" section.</p>
          </div>
          <Button
            onClick={handleOpenAddDialog}
            className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white shadow-lg hover:shadow-xl transition-all duration-200"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Content
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search by title or content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Content List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#0066FF]" />
              All Content ({filteredTickets.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066FF] mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading content...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-8">
              <FileCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No content found' : 'No content created yet'}
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? `No content matches your search for "${searchTerm}".`
                  : 'Get started by creating your first content item.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket, index) => (
                <div
                  key={ticket.id}
                  className="border rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-[#0066FF]/30"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#0066FF] to-[#00D4AA] shadow-lg">
                          <FileCheck className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg">{ticket.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={ticket.status === 'active' ? 'default' : 'secondary'}
                              className={
                                ticket.status === 'active'
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : 'bg-gray-100 text-gray-800 border-gray-200'
                              }
                            >
                              {ticket.status === 'active' ? 'Active' : 'Inactive'}
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
                                  Simple Text
                                </>
                              )}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              Order: {ticket.sort_order}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">Content Preview:</div>
                        {ticket.content_type === 'list' ? (
                          <div className="text-sm text-gray-800">
                            {(() => {
                              try {
                                const items = JSON.parse(ticket.content)
                                return (
                                  <ul className="space-y-1">
                                    {items.slice(0, 3).map((item, i) => (
                                      <li key={i} className="flex items-center gap-2">
                                        <ChevronRight className="w-3 h-3 text-[#0066FF]" />
                                        <span className="truncate">{item}</span>
                                      </li>
                                    ))}
                                    {items.length > 3 && (
                                      <li className="text-gray-500 italic">
                                        ...and {items.length - 3} more items
                                      </li>
                                    )}
                                  </ul>
                                )
                              } catch (e) {
                                return (
                                  <div className="line-clamp-2 text-gray-600">
                                    {ticket.content.substring(0, 100)}...
                                  </div>
                                )
                              }
                            })()}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-800 line-clamp-2">
                            {ticket.content}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      {/* Status toggle */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleStatus(ticket)}
                        className={`${
                          ticket.status === 'active'
                            ? 'text-green-600 border-green-200 hover:bg-green-50'
                            : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                        } transition-all duration-200`}
                        title={ticket.status === 'active' ? 'Hide from website' : 'Show on website'}
                      >
                        {ticket.status === 'active' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>

                      {/* Translations */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openTranslationsDialog(ticket)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50 transition-all duration-200"
                        title="Manage Translations"
                      >
                        <Languages className="w-4 h-4" />
                      </Button>

                      {/* Edit */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(ticket)}
                        className="text-orange-600 border-orange-200 hover:bg-orange-50 transition-all duration-200"
                        title="Edit Content"
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
                        className="text-red-600 border-red-200 hover:bg-red-50 transition-all duration-200"
                        title="Delete Content"
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

      {/* Add Content Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Content</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
  
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter the title"
                required
              />
            </div>

            <div>
              <Label htmlFor="content_type">Content Type</Label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="content_type"
                    value="simple"
                    checked={formData.content_type === 'simple'}
                    onChange={(e) => {
                      // Clean state transition to simple type
                      setFormData({
                        ...formData,
                        content_type: 'simple',
                        content: '', // Clear simple content
                        translations: formData.translations || {} // Preserve translations
                      })
                      setListContent([]) // Always clear list content when switching to simple
                    }}
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
                    onChange={(e) => {
                      // Clean state transition to list type
                      setFormData({
                        ...formData,
                        content_type: 'list',
                        content: '', // Clear simple content
                        translations: formData.translations || {} // Preserve translations
                      })
                      // Always initialize with clean list content to prevent contamination
                      setListContent(['']) // Start with one empty list item
                    }}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">List Items</span>
                </label>
              </div>
            </div>

            {/* Simple Content - Textarea */}
            {formData.content_type === 'simple' && (
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter the content"
                  rows={6}
                  required
                />
              </div>
            )}

            {/* List Content - Dynamic List Manager */}
            {formData.content_type === 'list' && (
              <div>
                <Label>Steps Content</Label>
                <div className="space-y-2 border rounded-lg p-4 bg-gray-50 max-h-[40vh] overflow-y-auto">
                  {listContent.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No steps added. Click "Add Step" to add your first step.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {listContent.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                          <Input
                            value={item}
                            onChange={(e) => updateListItem(index, e.target.value)}
                            placeholder={`Step ${index + 1}`}
                            className="flex-1"
                          />
                          <div className="flex flex-col gap-1">
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
                              disabled={index === listContent.length - 1}
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
                              title="Remove step"
                            >
                              <MinusCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
              </div>
            )}

            <div>
              <Label htmlFor="sort-order">Display Order</Label>
              <Input
                id="sort-order"
                type="number"
                min="1"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 1 })}
                placeholder="Enter display order"
                required
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
                    <Plus className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Content
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Content Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
    
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter the title"
                required
              />
            </div>

            {/* Content Type Selection */}
            <div>
              <Label>Content Type</Label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="edit-content_type"
                    value="simple"
                    checked={formData.content_type === 'simple'}
                    onChange={(e) => {
                      // Clean state transition to simple type in edit
                      setFormData({
                        ...formData,
                        content_type: 'simple',
                        content: '', // Clear simple content for fresh input
                        translations: formData.translations || {} // Preserve translations
                      })
                      setListContent([]) // Always clear list content when switching to simple
                    }}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Simple Text</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="edit-content_type"
                    value="list"
                    checked={formData.content_type === 'list'}
                    onChange={(e) => {
                      // Clean state transition to list type in edit
                      setFormData({
                        ...formData,
                        content_type: 'list',
                        content: '', // Clear simple content
                        translations: formData.translations || {} // Preserve translations
                      })
                      // Initialize with clean list content for edit mode
                      setListContent(['']) // Start fresh with one empty list item
                    }}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">List Items</span>
                </label>
              </div>
            </div>

            {/* Simple Content - Textarea */}
            {formData.content_type === 'simple' && (
              <div>
                <Label htmlFor="edit-content">Content</Label>
                <Textarea
                  id="edit-content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter the content"
                  rows={6}
                  required
                />
              </div>
            )}

            {/* List Content - Dynamic List Manager */}
            {formData.content_type === 'list' && (
              <div>
                <Label>Steps Content</Label>
                <div className="space-y-2 border rounded-lg p-4 bg-gray-50 max-h-[40vh] overflow-y-auto">
                  {listContent.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No steps added. Click "Add Step" to add your first step.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {listContent.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                          <Input
                            value={item}
                            onChange={(e) => updateListItem(index, e.target.value)}
                            placeholder={`Step ${index + 1}`}
                            className="flex-1"
                          />
                          <div className="flex flex-col gap-1">
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
                              disabled={index === listContent.length - 1}
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
                              title="Remove step"
                            >
                              <MinusCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
              </div>
            )}

            <div>
              <Label htmlFor="edit-sort-order">Display Order</Label>
              <Input
                id="edit-sort-order"
                type="number"
                min="1"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 1 })}
                placeholder="Enter display order"
                required
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
                    <Edit className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Update Content
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Translations Dialog */}
      <Dialog open={showTranslationsDialog} onOpenChange={setShowTranslationsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Translations for "{selectedCard?.title || editingCard?.title}"
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

                  {/* Translation Title */}
                  <div className="mb-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      Title
                    </Label>
                    <Input
                      value={formData.translations?.[code]?.title || ''}
                      onChange={(e) => updateTranslationTitle(code, e.target.value)}
                      placeholder="Enter title"
                      className="mt-1"
                      required={code === DEFAULT_LOCALE}
                      disabled={code === DEFAULT_LOCALE}
                    />
                  </div>

                  {/* Translation Content - Dynamic based on content type */}
                  {((selectedCard || editingCard)?.content_type === 'list') ? (
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-2">
                        List Items
                        {code === DEFAULT_LOCALE && <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Edit from main ticket</span>}
                      </Label>
                      {getTranslationListItems(code).map((item, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-gray-500 w-8">{index + 1}.</span>
                          <Input
                            value={item}
                            onChange={(e) => updateTranslationListItem(code, index, e.target.value)}
                            placeholder={`Enter list item ${index + 1}`}
                            className="flex-1"
                            disabled={code === DEFAULT_LOCALE}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeTranslationListItem(code, index)}
                            disabled={getTranslationListItems(code).length <= 1 || code === DEFAULT_LOCALE}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addTranslationListItem(code)}
                        className="mt-2"
                        disabled={code === DEFAULT_LOCALE}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-2">
                        Content
                      </Label>
                      <Textarea
                        value={formData.translations?.[code]?.content || ''}
                        onChange={(e) => updateTranslationContent(code, e.target.value)}
                        placeholder="Enter content"
                        rows={6}
                        className="mt-1"
                        required={code === DEFAULT_LOCALE}
                        disabled={code === DEFAULT_LOCALE}
                      />
                    </div>
                  )}
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
                  <Globe className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 mr-2" />
                  Save All Translations
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Content</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this content? This action cannot be undone.
              <br /><br />
              <strong>Title:</strong> {selectedCard?.title}
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