"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, Eye, EyeOff, MoveUp, MoveDown, Globe, Check, X, AlertCircle, Square, CheckSquare2 } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LOCALES, DEFAULT_LOCALE } from "@/lib/locales"
import { FlagIcon } from "@/components/ui/flag-icon"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"

export function FAQManagementMultiLang() {
  const { toast } = useToast()
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedFaq, setSelectedFaq] = useState(null)
  const [selectedFaqIds, setSelectedFaqIds] = useState([])
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [deletingFaqIds, setDeletingFaqIds] = useState(new Set())
  const [activeTab, setActiveTab] = useState(DEFAULT_LOCALE)

  // Form data for all locales
  const [formData, setFormData] = useState({
    status: "active",
    sort_order: 0,
    translations: {}
  })

  // Initialize translations object for all locales
  useEffect(() => {
    const initialTranslations = {}
    Object.keys(LOCALES).forEach(locale => {
      initialTranslations[locale] = {
        question: "",
        answer: ""
      }
    })
    setFormData(prev => ({
      ...prev,
      translations: initialTranslations
    }))
  }, [])

  // Fetch FAQs from API
  const fetchFaqs = async () => {
    try {
      const result = await apiClient.get('/api/faqs/admin')
      setFaqs(result.faqs || [])
    } catch (error) {
      console.error('Error fetching FAQs:', error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFaqs()
  }, [])

  // Filter FAQs based on search
  const filteredFaqs = faqs.filter(faq => {
    const searchLower = searchTerm.toLowerCase()

    // Check main FAQ fields
    const mainMatch = faq.question?.toLowerCase().includes(searchLower) ||
                     faq.answer?.toLowerCase().includes(searchLower)

    // Check translations
    const translationMatch = faq.faq_translations?.some(trans =>
      trans.question?.toLowerCase().includes(searchLower) ||
      trans.answer?.toLowerCase().includes(searchLower)
    )

    return mainMatch || translationMatch
  })

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate that at least English translation is filled
    const englishTranslation = formData.translations[DEFAULT_LOCALE]
    if (!englishTranslation?.question || !englishTranslation?.answer) {
      toast({
        title: "Validation Error",
        description: "English translation is required",
        variant: "destructive"
      })
      return
    }

    try {
      // Create/update main FAQ
      const faqData = {
        question: englishTranslation.question,
        answer: englishTranslation.answer,
        status: formData.status,
        sort_order: formData.sort_order
      }

      let result;
      if (selectedFaq) {
        result = await apiClient.put(`/api/faqs/${selectedFaq.id}`, faqData)
      } else {
        result = await apiClient.post('/api/faqs', faqData)
      }

      const faqId = selectedFaq?.id || result.faq.id

        // Handle translations
        await Promise.all(Object.entries(formData.translations).map(async ([locale, translation]) => {
          if (translation.question && translation.answer) {
            // Check if translation exists
            const existingTranslation = selectedFaq?.faq_translations?.find(
              t => t.locale === locale
            )

            if (existingTranslation) {
              // Update existing translation
              await apiClient.put(`/api/faq-translations/${existingTranslation.id}`, {
                faq_id: faqId,
                locale,
                question: translation.question,
                answer: translation.answer
              })
            } else {
              // Create new translation
              await apiClient.post('/api/faq-translations', {
                faq_id: faqId,
                locale,
                question: translation.question,
                answer: translation.answer
              })
            }
          }
        }))

        await fetchFaqs()
        setShowAddDialog(false)
        setShowEditDialog(false)
        resetForm()
        setSelectedFaq(null)
    } catch (error) {
      console.error('Error saving FAQ:', error)
    }
  }

  // Reset form
  const resetForm = () => {
    const initialTranslations = {}
    Object.keys(LOCALES).forEach(locale => {
      initialTranslations[locale] = {
        question: "",
        answer: ""
      }
    })
    setFormData({
      status: "active",
      sort_order: 0,
      translations: initialTranslations
    })
  }

  // Handle delete
  const handleDelete = async () => {
    if (!selectedFaq) return

    try {
      console.log(`Deleting FAQ: ${selectedFaq.id} - ${selectedFaq.question}`)

      await apiClient.delete(`/api/faqs/${selectedFaq.id}`)
      console.log('Delete successful')

      await fetchFaqs()
      setShowDeleteDialog(false)
      setSelectedFaq(null)
      toast({
        title: "Success",
        description: "FAQ deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting FAQ:', error)
      toast({
        title: "Network Error",
        description: "Network error occurred while deleting FAQ. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Toggle status
  const toggleStatus = async (faq) => {
    try {
      await apiClient.put(`/api/faqs/${faq.id}`, {
        ...faq,
        status: faq.status === 'active' ? 'inactive' : 'active'
      })

      await fetchFaqs()
    } catch (error) {
      console.error('Error toggling status:', error)
    }
  }

  // Move FAQ up/down
  const moveFaq = async (faq, direction) => {
    const currentIndex = faqs.findIndex(f => f.id === faq.id)
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (newIndex < 0 || newIndex >= faqs.length) return

    const currentFaq = faqs[currentIndex]
    const targetFaq = faqs[newIndex]

    const currentSortOrder = currentFaq.sort_order !== undefined ? currentFaq.sort_order : currentIndex
    const targetSortOrder = targetFaq.sort_order !== undefined ? targetFaq.sort_order : newIndex

    try {
      await Promise.all([
        apiClient.put(`/api/faqs/${currentFaq.id}`, {
          ...currentFaq,
          sort_order: targetSortOrder
        }),
        apiClient.put(`/api/faqs/${targetFaq.id}`, {
          ...targetFaq,
          sort_order: currentSortOrder
        })
      ])

      await fetchFaqs()
    } catch (error) {
      console.error('Error moving FAQ:', error)
      toast({
        title: "Move Failed",
        description: "Failed to move FAQ. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Multi-select handlers
  const handleSelectFaq = (faqId) => {
    setSelectedFaqIds(prev =>
      prev.includes(faqId)
        ? prev.filter(id => id !== faqId)
        : [...prev, faqId]
    )
  }

  const handleSelectAll = () => {
    if (selectedFaqIds.length === filteredFaqs.length) {
      // Deselect all
      setSelectedFaqIds([])
    } else {
      // Select all
      setSelectedFaqIds(filteredFaqs.map(f => f.id))
    }
  }

  const isAllSelected = filteredFaqs.length > 0 && selectedFaqIds.length === filteredFaqs.length
  const isIndeterminate = selectedFaqIds.length > 0 && selectedFaqIds.length < filteredFaqs.length

  const clearSelection = () => {
    setSelectedFaqIds([])
  }

  // Bulk delete handler
  const handleBulkDelete = async () => {
    setIsBulkDeleting(true)
    const totalToDelete = selectedFaqIds.length
    let deletedCount = 0
    let failedDeletions = []

    try {
      console.log(`Starting bulk delete of ${totalToDelete} FAQs`)

      // Process deletions one by one for better error tracking
      for (let i = 0; i < selectedFaqIds.length; i++) {
        const faqId = selectedFaqIds[i]
        const faq = faqs.find(f => f.id === faqId)
        const translation = faq?.faq_translations?.find(t => t.locale === DEFAULT_LOCALE)

        console.log(`Deleting FAQ ${i + 1}/${totalToDelete}: ${translation?.question || faq?.question}`)

        // Track which FAQ is currently being deleted
        setDeletingFaqIds(prev => new Set(prev).add(faqId))

        try {
          await apiClient.delete(`/api/faqs/${faqId}`)
          deletedCount++
          console.log(`Successfully deleted FAQ: ${faqId}`)
        } catch (error) {
          failedDeletions.push({
            faqId,
            question: translation?.question || faq?.question || 'Unknown FAQ',
            error: error.message || 'Network error'
          })
          console.error(`Error deleting FAQ ${faqId}:`, error)
        } finally {
          // Remove from currently deleting set
          setDeletingFaqIds(prev => {
            const newSet = new Set(prev)
            newSet.delete(faqId)
            return newSet
          })
        }
      }

      // Refresh the FAQ list
      await fetchFaqs()
      clearSelection()
      setShowBulkDeleteDialog(false)

      // Show detailed results
      if (failedDeletions.length === 0) {
        // Complete success
        toast({
          title: "Bulk Delete Successful",
          description: `Successfully deleted ${deletedCount} FAQ${deletedCount !== 1 ? 's' : ''}.`
        })
      } else if (deletedCount === 0) {
        // Complete failure
        const failureDetails = failedDeletions.map(f => `• ${f.question}: ${f.error}`).join('\n')
        toast({
          title: "Bulk Delete Failed",
          description: `Failed to delete any FAQs. Check console for details.`,
          variant: "destructive"
        })
        console.error('Bulk delete failures:', failureDetails)
      } else {
        // Partial success
        toast({
          title: "Partial Success",
          description: `Successfully deleted ${deletedCount} FAQ${deletedCount !== 1 ? 's' : ''}, but ${failedDeletions.length} failed.`,
          variant: "default"
        })
        console.error('Partial bulk delete failures:', failedDeletions.map(f => `• ${f.question}: ${f.error}`).join('\n'))
      }

    } catch (error) {
      console.error('Critical error in bulk delete:', error)
      toast({
        title: "Critical Error",
        description: "Critical error occurred during bulk delete. Please refresh the page and try again.",
        variant: "destructive"
      })
    } finally {
      setIsBulkDeleting(false)
      setDeletingFaqIds(new Set())
    }
  }

  // Open edit dialog
  const openEditDialog = (faq) => {
    setSelectedFaq(faq)

    // Initialize translations with existing data
    const translations = {}
    Object.keys(LOCALES).forEach(locale => {
      const translation = faq.faq_translations?.find(t => t.locale === locale)
      translations[locale] = {
        question: translation?.question || (locale === DEFAULT_LOCALE ? faq.question : ""),
        answer: translation?.answer || (locale === DEFAULT_LOCALE ? faq.answer : "")
      }
    })

    setFormData({
      status: faq.status,
      sort_order: faq.sort_order,
      translations
    })
    setShowEditDialog(true)
  }

  // Get translation completion status
  const getTranslationStatus = (faq) => {
    const totalLocales = Object.keys(LOCALES).length
    const translatedLocales = faq.faq_translations?.length || 0
    const englishExists = faq.question && faq.answer
    const completion = englishExists ? Math.round((translatedLocales / totalLocales) * 100) : 0
    return completion
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-600" />
            Multi-Language FAQ Management
          </h1>
          <p className="text-gray-600">Manage frequently asked questions in multiple languages</p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add FAQ
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search FAQs in any language..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Bulk Action Bar */}
      {selectedFaqIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center justify-between animate-in slide-in-from-top">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-900">
              {selectedFaqIds.length} {selectedFaqIds.length === 1 ? 'FAQ' : 'FAQs'} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
              className="text-gray-600 hover:text-gray-800"
            >
              Clear Selection
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowBulkDeleteDialog(true)}
              disabled={isBulkDeleting}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              {isBulkDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      )}

      {/* FAQ List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All FAQs ({filteredFaqs.length})</span>
            {filteredFaqs.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="flex items-center gap-2"
              >
                {isAllSelected ? (
                  <>
                    <CheckSquare2 className="w-4 h-4" />
                    Deselect All
                  </>
                ) : isIndeterminate ? (
                  <>
                    <div className="w-4 h-4 border border-gray-300 rounded relative">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-sm"></div>
                    </div>
                    Select All
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4" />
                    Select All
                  </>
                )}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading FAQs...</div>
          ) : filteredFaqs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No FAQs found. {searchTerm ? 'Try a different search term.' : 'Create your first multi-language FAQ!'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => {
                const completion = getTranslationStatus(faq)
                const translation = faq.faq_translations?.find(t => t.locale === DEFAULT_LOCALE)

                return (
                  <div
                    key={faq.id}
                    className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                      selectedFaqIds.includes(faq.id) ? 'bg-blue-50 border-blue-300' : ''
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      {/* Checkbox */}
                      <div className="flex items-start lg:items-center">
                        <input
                          type="checkbox"
                          checked={selectedFaqIds.includes(faq.id)}
                          onChange={() => handleSelectFaq(faq.id)}
                          disabled={isBulkDeleting || deletingFaqIds.has(faq.id)}
                          className={`mt-1 lg:mt-0 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${
                            (isBulkDeleting || deletingFaqIds.has(faq.id)) ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {deletingFaqIds.has(faq.id) && (
                            <div className="flex items-center gap-1 text-red-600">
                              <div className="w-3 h-3 border border-red-600 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-xs font-medium">Deleting...</span>
                            </div>
                          )}
                          <h3 className={`font-semibold truncate ${
                            deletingFaqIds.has(faq.id) ? 'text-gray-400 line-through' : 'text-gray-900'
                          }`}>
                            {translation?.question || faq.question}
                          </h3>
                          <Badge
                            variant={faq.status === 'active' ? 'default' : 'secondary'}
                            className={
                              faq.status === 'active'
                                ? 'bg-green-100 text-green-800 border-green-200'
                                : 'bg-gray-100 text-gray-800 border-gray-200'
                            }
                          >
                            {faq.status}
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
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {translation?.answer || faq.answer}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {faq.faq_translations?.map(trans => (
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
                        {/* Move controls */}
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveFaq(faq, 'up')}
                            disabled={index === 0 || isBulkDeleting || deletingFaqIds.has(faq.id)}
                          >
                            <MoveUp className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveFaq(faq, 'down')}
                            disabled={index === filteredFaqs.length - 1 || isBulkDeleting || deletingFaqIds.has(faq.id)}
                          >
                            <MoveDown className="w-3 h-3" />
                          </Button>
                        </div>

                        {/* Status toggle */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleStatus(faq)}
                          disabled={isBulkDeleting || deletingFaqIds.has(faq.id)}
                          className={faq.status === 'active' ? 'text-green-600' : 'text-gray-600'}
                        >
                          {faq.status === 'active' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>

                        {/* Edit */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(faq)}
                          disabled={isBulkDeleting || deletingFaqIds.has(faq.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        {/* Delete */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedFaq(faq)
                            setShowDeleteDialog(true)
                          }}
                          disabled={isBulkDeleting || deletingFaqIds.has(faq.id)}
                          className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Add/Edit FAQ Dialog */}
      <Dialog open={showAddDialog || showEditDialog} onOpenChange={() => {
        setShowAddDialog(false)
        setShowEditDialog(false)
        resetForm()
      }}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              {selectedFaq ? 'Edit Multi-Language FAQ' : 'Add Multi-Language FAQ'}
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
                    {formData.translations[code]?.question && formData.translations[code]?.answer && (
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
                    <Label htmlFor={`question-${code}`}>
                      Question {code === DEFAULT_LOCALE && <span className="text-red-500">*</span>}
                    </Label>
                    <Textarea
                      id={`question-${code}`}
                      value={formData.translations[code]?.question || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        translations: {
                          ...formData.translations,
                          [code]: {
                            ...formData.translations[code],
                            question: e.target.value
                          }
                        }
                      })}
                      placeholder={`Enter question in ${locale.name}`}
                      rows={3}
                      required={code === DEFAULT_LOCALE}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`answer-${code}`}>
                      Answer {code === DEFAULT_LOCALE && <span className="text-red-500">*</span>}
                    </Label>
                    <Textarea
                      id={`answer-${code}`}
                      value={formData.translations[code]?.answer || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        translations: {
                          ...formData.translations,
                          [code]: {
                            ...formData.translations[code],
                            answer: e.target.value
                          }
                        }
                      })}
                      placeholder={`Enter answer in ${locale.name}`}
                      rows={5}
                      required={code === DEFAULT_LOCALE}
                    />
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
              <Button type="submit" className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white">
                {selectedFaq ? 'Update FAQ' : 'Create FAQ'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this FAQ? This action cannot be undone and will remove all translations.
              <br /><br />
              <strong>Question:</strong> {selectedFaq?.question}
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

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Delete Multiple FAQs
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedFaqIds.length} selected FAQ{selectedFaqIds.length !== 1 ? 's' : ''}?
              This action cannot be undone and will remove all translations.
            </AlertDialogDescription>

            {/* List of FAQs to be deleted */}
            <div className="max-h-40 overflow-y-auto bg-gray-50 rounded-md p-3 space-y-2 my-4">
              {selectedFaqIds.map(faqId => {
                const faq = faqs.find(f => f.id === faqId)
                const translation = faq?.faq_translations?.find(t => t.locale === DEFAULT_LOCALE)
                return (
                  <div key={faqId} className="text-sm">
                    <strong className="text-gray-900">
                      {translation?.question || faq?.question || 'Unknown FAQ'}
                    </strong>
                    <div className="text-gray-600 text-xs">
                      Status: {faq?.status || 'unknown'} •
                      {faq?.faq_translations?.length || 0} translation{faq?.faq_translations?.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span className="text-sm text-red-800">
                This will permanently delete all selected FAQs and their translations.
              </span>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isBulkDeleting}
            >
              {isBulkDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete {selectedFaqIds.length} FAQ{selectedFaqIds.length !== 1 ? 's' : ''}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}