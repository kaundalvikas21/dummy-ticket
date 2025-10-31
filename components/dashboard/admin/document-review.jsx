"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { FileText, Eye, CheckCircle, XCircle, Clock, Search, Filter, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function DocumentReview() {
  const { toast } = useToast()
  const [documents, setDocuments] = useState([
    {
      id: "ID-001",
      userId: "USR-12345",
      userName: "John Doe",
      userEmail: "john.doe@example.com",
      type: "Passport",
      fileName: "passport-john-doe.jpg",
      uploadDate: "Dec 8, 2024",
      expiryDate: "Jan 15, 2030",
      status: "Pending",
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
      expiryDate: "",
      status: "Pending",
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
      status: "Approved",
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
      expiryDate: "",
      status: "Rejected",
      reviewedBy: "Admin",
      reviewDate: "Dec 7, 2024",
      rejectionReason: "Document image is blurry and unreadable",
      frontImage: "/aadhaar-card-document.jpg",
      backImage: "/aadhaar-card-document.jpg",
    },
  ])

  const [selectedDocument, setSelectedDocument] = useState(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [reviewAction, setReviewAction] = useState("")
  const [reviewComment, setReviewComment] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const handleReviewDocument = (doc, action) => {
    setSelectedDocument(doc)
    setReviewAction(action)
    setReviewComment("")
    setIsReviewDialogOpen(true)
  }

  const handleSubmitReview = () => {
    if (reviewAction === "Rejected" && !reviewComment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      })
      return
    }

    const updatedDocuments = documents.map((doc) => {
      if (doc.id === selectedDocument.id) {
        return {
          ...doc,
          status: reviewAction,
          reviewedBy: "Admin",
          reviewDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          rejectionReason: reviewAction === "Rejected" ? reviewComment : undefined,
        }
      }
      return doc
    })

    setDocuments(updatedDocuments)
    setIsReviewDialogOpen(false)

    toast({
      title: `Document ${reviewAction}`,
      description: `${selectedDocument.type} for ${selectedDocument.userName} has been ${reviewAction.toLowerCase()}`,
    })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        )
      case "Rejected":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            <Clock className="mr-1 h-3 w-3" />
            Pending Review
          </Badge>
        )
    }
  }

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || doc.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const stats = {
    total: documents.length,
    pending: documents.filter((d) => d.status === "Pending").length,
    approved: documents.filter((d) => d.status === "Approved").length,
    rejected: documents.filter((d) => d.status === "Rejected").length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Document Review</h2>
        <p className="text-gray-600 mt-1">Review and verify user identity documents</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or document type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

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
                      {getStatusBadge(doc.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{doc.fileName}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
                      <p>
                        <strong>User:</strong> {doc.userName}
                      </p>
                      <p>
                        <strong>Email:</strong> {doc.userEmail}
                      </p>
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
                        <p>
                          <strong>Reviewed:</strong> {doc.reviewDate}
                        </p>
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
                    onClick={() => {
                      setSelectedDocument(doc)
                      setIsReviewDialogOpen(true)
                      setReviewAction("preview")
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {doc.status === "Pending" && (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleReviewDocument(doc, "Approved")}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleReviewDocument(doc, "Rejected")}>
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

      {filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No documents found matching your filters</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{reviewAction === "preview" ? "Document Preview" : `${reviewAction} Document`}</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4">
              <div className="rounded-lg bg-blue-50 p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">User Name</p>
                    <p className="font-semibold">{selectedDocument.userName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="font-semibold">{selectedDocument.userEmail}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Document Type</p>
                    <p className="font-semibold">{selectedDocument.type}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Upload Date</p>
                    <p className="font-semibold">{selectedDocument.uploadDate}</p>
                  </div>
                  {selectedDocument.expiryDate && (
                    <div>
                      <p className="text-gray-600">Expiry Date</p>
                      <p className="font-semibold">{selectedDocument.expiryDate}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">Front Image</p>
                  <div className="flex items-center justify-center bg-gray-100 rounded-lg p-4 min-h-[300px]">
                    <img
                      src={selectedDocument.frontImage || "/placeholder.svg"}
                      alt="Front"
                      className="max-w-full h-auto rounded shadow-lg"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Back Image</p>
                  <div className="flex items-center justify-center bg-gray-100 rounded-lg p-4 min-h-[300px]">
                    <img
                      src={selectedDocument.backImage || "/placeholder.svg"}
                      alt="Back"
                      className="max-w-full h-auto rounded shadow-lg"
                    />
                  </div>
                </div>
              </div>

              {reviewAction !== "preview" && (
                <div>
                  <Label>
                    {reviewAction === "Rejected" ? "Rejection Reason (Required)" : "Review Comment (Optional)"}
                  </Label>
                  <Textarea
                    placeholder={
                      reviewAction === "Rejected"
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
                      className={`flex-1 ${reviewAction === "Approved" ? "bg-green-600 hover:bg-green-700" : ""}`}
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
