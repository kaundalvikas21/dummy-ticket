"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, Eye, EyeOff, MoveUp, MoveDown, FolderPlus, FileText, ChevronDown, ChevronUp, GripVertical, Settings, Languages, AlertCircle, RefreshCw } from "lucide-react"
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
import { apiClient } from "@/lib/api-client"
import { TranslationTabs } from "@/components/admin/translation/TranslationTabs"
import { LOCALES, DEFAULT_LOCALE } from "@/lib/locales"
import { FlagIcon } from "@/components/ui/flag-icon"
import { Check } from "lucide-react"

export function FAQPageManagement() {
  const { toast } = useToast()
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddSectionDialog, setShowAddSectionDialog] = useState(false)
  const [showEditSectionDialog, setShowEditSectionDialog] = useState(false)
  const [showAddItemDialog, setShowAddItemDialog] = useState(false)
  const [showEditItemDialog, setShowEditItemDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedSection, setSelectedSection] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [expandedSections, setExpandedSections] = useState(new Set())
  const [activeTab, setActiveTab] = useState(DEFAULT_LOCALE)
  const [sectionFormData, setSectionFormData] = useState({
    title: "",
    icon: "",
    status: "active",
    sort_order: 0,
    translations: Object.keys(LOCALES).reduce((acc, locale) => {
      acc[locale] = { title: "" }
      return acc
    }, {})
  })
  const [itemFormData, setItemFormData] = useState({
    section_id: "",
    question: "",
    answer: "",
    status: "active",
    sort_order: 0,
    translations: Object.keys(LOCALES).reduce((acc, locale) => {
      acc[locale] = { question: "", answer: "" }
      return acc
    }, {})
  })

  // Common icons for sections
  const availableIcons = [
    "HelpCircle", "Info", "FileText", "Settings", "Users", "ShoppingCart",
    "CreditCard", "Clock", "Globe", "MessageSquare", "Shield", "BookOpen",
    "CheckCircle", "AlertCircle", "Zap", "Package", "Truck", "Phone"
  ]

  // Automatic sort order detection helper functions
  const getNextSectionSortOrder = () => {
    if (sections.length === 0) return 0
    const maxOrder = Math.max(...sections.map(s => s.sort_order || 0))
    return maxOrder + 1
  }

  const getNextItemSortOrder = (sectionId) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section?.items || section.items.length === 0) return 0
    const maxOrder = Math.max(...section.items.map(i => i.sort_order || 0))
    return maxOrder + 1
  }

  // Translation progress calculation functions
  const getSectionTranslationProgress = (section) => {
    const totalLocales = Object.keys(LOCALES).length
    const translatedLocales = section.section_translations?.length || 0

    // Now that English content is also saved to translation table, count only actual translations
    return Math.round((translatedLocales / totalLocales) * 100)
  }

  const getItemTranslationProgress = (item) => {
    const totalLocales = Object.keys(LOCALES).length
    const translatedLocales = item.item_translations?.length || 0

    // Now that English content is also saved to translation table, count only actual translations
    return Math.round((translatedLocales / totalLocales) * 100)
  }

  // Fetch sections with items
  const fetchSections = async () => {
    try {
      const result = await apiClient.get('/api/faq-page/sections?include_inactive=true')
      const updatedSections = result.sections || []
      setSections(updatedSections)
      
      // Update form data if edit dialogs are open to sync with latest translation data
      if (selectedSection && (showEditSectionDialog || showAddSectionDialog)) {
        const currentSection = updatedSections.find(s => s.id === selectedSection.id)
        if (currentSection) {
          const translations = {}
          Object.keys(LOCALES).forEach(locale => {
            const translation = currentSection.section_translations?.find(t => t.locale === locale)
            translations[locale] = {
              title: translation?.title || (locale === DEFAULT_LOCALE ? currentSection.title : "")
            }
          })
          
          setSectionFormData(prev => ({
            ...prev,
            translations
          }))
        }
      }
      
      if (selectedItem && (showEditItemDialog || showAddItemDialog)) {
        // Find the section and item to update translation data
        const section = updatedSections.find(s => s.items?.some(i => i.id === selectedItem.id))
        const currentItem = section?.items?.find(i => i.id === selectedItem.id)
        if (currentItem) {
          const translations = {}
          Object.keys(LOCALES).forEach(locale => {
            const translation = currentItem.item_translations?.find(t => t.locale === locale)
            translations[locale] = {
              question: translation?.question || (locale === DEFAULT_LOCALE ? currentItem.question : ""),
              answer: translation?.answer || (locale === DEFAULT_LOCALE ? currentItem.answer : "")
            }
          })
          
          setItemFormData(prev => ({
            ...prev,
            translations
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching FAQ page sections:', error)
      toast({
        title: "Error",
        description: "Failed to fetch FAQ page sections",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Manual refresh function
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchSections()
    toast({
      title: "Success",
      description: "Data refreshed successfully"
    })
  }

  useEffect(() => {
    fetchSections()
    
    // Add window focus listener to refresh data when user returns to the tab
    const handleFocus = () => {
      fetchSections()
    }
    
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
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
      // Validate English translation is required
      const englishTranslation = sectionFormData.translations[DEFAULT_LOCALE]
      if (!englishTranslation?.title?.trim()) {
        toast({
          title: "Validation Error",
          description: "English title is required",
          variant: "destructive"
        })
        return
      }

      // Auto-assign sort order if not set (for new sections only)
      const sortOrder = selectedSection
        ? sectionFormData.sort_order
        : getNextSectionSortOrder()

      // Create/update main section
      const sectionData = {
        title: englishTranslation.title,
        icon: sectionFormData.icon,
        status: sectionFormData.status,
        sort_order: sortOrder
      }

      let result
      if (selectedSection) {
        result = await apiClient.put(`/api/faq-page/sections/${selectedSection.id}`, sectionData)
      } else {
        result = await apiClient.post('/api/faq-page/sections', sectionData)
      }

      const sectionId = selectedSection?.id || result.section.id

      // Get existing translations to compare
      const existingTranslations = selectedSection?.section_translations || []
      
      // Handle translations for all locales - ALWAYS save English content
      await Promise.all(Object.keys(LOCALES).map(async (locale) => {
        const formTranslation = locale === DEFAULT_LOCALE 
          ? englishTranslation.title.trim()  // Use the validated English translation
          : sectionFormData.translations[locale]?.title?.trim()
        
        const existingTranslation = existingTranslations.find(t => t.locale === locale)
        
        // Always save English content to translation table (legacy system pattern)
        if (locale === DEFAULT_LOCALE) {
          // English content always gets saved to translation table
          await apiClient.post(`/api/faq-page/sections/${sectionId}/translations`, {
            locale, title: formTranslation
          })
        } else if (formTranslation) {
          // Other languages only if they have content
          await apiClient.post(`/api/faq-page/sections/${sectionId}/translations`, {
            locale, title: formTranslation
          })
        } else if (existingTranslation) {
          // Delete empty non-English translations
          await apiClient.delete(`/api/faq-page/sections/${sectionId}/translations?locale=${locale}`)
        }
      }))

      await fetchSections()
      setShowAddSectionDialog(false)
      setShowEditSectionDialog(false)
      resetSectionForm()
      setSelectedSection(null)
      toast({
        title: "Success",
        description: `Section ${selectedSection ? 'updated' : 'created'} successfully`
      })
    } catch (error) {
      console.error('Error saving section:', error)
      toast({
        title: "Error",
        description: `Failed to ${selectedSection ? 'update' : 'create'} section: ${error.message}`,
        variant: "destructive"
      })
    }
  }

  // Handle item form submission
  const handleItemSubmit = async (e) => {
    e.preventDefault()

    try {
      // Validate English translation is required
      const englishTranslation = itemFormData.translations[DEFAULT_LOCALE]
      if (!englishTranslation?.question?.trim() || !englishTranslation?.answer?.trim()) {
        toast({
          title: "Validation Error",
          description: "English question and answer are required",
          variant: "destructive"
        })
        return
      }

      // Auto-assign sort order if not set (for new items only)
      const sortOrder = selectedItem
        ? itemFormData.sort_order
        : getNextItemSortOrder(itemFormData.section_id)

      // Create/update main item
      const itemData = {
        section_id: itemFormData.section_id,
        question: englishTranslation.question,
        answer: englishTranslation.answer,
        status: itemFormData.status,
        sort_order: sortOrder
      }

      let result
      if (selectedItem) {
        result = await apiClient.put(`/api/faq-page/items/${selectedItem.id}`, itemData)
      } else {
        result = await apiClient.post('/api/faq-page/items', itemData)
      }

      const itemId = selectedItem?.id || result.item.id

      // Get existing translations to compare
      const existingTranslations = selectedItem?.item_translations || []
      
      // Handle translations for all locales - ALWAYS save English content
      await Promise.all(Object.keys(LOCALES).map(async (locale) => {
        const formTranslation = locale === DEFAULT_LOCALE 
          ? englishTranslation  // Use the validated English translation
          : itemFormData.translations[locale]
        
        const hasQuestion = formTranslation?.question?.trim()
        const hasAnswer = formTranslation?.answer?.trim()
        const existingTranslation = existingTranslations.find(t => t.locale === locale)
        
        // Always save English content to translation table (legacy system pattern)
        if (locale === DEFAULT_LOCALE) {
          // English content always gets saved to translation table
          await apiClient.post(`/api/faq-page/items/${itemId}/translations`, {
            locale, question: formTranslation.question, answer: formTranslation.answer
          })
        } else if (hasQuestion && hasAnswer) {
          // Other languages only if they have content
          await apiClient.post(`/api/faq-page/items/${itemId}/translations`, {
            locale, question: formTranslation.question, answer: formTranslation.answer
          })
        } else if (existingTranslation) {
          // Delete empty non-English translations
          await apiClient.delete(`/api/faq-page/items/${itemId}/translations?locale=${locale}`)
        }
      }))

      await fetchSections()
      setShowAddItemDialog(false)
      setShowEditItemDialog(false)
      resetItemForm()
      setSelectedItem(null)
      toast({
        title: "Success",
        description: `FAQ item ${selectedItem ? 'updated' : 'created'} successfully`
      })
    } catch (error) {
      console.error('Error saving FAQ item:', error)
      toast({
        title: "Error",
        description: `Failed to ${selectedItem ? 'update' : 'create'} FAQ item: ${error.message}`,
        variant: "destructive"
      })
    }
  }

  // Handle delete
  const handleDelete = async () => {
    try {
      if (selectedSection) {
        await apiClient.delete(`/api/faq-page/sections/${selectedSection.id}`)
      } else if (selectedItem) {
        await apiClient.delete(`/api/faq-page/items/${selectedItem.id}`)
      } else {
        return
      }

      await fetchSections()
      setShowDeleteDialog(false)
      setSelectedSection(null)
      setSelectedItem(null)
      toast({
        title: "Success",
        description: `${selectedSection ? 'Section' : 'FAQ item'} deleted successfully`
      })
    } catch (error) {
      console.error('Error deleting:', error)
      toast({
        title: "Error",
        description: `Failed to delete ${selectedSection ? 'section' : 'FAQ item'}: ${error.message}`,
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
      sort_order: 0,
      translations: Object.keys(LOCALES).reduce((acc, locale) => {
        acc[locale] = { title: "" }
        return acc
      }, {})
    })
    setActiveTab(DEFAULT_LOCALE)
  }

  const resetItemForm = () => {
    setItemFormData({
      section_id: "",
      question: "",
      answer: "",
      status: "active",
      sort_order: 0,
      translations: Object.keys(LOCALES).reduce((acc, locale) => {
        acc[locale] = { question: "", answer: "" }
        return acc
      }, {})
    })
    setActiveTab(DEFAULT_LOCALE)
  }

  // Open edit dialogs
  const openEditSectionDialog = (section) => {
    setSelectedSection(section)

    // Initialize translations with existing data
    const translations = {}
    Object.keys(LOCALES).forEach(locale => {
      const translation = section.section_translations?.find(t => t.locale === locale)
      translations[locale] = {
        title: translation?.title || (locale === DEFAULT_LOCALE ? section.title : "")
      }
    })

    setSectionFormData({
      title: section.title,
      icon: section.icon || "",
      status: section.status,
      sort_order: section.sort_order,
      translations
    })
    setActiveTab(DEFAULT_LOCALE)
    setShowEditSectionDialog(true)
  }

  const openEditItemDialog = (item, sectionId) => {
    setSelectedItem(item)

    // Initialize translations with existing data
    const translations = {}
    Object.keys(LOCALES).forEach(locale => {
      const translation = item.item_translations?.find(t => t.locale === locale)
      translations[locale] = {
        question: translation?.question || (locale === DEFAULT_LOCALE ? item.question : ""),
        answer: translation?.answer || (locale === DEFAULT_LOCALE ? item.answer : "")
      }
    })

    setItemFormData({
      section_id: sectionId,
      question: item.question,
      answer: item.answer,
      status: item.status,
      sort_order: item.sort_order,
      translations
    })
    setActiveTab(DEFAULT_LOCALE)
    setShowEditItemDialog(true)
  }

  const openAddItemDialog = (sectionId) => {
    setItemFormData({
      section_id: sectionId,
      question: "",
      answer: "",
      status: "active",
      sort_order: 0,
      translations: Object.keys(LOCALES).reduce((acc, locale) => {
        acc[locale] = { question: "", answer: "" }
        return acc
      }, {})
    })
    setActiveTab(DEFAULT_LOCALE)
    setShowAddItemDialog(true)
  }

  
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FAQ Page Management</h1>
          <p className="text-gray-600">Manage FAQ sections and items for the public FAQ page</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            onClick={() => setShowAddSectionDialog(true)}
            className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white"
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            Add Section
          </Button>
        </div>
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
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          <span className="h-3 w-16 bg-gray-200 rounded animate-pulse"></span>
                        </div>
                        <div className="flex gap-2">
                          <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                      {Array.from({ length: 2 }).map((_, j) => (
                        <div key={j} className="border rounded p-3 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                              <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
                              <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse mt-1"></div>
                            </div>
                            <div className="flex gap-1 ml-4">
                              <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                              <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                              <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredSections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No FAQ sections found. {searchTerm ? 'Try a different search term.' : 'Create your first FAQ section!'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSections.map((section, index) => {
                const IconComponent = getIconByName(section.icon)
                const isExpanded = expandedSections.has(section.id)
                const translationProgress = getSectionTranslationProgress(section)

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
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-500">Translation:</span>
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    translationProgress === 100 ? 'bg-green-500' :
                                    translationProgress >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${translationProgress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-600">{translationProgress}%</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            {section.items?.length || 0} FAQ items • Order: {section.sort_order}
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
                          section.items.map((item, itemIndex) => {
                            const itemTranslationProgress = getItemTranslationProgress(item)
                            return (
                            <div
                              key={item.id}
                              className="flex items-start gap-3 p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow"
                            >
                              <GripVertical className="w-4 h-4 text-gray-400 mt-1" />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 mb-1">{item.question}</h4>
                                <p className="text-sm text-gray-600 line-clamp-2">{item.answer}</p>
                                <div className="mt-2 flex items-center gap-2 flex-wrap">
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
                                  <span className="text-xs text-gray-500">Order: {item.sort_order}</span>
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-gray-500">Translation:</span>
                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                      <div
                                        className={`h-2 rounded-full ${
                                          itemTranslationProgress === 100 ? 'bg-green-500' :
                                          itemTranslationProgress >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                        style={{ width: `${itemTranslationProgress}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs text-gray-600">{itemTranslationProgress}%</span>
                                  </div>
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
                            )
                          })
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
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedSection ? 'Edit FAQ Section' : 'Add FAQ Section'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSectionSubmit} className="space-y-6">
            {/* Basic Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            {/* Translation Tabs */}
            <TranslationTabs activeLocale={activeTab} onLocaleChange={setActiveTab}>
              {({ locale, localeName, isDefault }) => (
                <div data-locale={locale}>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mb-4">
                    <FlagIcon
                      src={LOCALES[locale]?.flag}
                      alt={localeName}
                      countryCode={LOCALES[locale]?.countryCode}
                      size={20}
                      className="shrink-0"
                    />
                    <span className="font-medium">{localeName}</span>
                    {isDefault && (
                      <Badge variant="outline" className="ml-auto">Required</Badge>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={`section-title-${locale}`}>
                      Section Title {isDefault && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      id={`section-title-${locale}`}
                      value={sectionFormData.translations[locale]?.title || ''}
                      onChange={(e) => setSectionFormData({
                        ...sectionFormData,
                        translations: {
                          ...sectionFormData.translations,
                          [locale]: { ...sectionFormData.translations[locale], title: e.target.value }
                        }
                      })}
                      placeholder={`Enter title in ${localeName}`}
                      required={isDefault}
                      className={isDefault ? "font-medium" : ""}
                    />
                  </div>
                </div>
              )}
            </TranslationTabs>

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
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? 'Edit FAQ Item' : 'Add FAQ Item'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleItemSubmit} className="space-y-6">
            {/* Section Selection (only for new items) */}
            {!selectedItem && (
              <div>
                <Label htmlFor="item-section">Section</Label>
                <select
                  id="item-section"
                  value={itemFormData.section_id}
                  onChange={(e) => setItemFormData({ ...itemFormData, section_id: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a section</option>
                  {sections.map(section => (
                    <option key={section.id} value={section.id}>{section.title}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Status Toggle */}
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

            {/* Translation Tabs */}
            <TranslationTabs activeLocale={activeTab} onLocaleChange={setActiveTab}>
              {({ locale, localeName, isDefault }) => (
                <div data-locale={locale}>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mb-4">
                    <FlagIcon
                      src={LOCALES[locale]?.flag}
                      alt={localeName}
                      countryCode={LOCALES[locale]?.countryCode}
                      size={20}
                      className="shrink-0"
                    />
                    <span className="font-medium">{localeName}</span>
                    {isDefault && (
                      <Badge variant="outline" className="ml-auto">Required</Badge>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`item-question-${locale}`}>
                        Question {isDefault && <span className="text-red-500">*</span>}
                      </Label>
                      <Textarea
                        id={`item-question-${locale}`}
                        value={itemFormData.translations[locale]?.question || ''}
                        onChange={(e) => setItemFormData({
                          ...itemFormData,
                          translations: {
                            ...itemFormData.translations,
                            [locale]: {
                              ...itemFormData.translations[locale],
                              question: e.target.value
                            }
                          }
                        })}
                        placeholder={`Enter question in ${localeName}`}
                        rows={3}
                        required={isDefault}
                        className={isDefault ? "font-medium min-h-[80px]" : "min-h-[80px]"}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`item-answer-${locale}`}>
                        Answer {isDefault && <span className="text-red-500">*</span>}
                      </Label>
                      <Textarea
                        id={`item-answer-${locale}`}
                        value={itemFormData.translations[locale]?.answer || ''}
                        onChange={(e) => setItemFormData({
                          ...itemFormData,
                          translations: {
                            ...itemFormData.translations,
                            [locale]: {
                              ...itemFormData.translations[locale],
                              answer: e.target.value
                            }
                          }
                        })}
                        placeholder={`Enter answer in ${localeName}`}
                        rows={5}
                        required={isDefault}
                        className={isDefault ? "font-medium min-h-[120px]" : "min-h-[120px]"}
                      />
                    </div>

                    {LOCALES[locale]?.direction === 'rtl' && (
                      <div className="flex items-center gap-2 p-2 bg-blue-50 text-blue-700 rounded text-sm">
                        <AlertCircle className="w-4 h-4" />
                        RTL layout will be applied for Arabic content
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TranslationTabs>

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