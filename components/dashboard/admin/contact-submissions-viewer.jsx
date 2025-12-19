"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Eye, Trash2, CheckCircle, Clock, AlertTriangle, User, Mail, Phone, Calendar, ChevronLeft, ChevronRight, Save, X, MessageSquare, RefreshCw } from "lucide-react"
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { SkeletonTable } from "@/components/ui/skeleton-table"
import { ChevronDown } from "lucide-react"

export function ContactSubmissionsViewer() {
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
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState("desc")

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const limit = 10

  // Dialog states
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // Form data for editing
  const [editFormData, setEditFormData] = useState({
    status: "",
    priority: "",
    admin_notes: ""
  })

  // Status and priority options with styling
  const statusOptions = [
    { value: "pending", label: "Pending", className: "bg-yellow-100 text-yellow-800", icon: Clock },
    { value: "in_progress", label: "In Progress", className: "bg-blue-100 text-blue-800", icon: MessageSquare },
    { value: "resolved", label: "Resolved", className: "bg-green-100 text-green-800", icon: CheckCircle },
    { value: "closed", label: "Closed", className: "bg-gray-100 text-gray-800", icon: X }
  ]

  const priorityOptions = [
    { value: "low", label: "Low", className: "bg-gray-100 text-gray-800" },
    { value: "normal", label: "Normal", className: "bg-blue-100 text-blue-800" },
    { value: "high", label: "High", className: "bg-orange-100 text-orange-800" },
    { value: "urgent", label: "Urgent", className: "bg-red-100 text-red-800", icon: AlertTriangle }
  ]

  // Fetch submissions
  const fetchSubmissions = async (page = currentPage) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder
      })

      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter)
      if (priorityFilter && priorityFilter !== 'all') params.append('priority', priorityFilter)
      if (searchTerm) params.append('search', searchTerm)

      const headers = await getAuthHeaders()
      const response = await fetch(`/api/contact/submissions?${params}`, {
        headers
      })
      const result = await response.json()

      if (response.ok) {
        setSubmissions(result.submissions || [])
        setTotalPages(result.pagination?.totalPages || 1)
        setTotalCount(result.pagination?.totalCount || 0)
        setCurrentPage(result.pagination?.currentPage || 1)
      } else {
        console.error('Failed to fetch submissions:', result.error)
        toast({
          title: "Error",
          description: "Failed to fetch contact submissions",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching submissions:', error)
      toast({
        title: "Error",
        description: "Failed to fetch contact submissions",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Filters logic
  const activeFiltersCount =
    (statusFilter !== "all" ? 1 : 0) +
    (priorityFilter !== "all" ? 1 : 0) +
    (searchTerm ? 1 : 0)

  const clearAllFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setPriorityFilter("all")
    setSortBy("created_at")
    setSortOrder("desc")
  }

  useEffect(() => {
    fetchSubmissions(1)
  }, [statusFilter, priorityFilter, sortBy, sortOrder, searchTerm])

  // Handle view submission
  const handleView = (submission) => {
    setSelectedSubmission(submission)
    setEditFormData({
      status: submission.status,
      priority: submission.priority,
      admin_notes: submission.admin_notes || ""
    })
    setShowViewDialog(true)
  }

  // Handle update submission
  const handleUpdate = async () => {
    if (!selectedSubmission) return

    setIsUpdating(true)
    try {
      const headers = await getAuthHeaders()
      const response = await fetch('/api/contact/submissions', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          id: selectedSubmission.id,
          status: editFormData.status,
          priority: editFormData.priority,
          admin_notes: editFormData.admin_notes
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Submission updated successfully"
        })

        fetchSubmissions(currentPage)

        // Update the selected submission
        setSelectedSubmission({
          ...selectedSubmission,
          ...result.submission
        })

        // Close the modal automatically
        setShowViewDialog(false)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update submission",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating submission:', error)
      toast({
        title: "Error",
        description: "Failed to update submission",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle delete submission
  const handleDelete = async () => {
    if (!selectedSubmission) return

    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`/api/contact/submissions?id=${selectedSubmission.id}`, {
        method: 'DELETE',
        headers
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Submission deleted successfully"
        })

        fetchSubmissions(currentPage)
        setShowDeleteDialog(false)
        setShowViewDialog(false)
        setSelectedSubmission(null)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete submission",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting submission:', error)
      toast({
        title: "Error",
        description: "Failed to delete submission",
        variant: "destructive"
      })
    }
  }

  // Handle manual refresh
  const handleRefresh = async () => {
    await fetchSubmissions(currentPage)
  }

  // Get status badge component
  const getStatusBadge = (status) => {
    const statusConfig = statusOptions.find(s => s.value === status) || statusOptions[0]
    const Icon = statusConfig.icon
    return (
      <Badge className={statusConfig.className}>
        {Icon && <Icon className="w-3 h-3 mr-1" />}
        {statusConfig.label}
      </Badge>
    )
  }

  // Get priority badge component
  const getPriorityBadge = (priority) => {
    const priorityConfig = priorityOptions.find(p => p.value === priority) || priorityOptions[1]
    const Icon = priorityConfig.icon
    return (
      <Badge className={priorityConfig.className}>
        {Icon && <Icon className="w-3 h-3 mr-1" />}
        {priorityConfig.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Submissions</h1>
          <p className="text-gray-600 mt-1">View and manage contact form submissions</p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-[44px]"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center justify-between w-full sm:w-auto min-w-[140px] h-[44px] px-3 py-2 text-sm font-medium transition-colors bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Filters</span>
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="px-1.5 py-0 h-5 bg-blue-100 text-blue-700 hover:bg-blue-100 border-none text-[10px] font-bold uppercase tracking-wider">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 ml-auto text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 max-h-[80vh] overflow-y-auto">
                <DropdownMenuItem
                  onClick={clearAllFilters}
                  className="text-red-600 focus:text-red-600 cursor-pointer font-medium bg-red-50/50 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All Filters
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                  <DropdownMenuRadioItem value="all">All Statuses</DropdownMenuRadioItem>
                  {statusOptions.map(status => (
                    <DropdownMenuRadioItem key={status.value} value={status.value}>
                      {status.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>

                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={priorityFilter} onValueChange={setPriorityFilter}>
                  <DropdownMenuRadioItem value="all">All Priorities</DropdownMenuRadioItem>
                  {priorityOptions.map(priority => (
                    <DropdownMenuRadioItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>



              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-sm transition-all duration-300 bg-gray-50 hover:shadow-lg hover:bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-black-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm transition-all duration-300 bg-yellow-50 hover:shadow-lg hover:bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {submissions.filter(s => s.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm transition-all duration-300 bg-blue-50 hover:shadow-lg hover:bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {submissions.filter(s => s.status === 'in_progress').length}
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm transition-all duration-300 bg-red-50 hover:shadow-lg hover:bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-red-600">
                  {submissions.filter(s => s.priority === 'urgent').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions List */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <SkeletonTable rows={5} columns={6} />
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter || priorityFilter
                  ? "Try adjusting your filters or search terms"
                  : "No contact form submissions have been received yet"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {submission.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {submission.email}
                            </span>
                          </div>
                          {submission.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {submission.phone}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="text-sm text-gray-900 font-medium truncate">
                            {submission.subject}
                          </p>
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {submission.message}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getPriorityBadge(submission.priority)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(submission.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {new Date(submission.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(submission)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedSubmission(submission)
                              setShowDeleteDialog(true)
                            }}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalCount)} of {totalCount} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchSubmissions(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchSubmissions(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* View/Edit Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contact Submission Details</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label>Name</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{selectedSubmission.name}</span>
                    </div>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{selectedSubmission.email}</span>
                    </div>
                  </div>
                  {selectedSubmission.phone && (
                    <div>
                      <Label>Phone</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{selectedSubmission.phone}</span>
                      </div>
                    </div>
                  )}
                  <div>
                    <Label>Submitted</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {new Date(selectedSubmission.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Message</h3>
                <div>
                  <Label>Subject</Label>
                  <p className="text-sm text-gray-900 mt-1">{selectedSubmission.subject}</p>
                </div>
                <div>
                  <Label>Message</Label>
                  <div className="bg-gray-50 p-3 rounded-lg mt-1">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {selectedSubmission.message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status and Priority */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Status & Priority</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label htmlFor="edit-priority">Priority</Label>
                    <Select
                      value={editFormData.priority}
                      onValueChange={(value) => setEditFormData(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map(priority => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-status">Status</Label>
                    <Select
                      value={editFormData.status}
                      onValueChange={(value) => setEditFormData(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(status => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-3">
                <Label htmlFor="admin-notes">Admin Notes</Label>
                <Textarea
                  id="admin-notes"
                  value={editFormData.admin_notes}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, admin_notes: e.target.value }))}
                  placeholder="Add notes about this submission..."
                  rows={4}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedSubmission(selectedSubmission)
                    setShowDeleteDialog(true)
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                  <Button onClick={handleUpdate} disabled={isUpdating}>
                    <Save className="w-4 h-4 mr-2" />
                    {isUpdating ? "Updating..." : "Update"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contact submission from {selectedSubmission?.name}? This action cannot be undone.
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