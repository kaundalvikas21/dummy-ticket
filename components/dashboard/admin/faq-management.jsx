"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, Eye, EyeOff, MoveUp, MoveDown } from "lucide-react"
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

export function FAQManagement() {
  const { toast } = useToast()
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedFaq, setSelectedFaq] = useState(null)
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    status: "active",
    sort_order: 0
  })

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
  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const url = selectedFaq ? `/api/faqs/${selectedFaq.id}` : '/api/faqs'
      const method = selectedFaq ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        await fetchFaqs()
        setShowAddDialog(false)
        setShowEditDialog(false)
        setFormData({ question: "", answer: "", status: "active", sort_order: 0 })
        setSelectedFaq(null)
      } else {
        console.error('Failed to save FAQ:', result.error)
      }
    } catch (error) {
      console.error('Error saving FAQ:', error)
    }
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

    // Use the current index as sort_order if not properly set
    const currentSortOrder = currentFaq.sort_order !== undefined ? currentFaq.sort_order : currentIndex
    const targetSortOrder = targetFaq.sort_order !== undefined ? targetFaq.sort_order : newIndex

    try {
      // Update current FAQ with target's sort order
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

      // Update target FAQ with current's sort order
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

      // Refresh the list
      await fetchFaqs()
    } catch (error) {
      console.error('Error moving FAQ:', error)
      // Show error message to user
      toast({
        title: "Move Failed",
        description: "Failed to move FAQ. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Open edit dialog
  const openEditDialog = (faq) => {
    setSelectedFaq(faq)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      status: faq.status,
      sort_order: faq.sort_order
    })
    setShowEditDialog(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FAQ Management</h1>
          <p className="text-gray-600">Manage frequently asked questions</p>
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
          placeholder="Search FAQs..."
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
              No FAQs found. {searchTerm ? 'Try a different search term.' : 'Create your first FAQ!'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <div
                  key={faq.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{faq.question}</h3>
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
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2">{faq.answer}</p>
                    </div>

                    <div className="flex items-center gap-2">
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add FAQ Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New FAQ</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="Enter the question"
                required
              />
            </div>

            <div>
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                placeholder="Enter the answer"
                rows={4}
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
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white">
                Add FAQ
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit FAQ Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit FAQ</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-question">Question</Label>
              <Input
                id="edit-question"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="Enter the question"
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-answer">Answer</Label>
              <Textarea
                id="edit-answer"
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                placeholder="Enter the answer"
                rows={4}
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
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white">
                Update FAQ
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
              Are you sure you want to delete this FAQ? This action cannot be undone.
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