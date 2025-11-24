"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import { TranslationTabs } from "@/components/admin/translation/TranslationTabs"
import { Newspaper, BookOpen, Plus, Edit, Trash2, ExternalLink, Globe, CheckSquare, Square, X, MoveUp, MoveDown } from "lucide-react"

const SUPPORTED_LOCALES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "nl", name: "Dutch", flag: "🇳🇱" }
]

export function HomepageNewsBlogManagement() {
  const [newsItems, setNewsItems] = useState([])
  const [blogItems, setBlogItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [activeLocale, setActiveLocale] = useState("en")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [initialFormData, setInitialFormData] = useState(null)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedItems, setSelectedItems] = useState(new Set())
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [reorderingItem, setReorderingItem] = useState(null)
  const [formData, setFormData] = useState({
    content_type: "news",
    external_link: "",
    status: "active",
    translations: SUPPORTED_LOCALES.reduce((acc, locale) => {
      acc[locale.code] = { title: "" }
      return acc
    }, {})
  })

  const fetchItems = async () => {
    try {
      const result = await apiClient.get("/api/admin/homepage-news-blog")
      setNewsItems(result.data.news || [])
      setBlogItems(result.data.blog || [])
    } catch (error) {
      console.error("Error fetching items:", error.message)
      toast({
        title: "Error",
        description: "Failed to fetch homepage news blog items",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const hasChanges = () => {
    if (!initialFormData) return true // For new items, always allow submission

    return JSON.stringify(formData) !== JSON.stringify(initialFormData)
  }

  const resetForm = () => {
    const emptyFormData = {
      content_type: "news",
      external_link: "",
      status: "active",
      translations: SUPPORTED_LOCALES.reduce((acc, locale) => {
        acc[locale.code] = { title: "" }
        return acc
      }, {})
    }

    setFormData(emptyFormData)
    setInitialFormData(emptyFormData)
    setEditingItem(null)
  }

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode)
    if (!selectionMode) {
      setSelectedItems(new Set())
    }
  }

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const selectAllItems = () => {
    const allIds = [...newsItems.map(item => item.id), ...blogItems.map(item => item.id)]
    setSelectedItems(new Set(allIds))
  }

  const clearSelection = () => {
    setSelectedItems(new Set())
  }

  const getSelectedItemCount = () => {
    return selectedItems.size
  }

  const isItemSelected = (itemId) => {
    return selectedItems.has(itemId)
  }

  const isAllSelected = () => {
    const allIds = [...newsItems.map(item => item.id), ...blogItems.map(item => item.id)]
    return allIds.length > 0 && allIds.every(id => selectedItems.has(id))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate English translation is required
    if (!formData.translations.en.title.trim()) {
      toast({
        title: "Validation Error",
        description: "English title is required",
        variant: "destructive"
      })
      return
    }

    // Ensure English title is set as main title
    const submissionData = {
      ...formData,
      translations: {
        ...formData.translations,
        en: {
          ...formData.translations.en,
          title: formData.translations.en.title.trim()
        }
      }
    }

    setIsSubmitting(true)

    try {
      if (editingItem) {
        await apiClient.put(`/api/homepage-news-blog/${editingItem.id}`, submissionData)
      } else {
        await apiClient.post("/api/homepage-news-blog", submissionData)
      }

      toast({
        title: "Success",
        description: editingItem
          ? "Homepage news blog item updated successfully"
          : "Homepage news blog item created successfully"
      })

      setIsDialogOpen(false)
      resetForm()
      fetchItems()
    } catch (error) {
      console.error("Error saving item:", error)
      toast({
        title: "Error",
        description: "Failed to save homepage news blog item",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    const editFormData = {
      content_type: item.content_type,
      external_link: item.external_link || "",
      status: item.status,
      translations: SUPPORTED_LOCALES.reduce((acc, locale) => {
        acc[locale.code] = {
          title: item.translations[locale.code]?.title || ""
        }
        return acc
      }, {})
    }

    setFormData(editFormData)
    setInitialFormData(JSON.parse(JSON.stringify(editFormData))) // Deep copy
    setIsDialogOpen(true)
  }

  const handleDelete = (item) => {
    setItemToDelete(item)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return

    setIsDeleting(true)

    try {
      await apiClient.delete(`/api/homepage-news-blog/${itemToDelete.id}`)

      toast({
        title: "Success",
        description: "Homepage news blog item deleted successfully"
      })
      setShowDeleteDialog(false)
      setItemToDelete(null)
      fetchItems()
    } catch (error) {
      console.error("Error deleting item:", error)
      toast({
        title: "Error",
        description: "Failed to delete homepage news blog item",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const moveItem = async (item, direction) => {
    const items = item.content_type === 'news' ? newsItems : blogItems
    const currentIndex = items.findIndex(i => i.id === item.id)

    // Don't allow moving if selection mode is active
    if (selectionMode) return

    // Check boundaries
    if (direction === 'up' && currentIndex === 0) return
    if (direction === 'down' && currentIndex === items.length - 1) return

    const targetItem = direction === 'up'
      ? items[currentIndex - 1]
      : items[currentIndex + 1]

    if (!targetItem) return

    setReorderingItem(item.id)

    try {
      await apiClient.post(`/api/homepage-news-blog/${item.id}`, {
        itemId: item.id,
        direction,
        contentType: item.content_type
      })

      await fetchItems()
      toast({
        title: "Success",
        description: `Moved ${item.content_type} item ${direction} successfully`
      })
    } catch (error) {
      console.error("Error moving item:", error)
      toast({
        title: "Error",
        description: "Failed to move item",
        variant: "destructive"
      })
    } finally {
      setReorderingItem(null)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return

    try {
      setIsBulkDeleting(true)

      const deletePromises = Array.from(selectedItems).map(async (id) => {
        try {
          await apiClient.delete(`/api/homepage-news-blog/${id}`)
          return { id, success: true }
        } catch (error) {
          return { id, success: false, error: error.message }
        }
      })

      const results = await Promise.all(deletePromises)

      const successful = results.filter(r => r.success)
      const failed = results.filter(r => !r.success)

      if (successful.length > 0) {
        toast({
          title: "Bulk Delete Completed",
          description: `Successfully deleted ${successful.length} item${successful.length !== 1 ? 's' : ''}${failed.length > 0 ? ` (${failed.length} failed)` : ''}`,
          variant: failed.length > 0 ? "destructive" : "default"
        })
      }

      setShowBulkDeleteDialog(false)
      setSelectionMode(false)
      setSelectedItems(new Set())
      fetchItems()
    } catch (error) {
      console.error("Error during bulk delete:", error)
      toast({
        title: "Error",
        description: "Failed to perform bulk delete operation",
        variant: "destructive"
      })
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const ItemCard = ({ item, type }) => {
    const isSelected = isItemSelected(item.id)

    return (
    <Card className={`hover:shadow-md transition-shadow gap-1 ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''} ${selectionMode ? 'cursor-pointer' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectionMode && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleItemSelection(item.id)}
                onClick={(e) => e.stopPropagation()}
              />
            )}
            {type === "news" ? (
              <Newspaper className="w-4 h-4 text-blue-600" />
            ) : (
              <BookOpen className="w-4 h-4 text-green-600" />
            )}
            <Badge variant={item.status === "active" ? "default" : "secondary"}>
              {item.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {/* Move Controls */}
            <div className="flex flex-col gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => moveItem(item, 'up')}
                className={selectionMode ? 'opacity-50' : ''}
                disabled={selectionMode || reorderingItem === item.id}
                title="Move up"
              >
                <MoveUp className="w-2 h-2" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => moveItem(item, 'down')}
                className={selectionMode ? 'opacity-50' : ''}
                disabled={selectionMode || reorderingItem === item.id}
                title="Move down"
              >
                <MoveDown className="w-2 h-2" />
              </Button>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(item)}
              className={selectionMode ? 'opacity-50' : ''}
              disabled={selectionMode}
            >
              <Edit className="w-4 h-4 text-blue-600" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(item)}
              className={selectionMode ? 'opacity-50' : ''}
              disabled={selectionMode}
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <Label className="text-xs text-gray-500">Title (English)</Label>
            <p className="font-medium text-sm">{item.translations.en?.title || "No title"}</p>
          </div>
          {item.external_link && (
            <div>
              <Label className="text-xs text-gray-500">External Link</Label>
              <div className="flex items-center gap-1">
                <ExternalLink className="w-3 h-3 text-gray-400" />
                <a
                  href={item.external_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline truncate"
                >
                  {item.external_link}
                </a>
              </div>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Globe className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              {Object.keys(item.translations).filter(locale =>
                item.translations[locale]?.title
              ).length} / {SUPPORTED_LOCALES.length} translations
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with selection mode toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Homepage News & Blog Management</h1>
          <p className="text-gray-600">Manage news and blog items displayed on the homepage</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={selectionMode ? "default" : "outline"}
            onClick={toggleSelectionMode}
            className={selectionMode ? "bg-blue-600 text-white" : ""}
          >
            {selectionMode ? (
              <X className="w-4 h-4 mr-2" />
            ) : (
              <Square className="w-4 h-4 mr-2" />
            )}
            {selectionMode ? "Exit Selection" : "Select Items"}
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setIsDialogOpen(true)
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectionMode && getSelectedItemCount() > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-blue-900">
              {getSelectedItemCount()} item{getSelectedItemCount() !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={isAllSelected() ? clearSelection : selectAllItems}
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                {isAllSelected() ? "Deselect All" : "Select All"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
              >
                Clear Selection
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowBulkDeleteDialog(true)}
              disabled={isBulkDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isBulkDeleting ? "Deleting..." : `Delete ${getSelectedItemCount()} Item${getSelectedItemCount() !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Latest Travel News */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Latest Travel News</h2>
            <Badge variant="outline">{newsItems.length} items</Badge>
          </div>
          <div className="space-y-3">
            {newsItems.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-gray-500">
                    <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No news items found</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              newsItems.map((item) => (
                <ItemCard key={item.id} item={item} type="news" />
              ))
            )}
          </div>
        </div>

        {/* From the Blog */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold">From the Blog</h2>
            <Badge variant="outline">{blogItems.length} items</Badge>
          </div>
          <div className="space-y-3">
            {blogItems.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-gray-500">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No blog items found</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              blogItems.map((item) => (
                <ItemCard key={item.id} item={item} type="blog" />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="!max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Item" : "Add New Item"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="content_type">Content Type</Label>
                <Select
                  value={formData.content_type}
                  onValueChange={(value) =>
                    setFormData(prev => ({ ...prev, content_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="news">News</SelectItem>
                    <SelectItem value="blog">Blog</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="external_link">External Link</Label>
              <Input
                id="external_link"
                type="url"
                placeholder="https://example.com"
                value={formData.external_link}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, external_link: e.target.value }))
                }
              />
            </div>

            <div className="space-y-4">
              <Label>Title Translations</Label>
              <TranslationTabs
                activeLocale={activeLocale}
                onLocaleChange={setActiveLocale}
              >
                {({ locale, localeName, isDefault }) => (
                  <div data-locale={locale}>
                    <div className="space-y-2">
                      <Label htmlFor={`title-${locale}`}>
                        Title {isDefault && <span className="text-blue-600">(Required)</span>}
                      </Label>
                      <Input
                        id={`title-${locale}`}
                        value={formData.translations[locale]?.title || ""}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            translations: {
                              ...prev.translations,
                              [locale]: {
                                ...prev.translations[locale],
                                title: e.target.value
                              }
                            }
                          }))
                        }}
                        placeholder={isDefault ? "Enter title..." : `Enter title in ${localeName}...`}
                        className={isDefault ? "font-medium" : ""}
                      />
                    </div>
                  </div>
                )}
              </TranslationTabs>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !hasChanges()}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {editingItem ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    {editingItem ? "Update" : "Create"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Confirm Bulk Delete
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-900">
                Are you sure you want to delete <strong>{getSelectedItemCount()} item{getSelectedItemCount() !== 1 ? 's' : ''}</strong>?
              </p>
              <p className="text-xs text-red-700 mt-2">
                This action cannot be undone. The items will be permanently deleted from the database.
              </p>
            </div>

            <div className="text-sm text-gray-600">
              {getSelectedItemCount()} items will be removed from the homepage display.
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowBulkDeleteDialog(false)}
              disabled={isBulkDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
            >
              {isBulkDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete {getSelectedItemCount()} Item{getSelectedItemCount() !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Single Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Confirm Delete
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-900">
                Are you sure you want to delete <strong>{itemToDelete?.translations.en?.title || 'this item'}</strong>?
              </p>
              <p className="text-xs text-red-700 mt-2">
                This action cannot be undone. The item will be permanently deleted from the database.
              </p>
            </div>

            <div className="text-sm text-gray-600">
              This {itemToDelete?.content_type} item will be removed from the homepage display.
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Item
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}