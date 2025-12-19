"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { FileText, Eye, CheckCircle, XCircle, Clock, Search, Filter, Calendar, FileX, ChevronDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu"

// Constants
const STATUS_TYPES = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected"
}

const STATUS_CONFIG = {
  [STATUS_TYPES.APPROVED]: {
    badge: "bg-green-100 text-green-700",
    icon: CheckCircle,
    color: "text-green-600"
  },
  [STATUS_TYPES.REJECTED]: {
    badge: "bg-red-100 text-red-700",
    icon: XCircle,
    color: "text-red-600"
  },
  [STATUS_TYPES.PENDING]: {
    badge: "bg-yellow-100 text-yellow-700",
    icon: Clock,
    color: "text-yellow-600"
  }
}

// Initial sample data
const INITIAL_DOCUMENTS = [
  {
    id: "ID-001",
    userId: "USR-12345",
    userName: "John Doe",
    userEmail: "john.doe@example.com",
    type: "Passport",
    fileName: "passport-john-doe.jpg",
    uploadDate: "Dec 8, 2024",
    expiryDate: "Jan 15, 2030",
    status: STATUS_TYPES.PENDING,
    frontImage: "/passport-document.jpg",
    backImage: "/passport-document.jpg",
  },
  {
    id: "ID-002",
    userId: "USR-12346",
    userName: "Jane Smith",
    userEmail: "jane.smith@example.com",
    type: "PAN Card",
    fileName: "pan-card-jane.jpg",
    uploadDate: "Dec 9, 2024",
    status: STATUS_TYPES.PENDING,
    frontImage: "/pan-card-document.jpg",
    backImage: "/pan-card-document.jpg",
  },
  {
    id: "ID-003",
    userId: "USR-12347",
    userName: "Mike Johnson",
    userEmail: "mike.j@example.com",
    type: "Driving License",
    fileName: "dl-mike.jpg",
    uploadDate: "Dec 7, 2024",
    expiryDate: "Mar 20, 2028",
    status: STATUS_TYPES.APPROVED,
    reviewedBy: "Admin",
    reviewDate: "Dec 8, 2024",
    frontImage: "/driving-license-document.jpg",
    backImage: "/driving-license-document.jpg",
  },
  {
    id: "ID-004",
    userId: "USR-12348",
    userName: "Sarah Williams",
    userEmail: "sarah.w@example.com",
    type: "Aadhaar Card",
    fileName: "aadhaar-sarah.jpg",
    uploadDate: "Dec 6, 2024",
    status: STATUS_TYPES.REJECTED,
    reviewedBy: "Admin",
    reviewDate: "Dec 7, 2024",
    rejectionReason: "Document image is blurry and unreadable",
    frontImage: "/aadhaar-card-document.jpg",
    backImage: "/aadhaar-card-document.jpg",
  },
]

export function DocumentReview() {
  const { toast } = useToast()
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [reviewAction, setReviewAction] = useState("")
  const [reviewComment, setReviewComment] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")


  // Memoized calculations
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const searchMatch = !searchTerm ||
        [doc.userName, doc.userEmail, doc.type]
          .some(field => field.toLowerCase().includes(searchTerm.toLowerCase()))

      const statusMatch = statusFilter === "all" || doc.status === statusFilter

      return searchMatch && statusMatch
    })
  }, [documents, searchTerm, statusFilter])

  const stats = useMemo(() => ({
    total: documents.length,
    pending: documents.filter(d => d.status === STATUS_TYPES.PENDING).length,
    approved: documents.filter(d => d.status === STATUS_TYPES.APPROVED).length,
    rejected: documents.filter(d => d.status === STATUS_TYPES.REJECTED).length,
  }), [documents])

  const hasActiveFilters = searchTerm || statusFilter !== "all"
  const activeFiltersCount = (statusFilter !== "all" ? 1 : 0) + (searchTerm ? 1 : 0)

  // Handlers
  const handleReviewDocument = (doc, action) => {
    setSelectedDocument(doc)
    setReviewAction(action)
    setReviewComment("")
    setIsReviewDialogOpen(true)
  }

  const handleSubmitReview = () => {
    if (reviewAction === STATUS_TYPES.REJECTED && !reviewComment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      })
      return
    }

    setDocuments(prev => prev.map(doc =>
      doc.id === selectedDocument.id
        ? {
          ...doc,
          status: reviewAction,
          reviewedBy: "Admin",
          reviewDate: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
          }),
          ...(reviewAction === STATUS_TYPES.REJECTED && { rejectionReason: reviewComment })
        }
        : doc
    ))

    setIsReviewDialogOpen(false)
    toast({
      title: `Document ${reviewAction}`,
      description: `${selectedDocument.type} for ${selectedDocument.userName} has been ${reviewAction.toLowerCase()}`,
    })
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
  }

  // Components
  const StatusBadge = ({ status }) => {
    const config = STATUS_CONFIG[status]
    const Icon = config.icon
    return (
      <Badge className={`${config.badge} hover:${config.badge}`}>
        <Icon className="mr-1 h-3 w-3" />
        {status}
      </Badge>
    )
  }

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  )

  const EmptyState = () => (
    <Card className="border-dashed">
      <CardContent className="p-8 sm:p-12 lg:p-16 text-center">
        <div className="mx-auto w-fit p-3 sm:p-4 bg-gray-100 rounded-full mb-4 sm:mb-6">
          <FileX className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">No Documents Found</h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto">
          {hasActiveFilters
            ? `No results for "${searchTerm}" ${statusFilter !== 'all' ? `with status "${statusFilter}"` : ''}`
            : "There are no documents available for review."
          }
        </p>
        {hasActiveFilters && (
          <Button variant="outline" onClick={clearAllFilters} className="min-h-[44px]">
            <XCircle className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Document Review</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Review and verify user identity documents</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Documents" value={stats.total} icon={FileText} color="text-blue-600" />
        <StatCard title="Pending Review" value={stats.pending} icon={Clock} color="text-yellow-600" />
        <StatCard title="Approved" value={stats.approved} icon={CheckCircle} color="text-green-600" />
        <StatCard title="Rejected" value={stats.rejected} icon={XCircle} color="text-red-600" />
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or document type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 h-[44px]"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center justify-between w-full sm:w-[180px] h-[44px] px-3 py-2 text-sm font-medium transition-colors bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Filters</span>
                    {statusFilter !== "all" && (
                      <Badge variant="secondary" className="px-1.5 py-0 h-5 bg-blue-100 text-blue-700 hover:bg-blue-100 border-none text-[10px] font-bold uppercase tracking-wider">
                        {statusFilter}
                      </Badge>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 ml-auto text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={clearAllFilters}
                  className="text-red-600 focus:text-red-600 cursor-pointer font-medium bg-red-50/50 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Clear All Filters
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={statusFilter === "all"}
                  onCheckedChange={() => setStatusFilter("all")}
                >
                  All Status
                </DropdownMenuCheckboxItem>
                {Object.values(STATUS_TYPES).map(status => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={statusFilter === status}
                    onCheckedChange={() => setStatusFilter(status)}
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
                ))}

              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      {filteredDocuments.length > 0 ? (
        <div className="grid gap-3 sm:gap-4">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="p-3 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex items-start gap-3 sm:gap-4 flex-1">
                    <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
                      <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className="font-semibold text-base sm:text-lg">{doc.type}</h3>
                        <StatusBadge status={doc.status} />
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 truncate">{doc.fileName}</p>
                      <div className="grid gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-600 grid-cols-1 sm:grid-cols-2">
                        <p><strong>User:</strong> {doc.userName}</p>
                        <p><strong>Email:</strong> {doc.userEmail}</p>
                        <p className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <strong>Uploaded:</strong> {doc.uploadDate}
                        </p>
                        {doc.expiryDate && (
                          <p className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <strong>Expires:</strong> {doc.expiryDate}
                          </p>
                        )}
                        {doc.reviewDate && (
                          <p><strong>Reviewed:</strong> {doc.reviewDate}</p>
                        )}
                      </div>
                      {doc.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-xs sm:text-sm text-red-700">
                          <strong>Rejection Reason:</strong> {doc.rejectionReason}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 lg:flex-col">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReviewDocument(doc, "preview")}
                      className="min-h-[40px] px-3"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {doc.status === STATUS_TYPES.PENDING && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 min-h-[40px] px-3"
                          onClick={() => handleReviewDocument(doc, STATUS_TYPES.APPROVED)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          <span className="hidden sm:inline">Approve</span>
                          <span className="sm:hidden">✓</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReviewDocument(doc, STATUS_TYPES.REJECTED)}
                          className="min-h-[40px] px-3"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          <span className="hidden sm:inline">Reject</span>
                          <span className="sm:hidden">✗</span>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState />
      )}

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "preview" ? "Document Preview" : `${reviewAction} Document`}
            </DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4">
              <div className="rounded-lg bg-blue-50 p-3 sm:p-4">
                <div className="grid gap-3 sm:gap-4 text-sm grid-cols-1 sm:grid-cols-2">
                  {[
                    ["User Name", selectedDocument.userName],
                    ["Email", selectedDocument.userEmail],
                    ["Document Type", selectedDocument.type],
                    ["Upload Date", selectedDocument.uploadDate],
                    ...(selectedDocument.expiryDate ? [["Expiry Date", selectedDocument.expiryDate]] : [])
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-gray-600">{label}</p>
                      <p className="font-semibold">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {["Front", "Back"].map(side => (
                  <div key={side}>
                    <p className="text-sm font-medium mb-2">{side} Image</p>
                    <div className="flex items-center justify-center bg-gray-100 rounded-lg p-4 min-h-[300px]">
                      <img
                        src={selectedDocument[`${side.toLowerCase()}Image`] || "/placeholder.svg"}
                        alt={side}
                        className="max-w-full h-auto rounded shadow-lg"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {reviewAction !== "preview" && (
                <div>
                  <Label>
                    {reviewAction === STATUS_TYPES.REJECTED
                      ? "Rejection Reason (Required)"
                      : "Review Comment (Optional)"}
                  </Label>
                  <Textarea
                    placeholder={
                      reviewAction === STATUS_TYPES.REJECTED
                        ? "Please provide a reason for rejection..."
                        : "Add any comments about this document..."
                    }
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={4}
                    className="mt-2"
                  />
                </div>
              )}

              <div className="flex gap-2">
                {reviewAction !== "preview" ? (
                  <>
                    <Button
                      className={`flex-1 ${reviewAction === STATUS_TYPES.APPROVED ? "bg-green-600 hover:bg-green-700" : ""
                        }`}
                      onClick={handleSubmitReview}
                    >
                      Confirm {reviewAction}
                    </Button>
                    <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button className="w-full" onClick={() => setIsReviewDialogOpen(false)}>
                    Close
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}