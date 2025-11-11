"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, Eye, EyeOff, MoveUp, MoveDown, FolderPlus, FileText, ChevronDown, ChevronUp, GripVertical, Settings, Languages } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { TranslationTabs } from "@/components/admin/translation/TranslationTabs"
import { SectionTranslationForm } from "@/components/admin/translation/SectionTranslationForm"
import { ItemTranslationForm } from "@/components/admin/translation/ItemTranslationForm"

export function FAQPageManagement() {
  const { toast } = useToast()
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddSectionDialog, setShowAddSectionDialog] = useState(false)
  const [showEditSectionDialog, setShowEditSectionDialog] = useState(false)
  const [showAddItemDialog, setShowAddItemDialog] = useState(false)
  const [showEditItemDialog, setShowEditItemDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showSectionTranslationDialog, setShowSectionTranslationDialog] = useState(false)
  const [showItemTranslationDialog, setShowItemTranslationDialog] = useState(false)
  const [selectedSection, setSelectedSection] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [expandedSections, setExpandedSections] = useState(new Set())
  const [activeLocale, setActiveLocale] = useState('en')
  const [sectionTranslations, setSectionTranslations] = useState({})
  const [itemTranslations, setItemTranslations] = useState({})
  const [sectionTranslationData, setSectionTranslationData] = useState({})
  const [itemTranslationData, setItemTranslationData] = useState({})
  const [isBulkSaving, setIsBulkSaving] = useState(false)
  const [sectionFormData, setSectionFormData] = useState({
    title: "",
    icon: "",
    status: "active",
    sort_order: 0
  })
  const [itemFormData, setItemFormData] = useState({
    section_id: "",
    question: "",
    answer: "",
    status: "active",
    sort_order: 0
  })

  // Common icons for sections
  const availableIcons = [
    "HelpCircle", "Info", "FileText", "Settings", "Users", "ShoppingCart",
    "CreditCard", "Clock", "Globe", "MessageSquare", "Shield", "BookOpen",
    "CheckCircle", "AlertCircle", "Zap", "Package", "Truck", "Phone"
  ]

  // Fetch sections with items
  const fetchSections = async () => {
    try {
      const response = await fetch('/api/faq-page/sections?include_inactive=true')
      const result = await response.json()

      if (response.ok) {
        setSections(result.sections || [])
      } else {
        console.error('Failed to fetch FAQ page sections:', result.error)
      }
    } catch (error) {
      console.error('Error fetching FAQ page sections:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSections()
  }, [])

  // Filter sections based on search
  const filteredSections = sections.filter(section => {
    const searchLower = searchTerm.toLowerCase()

    // Check section title
    const titleMatch = section.title.toLowerCase().includes(searchLower)

    // Check items in section
    const itemsMatch = section.items.some(item =>
      item.question.toLowerCase().includes(searchLower) ||
      item.answer.toLowerCase().includes(searchLower)
    )

    return titleMatch || itemsMatch
  })

  // Toggle section expansion
  const toggleSectionExpansion = (sectionId) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  // Handle section form submission
  const handleSectionSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = selectedSection ? `/api/faq-page/sections/${selectedSection.id}` : '/api/faq-page/sections'
      const method = selectedSection ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sectionFormData),
      })

      const result = await response.json()

      if (response.ok) {
        await fetchSections()
        setShowAddSectionDialog(false)
        setShowEditSectionDialog(false)
        resetSectionForm()
        setSelectedSection(null)
        toast({
          title: "Success",
          description: `Section ${selectedSection ? 'updated' : 'created'} successfully`
        })
      } else {
        toast({
          title: "Error",
          description: `Failed to ${selectedSection ? 'update' : 'create'} section: ${result.error}`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error saving section:', error)
      toast({
        title: "Error",
        description: "Network error occurred. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Handle item form submission
  const handleItemSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = selectedItem ? `/api/faq-page/items/${selectedItem.id}` : '/api/faq-page/items'
      const method = selectedItem ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemFormData),
      })

      const result = await response.json()

      if (response.ok) {
        await fetchSections()
        setShowAddItemDialog(false)
        setShowEditItemDialog(false)
        resetItemForm()
        setSelectedItem(null)
        toast({
          title: "Success",
          description: `FAQ item ${selectedItem ? 'updated' : 'created'} successfully`
        })
      } else {
        toast({
          title: "Error",
          description: `Failed to ${selectedItem ? 'update' : 'create'} FAQ item: ${result.error}`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error saving FAQ item:', error)
      toast({
        title: "Error",
        description: "Network error occurred. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Handle delete
  const handleDelete = async () => {
    try {
      let url, type
      if (selectedSection) {
        url = `/api/faq-page/sections/${selectedSection.id}`
        type = 'section'
      } else if (selectedItem) {
        url = `/api/faq-page/items/${selectedItem.id}`
        type = 'item'
      } else {
        return
      }

      const response = await fetch(url, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (response.ok) {
        await fetchSections()
        setShowDeleteDialog(false)
        setSelectedSection(null)
        setSelectedItem(null)
        toast({
          title: "Success",
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`
        })
      } else {
        toast({
          title: "Error",
          description: `Failed to delete ${type}: ${result.error}`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting:', error)
      toast({
        title: "Error",
        description: "Network error occurred. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Reset forms
  const resetSectionForm = () => {
    setSectionFormData({
      title: "",
      icon: "",
      status: "active",
      sort_order: 0
    })
  }

  const resetItemForm = () => {
    setItemFormData({
      section_id: "",
      question: "",
      answer: "",
      status: "active",
      sort_order: 0
    })
  }

  // Open edit dialogs
  const openEditSectionDialog = (section) => {
    setSelectedSection(section)
    setSectionFormData({
      title: section.title,
      icon: section.icon || "",
      status: section.status,
      sort_order: section.sort_order
    })
    setShowEditSectionDialog(true)
  }

  const openEditItemDialog = (item, sectionId) => {
    setSelectedItem(item)
    setItemFormData({
      section_id: sectionId,
      question: item.question,
      answer: item.answer,
      status: item.status,
      sort_order: item.sort_order
    })
    setShowEditItemDialog(true)
  }

  const openAddItemDialog = (sectionId) => {
    setItemFormData({
      section_id: sectionId,
      question: "",
      answer: "",
      status: "active",
      sort_order: 0
    })
    setShowAddItemDialog(true)
  }

  // Translation dialog functions
  const openSectionTranslationDialog = async (section) => {
    setSelectedSection(section)
    setShowSectionTranslationDialog(true)
    setSectionTranslationData({}) // Clear previous data
    await fetchSectionTranslations(section.id)
  }

  const openItemTranslationDialog = async (item) => {
    setSelectedItem(item)
    setShowItemTranslationDialog(true)
    setItemTranslationData({}) // Clear previous data
    await fetchItemTranslations(item.id)
  }

  // Fetch translations
  const fetchSectionTranslations = async (sectionId) => {
    try {
      const response = await fetch(`/api/faq-page/sections/${sectionId}/translations`)
      const result = await response.json()

      if (response.ok) {
        const translations = {}
        result.translations?.forEach(t => {
          translations[t.locale] = t
        })
        setSectionTranslations(translations)
      }
    } catch (error) {
      console.error('Error fetching section translations:', error)
    }
  }

  const fetchItemTranslations = async (itemId) => {
    try {
      const response = await fetch(`/api/faq-page/items/${itemId}/translations`)
      const result = await response.json()

      if (response.ok) {
        const translations = {}
        result.translations?.forEach(t => {
          translations[t.locale] = t
        })
        setItemTranslations(translations)
      }
    } catch (error) {
      console.error('Error fetching item translations:', error)
    }
  }

  // Handle translation changes
  const handleSectionTranslationChange = (translationData) => {
    setSectionTranslations(prev => ({
      ...prev,
      [translationData.locale]: {
        ...prev[translationData.locale],
        title: translationData.title
      }
    }))
  }

  const handleItemTranslationChange = (translationData) => {
    setItemTranslations(prev => ({
      ...prev,
      [translationData.locale]: {
        ...prev[translationData.locale],
        question: translationData.question,
        answer: translationData.answer
      }
    }))
  }

  // Handle translation data changes for bulk saving
  const handleSectionDataChange = (data) => {
    setSectionTranslationData(prev => ({
      ...prev,
      [data.locale]: {
        locale: data.locale,
        title: data.title,
        hasContent: data.hasContent
      }
    }))
  }

  const handleItemDataChange = (data) => {
    setItemTranslationData(prev => ({
      ...prev,
      [data.locale]: {
        locale: data.locale,
        question: data.question,
        answer: data.answer,
        hasContent: data.hasContent
      }
    }))
  }

  // Bulk save functions
  const bulkSaveSectionTranslations = async () => {
    if (!selectedSection || Object.keys(sectionTranslationData).length === 0) return

    setIsBulkSaving(true)
    try {
      const translationsToSave = Object.values(sectionTranslationData).filter(data => data.hasContent)

      if (translationsToSave.length === 0) {
        toast({
          title: "No translations to save",
          description: "Please enter some content before saving.",
          variant: "destructive"
        })
        return
      }

      const response = await fetch(`/api/faq-page/sections/${selectedSection.id}/translations/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          translations: translationsToSave
        }),
      })

      const result = await response.json()

      if (response.ok) {
        // Show success toast
        toast({
          title: "Translations saved successfully!",
          description: result.message || `Saved ${result.summary?.success || 0} translations for this section.`,
        })

        // Close the modal
        setShowSectionTranslationDialog(false)
        setSelectedSection(null)
        setSectionTranslations({})
        setSectionTranslationData({})
        setActiveLocale('en')

        // Refresh sections data to show updated translations
        await fetchSections()
      } else {
        toast({
          title: "Failed to save translations",
          description: result.error || "An error occurred while saving translations.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error in bulk save:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving translations.",
        variant: "destructive"
      })
    } finally {
      setIsBulkSaving(false)
    }
  }

  const bulkSaveItemTranslations = async () => {
    if (!selectedItem || Object.keys(itemTranslationData).length === 0) return

    setIsBulkSaving(true)
    try {
      const translationsToSave = Object.values(itemTranslationData).filter(data => data.hasContent)

      if (translationsToSave.length === 0) {
        toast({
          title: "No translations to save",
          description: "Please enter some content before saving.",
          variant: "destructive"
        })
        return
      }

      const response = await fetch(`/api/faq-page/items/${selectedItem.id}/translations/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          translations: translationsToSave
        }),
      })

      const result = await response.json()

      if (response.ok) {
        // Show success toast
        toast({
          title: "Translations saved successfully!",
          description: result.message || `Saved ${result.summary?.success || 0} translations for this FAQ item.`,
        })

        // Close the modal
        setShowItemTranslationDialog(false)
        setSelectedItem(null)
        setItemTranslations({})
        setItemTranslationData({})
        setActiveLocale('en')

        // Refresh sections data to show updated translations
        await fetchSections()
      } else {
        toast({
          title: "Failed to save translations",
          description: result.error || "An error occurred while saving translations.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error in bulk save:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving translations.",
        variant: "destructive"
      })
    } finally {
      setIsBulkSaving(false)
    }
  }

  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FAQ Page Management</h1>
          <p className="text-gray-600">Manage FAQ sections and items for the public FAQ page</p>
        </div>
        <Button
          onClick={() => setShowAddSectionDialog(true)}
          className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white"
        >
          <FolderPlus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search sections and FAQ items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* FAQ Sections */}
      <Card>
        <CardHeader>
          <CardTitle>FAQ Sections ({filteredSections.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading FAQ sections...</div>
          ) : filteredSections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No FAQ sections found. {searchTerm ? 'Try a different search term.' : 'Create your first FAQ section!'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSections.map((section, index) => {
                const IconComponent = getIconByName(section.icon)
                const isExpanded = expandedSections.has(section.id)

                return (
                  <div
                    key={section.id}
                    className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Section Header */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
                      <div className="flex items-center gap-3 flex-1">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <IconComponent className="w-5 h-5 text-blue-600" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{section.title}</h3>
                            <Badge
                              variant={section.status === 'active' ? 'default' : 'secondary'}
                              className={
                                section.status === 'active'
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : 'bg-gray-100 text-gray-800 border-gray-200'
                              }
                            >
                              {section.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {section.items?.length || 0} FAQ items
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Expand/Collapse */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSectionExpansion(section.id)}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>

                        {/* Section Actions */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditSectionDialog(section)}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openSectionTranslationDialog(section)}
                        >
                          <Languages className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSection(section)
                            setSelectedItem(null)
                            setShowDeleteDialog(true)
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* FAQ Items */}
                    {isExpanded && (
                      <div className="p-4 space-y-3">
                        {section.items && section.items.length > 0 ? (
                          section.items.map((item, itemIndex) => (
                            <div
                              key={item.id}
                              className="flex items-start gap-3 p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow"
                            >
                              <GripVertical className="w-4 h-4 text-gray-400 mt-1" />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 mb-1">{item.question}</h4>
                                <p className="text-sm text-gray-600 line-clamp-2">{item.answer}</p>
                                <div className="mt-2 flex items-center gap-2">
                                  <Badge
                                    variant={item.status === 'active' ? 'default' : 'secondary'}
                                    className={
                                      item.status === 'active'
                                        ? 'bg-green-100 text-green-800 border-green-200 text-xs'
                                        : 'bg-gray-100 text-gray-800 border-gray-200 text-xs'
                                    }
                                  >
                                    {item.status}
                                  </Badge>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditItemDialog(item, section.id)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openItemTranslationDialog(item)}
                                >
                                  <Languages className="w-4 h-4" />
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedItem(item)
                                    setSelectedSection(null)
                                    setShowDeleteDialog(true)
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            No FAQ items in this section.
                          </div>
                        )}

                        {/* Add Item Button */}
                        <Button
                          variant="dashed"
                          size="sm"
                          onClick={() => openAddItemDialog(section.id)}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add FAQ Item
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Section Dialog */}
      <Dialog open={showAddSectionDialog || showEditSectionDialog} onOpenChange={() => {
        setShowAddSectionDialog(false)
        setShowEditSectionDialog(false)
        resetSectionForm()
        setSelectedSection(null)
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedSection ? 'Edit FAQ Section' : 'Add FAQ Section'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSectionSubmit} className="space-y-4">
            <div>
              <Label htmlFor="section-title">Section Title</Label>
              <Input
                id="section-title"
                value={sectionFormData.title}
                onChange={(e) => setSectionFormData({ ...sectionFormData, title: e.target.value })}
                placeholder="Enter section title"
                required
              />
            </div>

            <div>
              <Label htmlFor="section-icon">Icon</Label>
              <select
                id="section-icon"
                value={sectionFormData.icon}
                onChange={(e) => setSectionFormData({ ...sectionFormData, icon: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select an icon</option>
                {availableIcons.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="section-status"
                checked={sectionFormData.status === 'active'}
                onCheckedChange={(checked) =>
                  setSectionFormData({ ...sectionFormData, status: checked ? 'active' : 'inactive' })
                }
              />
              <Label htmlFor="section-status">Active (visible on website)</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => {
                setShowAddSectionDialog(false)
                setShowEditSectionDialog(false)
                resetSectionForm()
              }}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white">
                {selectedSection ? 'Update Section' : 'Create Section'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Item Dialog */}
      <Dialog open={showAddItemDialog || showEditItemDialog} onOpenChange={() => {
        setShowAddItemDialog(false)
        setShowEditItemDialog(false)
        resetItemForm()
        setSelectedItem(null)
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? 'Edit FAQ Item' : 'Add FAQ Item'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleItemSubmit} className="space-y-4">
            <div>
              <Label htmlFor="item-question">Question</Label>
              <Input
                id="item-question"
                value={itemFormData.question}
                onChange={(e) => setItemFormData({ ...itemFormData, question: e.target.value })}
                placeholder="Enter the question"
                required
              />
            </div>

            <div>
              <Label htmlFor="item-answer">Answer</Label>
              <Textarea
                id="item-answer"
                value={itemFormData.answer}
                onChange={(e) => setItemFormData({ ...itemFormData, answer: e.target.value })}
                placeholder="Enter the answer"
                rows={4}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="item-status"
                checked={itemFormData.status === 'active'}
                onCheckedChange={(checked) =>
                  setItemFormData({ ...itemFormData, status: checked ? 'active' : 'inactive' })
                }
              />
              <Label htmlFor="item-status">Active (visible on website)</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => {
                setShowAddItemDialog(false)
                setShowEditItemDialog(false)
                resetItemForm()
              }}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white">
                {selectedItem ? 'Update Item' : 'Create Item'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedSection ? 'Section' : 'FAQ Item'}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {selectedSection ? 'section and all its FAQ items' : 'FAQ item'}?
              This action cannot be undone.
              <br /><br />
              {selectedSection && (
                <>
                  <strong>Section:</strong> {selectedSection.title}
                </>
              )}
              {selectedItem && (
                <>
                  <strong>Question:</strong> {selectedItem.question}
                </>
              )}
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

      {/* Section Translation Dialog */}
      <Dialog open={showSectionTranslationDialog} onOpenChange={(open) => {
        setShowSectionTranslationDialog(open)
        if (!open) {
          setSelectedSection(null)
          setSectionTranslations({})
          setSectionTranslationData({})
          setActiveLocale('en')
        }
      }}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                Translate Section: {selectedSection?.title}
              </DialogTitle>
              <Button
                onClick={bulkSaveSectionTranslations}
                disabled={isBulkSaving || Object.keys(sectionTranslationData).length === 0}
                className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white"
              >
                {isBulkSaving ? 'Saving...' : 'Save All Translations'}
              </Button>
            </div>
          </DialogHeader>

          <TranslationTabs
            activeLocale={activeLocale}
            onLocaleChange={setActiveLocale}
          >
            {({ locale, localeName, isDefault }) => (
              <div data-locale={locale}>
                <SectionTranslationForm
                  sectionId={selectedSection?.id}
                  locale={locale}
                  localeName={localeName}
                  isDefault={isDefault}
                  initialTitle={sectionTranslations[locale]?.title || (isDefault ? selectedSection?.title : '')}
                  currentTranslationData={sectionTranslationData}
                  onDataChange={handleSectionDataChange}
                />
              </div>
            )}
          </TranslationTabs>
        </DialogContent>
      </Dialog>

      {/* Item Translation Dialog */}
      <Dialog open={showItemTranslationDialog} onOpenChange={(open) => {
        setShowItemTranslationDialog(open)
        if (!open) {
          setSelectedItem(null)
          setItemTranslations({})
          setItemTranslationData({})
          setActiveLocale('en')
        }
      }}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                Translate FAQ Item: {selectedItem?.question}
              </DialogTitle>
              <Button
                onClick={bulkSaveItemTranslations}
                disabled={isBulkSaving || Object.keys(itemTranslationData).length === 0}
                className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white"
              >
                {isBulkSaving ? 'Saving...' : 'Save All Translations'}
              </Button>
            </div>
          </DialogHeader>

          <TranslationTabs
            activeLocale={activeLocale}
            onLocaleChange={setActiveLocale}
          >
            {({ locale, localeName, isDefault }) => (
              <div data-locale={locale}>
                <ItemTranslationForm
                  itemId={selectedItem?.id}
                  locale={locale}
                  localeName={localeName}
                  isDefault={isDefault}
                  initialQuestion={itemTranslations[locale]?.question || (isDefault ? selectedItem?.question : '')}
                  initialAnswer={itemTranslations[locale]?.answer || (isDefault ? selectedItem?.answer : '')}
                  currentTranslationData={itemTranslationData}
                  onDataChange={handleItemDataChange}
                />
              </div>
            )}
          </TranslationTabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper function to get Lucide icon by name
function getIconByName(iconName) {
  const icons = {
    HelpCircle: require("lucide-react").HelpCircle,
    Info: require("lucide-react").Info,
    FileText: require("lucide-react").FileText,
    Settings: require("lucide-react").Settings,
    Users: require("lucide-react").Users,
    ShoppingCart: require("lucide-react").ShoppingCart,
    CreditCard: require("lucide-react").CreditCard,
    Clock: require("lucide-react").Clock,
    Globe: require("lucide-react").Globe,
    MessageSquare: require("lucide-react").MessageSquare,
    Shield: require("lucide-react").Shield,
    BookOpen: require("lucide-react").BookOpen,
    CheckCircle: require("lucide-react").CheckCircle,
    AlertCircle: require("lucide-react").AlertCircle,
    Zap: require("lucide-react").Zap,
    Package: require("lucide-react").Package,
    Truck: require("lucide-react").Truck,
    Phone: require("lucide-react").Phone,
  }

  return icons[iconName] || icons.HelpCircle
}