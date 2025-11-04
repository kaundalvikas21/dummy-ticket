"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, Eye, EyeOff, MoveUp, MoveDown, Globe, Check, X, AlertCircle } from "lucide-react"
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

export function FAQManagementMultiLang() {
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedFaq, setSelectedFaq] = useState(null)
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
      const response = await fetch('/api/faqs/admin')
      const result = await response.json()

      if (response.ok) {
        setFaqs(result.faqs || [])
      } else {
        console.error('Failed to fetch FAQs:', result.error)
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error)
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
      alert('English translation is required')
      return
    }

    try {
      // Create/update main FAQ
      const url = selectedFaq ? `/api/faqs/${selectedFaq.id}` : '/api/faqs'
      const method = selectedFaq ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: englishTranslation.question,
          answer: englishTranslation.answer,
          status: formData.status,
          sort_order: formData.sort_order
        }),
      })

      const result = await response.json()

      if (response.ok) {
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
              await fetch(`/api/faq-translations/${existingTranslation.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  faq_id: faqId,
                  locale,
                  question: translation.question,
                  answer: translation.answer
                })
              })
            } else {
              // Create new translation
              await fetch('/api/faq-translations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  faq_id: faqId,
                  locale,
                  question: translation.question,
                  answer: translation.answer
                })
              })
            }
          }
        }))

        await fetchFaqs()
        setShowAddDialog(false)
        setShowEditDialog(false)
        resetForm()
        setSelectedFaq(null)
      } else {
        console.error('Failed to save FAQ:', result.error)
      }
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
      const response = await fetch(`/api/faqs/${selectedFaq.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (response.ok) {
        await fetchFaqs()
        setShowDeleteDialog(false)
        setSelectedFaq(null)
      } else {
        console.error('Failed to delete FAQ:', result.error)
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error)
    }
  }

  // Toggle status
  const toggleStatus = async (faq) => {
    try {
      const response = await fetch(`/api/faqs/${faq.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...faq,
          status: faq.status === 'active' ? 'inactive' : 'active'
        }),
      })

      if (response.ok) {
        await fetchFaqs()
      }
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
      const currentResponse = await fetch(`/api/faqs/${currentFaq.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...currentFaq,
          sort_order: targetSortOrder
        }),
      })

      if (!currentResponse.ok) {
        throw new Error('Failed to update current FAQ position')
      }

      const targetResponse = await fetch(`/api/faqs/${targetFaq.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...targetFaq,
          sort_order: currentSortOrder
        }),
      })

      if (!targetResponse.ok) {
        throw new Error('Failed to update target FAQ position')
      }

      await fetchFaqs()
    } catch (error) {
      console.error('Error moving FAQ:', error)
      alert('Failed to move FAQ. Please try again.')
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

      {/* FAQ List */}
      <Card>
        <CardHeader>
          <CardTitle>All FAQs ({filteredFaqs.length})</CardTitle>
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
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 truncate">
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
                            <Badge key={trans.locale} variant="outline" className="text-xs">
                              {LOCALES[trans.locale]?.flag} {trans.locale.toUpperCase()}
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
                            disabled={index === 0}
                          >
                            <MoveUp className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveFaq(faq, 'down')}
                            disabled={index === filteredFaqs.length - 1}
                          >
                            <MoveDown className="w-3 h-3" />
                          </Button>
                        </div>

                        {/* Status toggle */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleStatus(faq)}
                          className={faq.status === 'active' ? 'text-green-600' : 'text-gray-600'}
                        >
                          {faq.status === 'active' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>

                        {/* Edit */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(faq)}
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
                    <span className="text-sm">{locale.flag}</span>
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
                    <span className="text-lg">{locale.flag}</span>
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
    </div>
  )
}