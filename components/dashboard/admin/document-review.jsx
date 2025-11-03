"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { FileText, Eye, CheckCircle, XCircle, Clock, Search, Filter, Calendar, FileX } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
      <CardContent className="p-16 text-center">
        <div className="mx-auto w-fit p-4 bg-gray-100 rounded-full mb-6">
          <FileX className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-gray-800">No Documents Found</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {hasActiveFilters 
            ? `No results for "${searchTerm}" ${statusFilter !== 'all' ? `with status "${statusFilter}"` : ''}`
            : "There are no documents available for review."
          }
        </p>
        {hasActiveFilters && (
          <Button variant="outline" onClick={clearAllFilters}>
            <XCircle className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Document Review</h2>
        <p className="text-gray-600 mt-1">Review and verify user identity documents</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Documents" value={stats.total} icon={FileText} color="text-blue-600" />
        <StatCard title="Pending Review" value={stats.pending} icon={Clock} color="text-yellow-600" />
        <StatCard title="Approved" value={stats.approved} icon={CheckCircle} color="text-green-600" />
        <StatCard title="Rejected" value={stats.rejected} icon={XCircle} color="text-red-600" />
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or document type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10"
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.values(STATUS_TYPES).map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      {filteredDocuments.length > 0 ? (
        <div className="grid gap-4">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{doc.type}</h3>
                        <StatusBadge status={doc.status} />
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{doc.fileName}</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
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
                        <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                          <strong>Rejection Reason:</strong> {doc.rejectionReason}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReviewDocument(doc, "preview")}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {doc.status === STATUS_TYPES.PENDING && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleReviewDocument(doc, STATUS_TYPES.APPROVED)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleReviewDocument(doc, STATUS_TYPES.REJECTED)}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
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
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "preview" ? "Document Preview" : `${reviewAction} Document`}
            </DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4">
              <div className="rounded-lg bg-blue-50 p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
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
                      className={`flex-1 ${
                        reviewAction === STATUS_TYPES.APPROVED ? "bg-green-600 hover:bg-green-700" : ""
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