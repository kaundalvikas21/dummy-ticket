"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Eye, Calendar, Upload, X, CheckCircle, Clock, XCircle, Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export const TravelDocuments = ({ setActiveSection }) => {
  const { toast } = useToast()
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingDocumentId, setEditingDocumentId] = useState(null)
  const [uploadedDocuments, setUploadedDocuments] = useState([
    {
      id: "ID-001",
      type: "Passport",
      fileName: "passport-john-doe.jpg",
      uploadDate: "Dec 8, 2024",
      expiryDate: "Jan 15, 2030",
      status: "Approved",
      reviewedBy: "Admin",
      frontImage: "/passport-document.jpg",
      backImage: "/passport-document.jpg",
    },
    {
      id: "ID-002",
      type: "PAN Card",
      fileName: "pan-card.jpg",
      uploadDate: "Dec 9, 2024",
      expiryDate: "",
      status: "Pending",
      reviewedBy: null,
      frontImage: "/pan-card-document.jpg",
      backImage: "/pan-card-document.jpg",
    },
  ])

  const [newDocument, setNewDocument] = useState({
    type: "",
    frontFile: null,
    backFile: null,
    frontPreview: null,
    backPreview: null,
    expiryDate: "",
  })

  const documents = [
    {
      id: "DOC-001",
      bookingId: "TKT-12345",
      type: "Dummy Ticket",
      name: "dummy-ticket-TKT-12345.pdf",
      date: "Dec 10, 2024",
      size: "245 KB",
      status: "Available",
    },
    {
      id: "DOC-002",
      bookingId: "TKT-12345",
      type: "Invoice",
      name: "invoice-TKT-12345.pdf",
      date: "Dec 10, 2024",
      size: "128 KB",
      status: "Available",
    },
    {
      id: "DOC-003",
      bookingId: "TKT-12346",
      type: "Dummy Ticket",
      name: "dummy-ticket-TKT-12346.pdf",
      date: "Dec 12, 2024",
      size: "238 KB",
      status: "Processing",
    },
  ]

  const handleFileSelect = (e, side) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive",
      })
      e.target.value = ""
      return
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png"]
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload JPG or PNG files only",
        variant: "destructive",
      })
      e.target.value = ""
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      if (side === "front") {
        setNewDocument({
          ...newDocument,
          frontFile: file,
          frontPreview: reader.result,
        })
      } else {
        setNewDocument({
          ...newDocument,
          backFile: file,
          backPreview: reader.result,
        })
      }
      toast({
        title: "File Selected",
        description: `${side === "front" ? "Front" : "Back"} image selected: ${file.name}`,
      })
    }
    reader.onerror = () => {
      toast({
        title: "Error Reading File",
        description: "Please try selecting the file again",
        variant: "destructive",
      })
    }
    reader.readAsDataURL(file)
  }

  const handleUploadDocument = () => {
    if (!newDocument.type) {
      toast({
        title: "Missing Document Type",
        description: "Please select the type of document you're uploading",
        variant: "destructive",
      })
      return
    }

    if (!newDocument.frontFile || !newDocument.backFile) {
      toast({
        title: "Missing Images",
        description: "Please upload both front and back images of the document",
        variant: "destructive",
      })
      return
    }

    if (isEditMode && editingDocumentId) {
      const updatedDocuments = uploadedDocuments.map((doc) => {
        if (doc.id === editingDocumentId) {
          return {
            ...doc,
            type: newDocument.type,
            fileName: newDocument.frontFile.name,
            uploadDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            expiryDate: newDocument.expiryDate,
            status: "Pending",
            reviewedBy: null,
            frontImage: newDocument.frontPreview,
            backImage: newDocument.backPreview,
          }
        }
        return doc
      })

      setUploadedDocuments(updatedDocuments)
      setNewDocument({
        type: "",
        frontFile: null,
        backFile: null,
        frontPreview: null,
        backPreview: null,
        expiryDate: "",
      })
      setIsUploadDialogOpen(false)
      setIsEditMode(false)
      setEditingDocumentId(null)

      toast({
        title: "Document Updated",
        description: `${newDocument.type} has been updated and is pending admin review`,
      })
      return
    }

    const newDoc = {
      id: `ID-${String(uploadedDocuments.length + 3).padStart(3, "0")}`,
      type: newDocument.type,
      fileName: newDocument.frontFile.name,
      uploadDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      expiryDate: newDocument.expiryDate,
      status: "Pending",
      reviewedBy: null,
      frontImage: newDocument.frontPreview,
      backImage: newDocument.backPreview,
    }

    setUploadedDocuments([newDoc, ...uploadedDocuments])
    setNewDocument({ type: "", frontFile: null, backFile: null, frontPreview: null, backPreview: null, expiryDate: "" })
    setIsUploadDialogOpen(false)

    toast({
      title: "Upload Successful",
      description: `${newDocument.type} has been uploaded and is pending admin review`,
    })
  }

  const handleEditDocument = (doc) => {
    if (doc.status !== "Pending") {
      toast({
        title: "Cannot Edit",
        description: "Only pending documents can be edited. Approved or rejected documents cannot be modified.",
        variant: "destructive",
      })
      return
    }

    setIsEditMode(true)
    setEditingDocumentId(doc.id)
    setNewDocument({
      type: doc.type,
      frontFile: null,
      backFile: null,
      frontPreview: null,
      backPreview: null,
      expiryDate: doc.expiryDate || "",
    })
    setIsUploadDialogOpen(true)
  }

  const handleDeleteDocument = (docId) => {
    setUploadedDocuments(uploadedDocuments.filter((doc) => doc.id !== docId))
    toast({
      title: "Document Deleted",
      description: "Document has been removed successfully",
    })
  }

  const handlePreviewUploadedDocument = (doc) => {
    setSelectedDocument(doc)
    setIsPreviewOpen(true)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Travel Documents</h2>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Identity Documents</CardTitle>
          <Button
            onClick={() => {
              setIsEditMode(false)
              setEditingDocumentId(null)
              setIsUploadDialogOpen(true)
            }}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Upload your identity documents for admin verification. Upload both front and back images of each document.
            These documents help verify your identity for travel bookings.
          </p>

          {uploadedDocuments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No documents uploaded yet</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {uploadedDocuments.map((doc) => (
                <Card key={doc.id} className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{doc.type}</h3>
                          <p className="text-xs text-gray-600">{doc.fileName}</p>
                        </div>
                      </div>
                      {getStatusBadge(doc.status)}
                    </div>

                    <div className="flex flex-col gap-1 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Uploaded: {doc.uploadDate}
                      </span>
                      {doc.expiryDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Expires: {doc.expiryDate}
                        </span>
                      )}
                      {doc.reviewedBy && <span>Reviewed by: {doc.reviewedBy}</span>}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => handlePreviewUploadedDocument(doc)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                      {doc.status === "Pending" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleEditDocument(doc)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteDocument(doc.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">About Identity Documents</h3>
              <p className="text-sm text-gray-600">
                Identity documents are verified by admin for travel bookings. Upload clear, valid documents with both
                front and back images. You can only edit or replace documents that are pending review. Once approved or
                rejected, documents cannot be modified.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            If you're having trouble accessing your documents or need assistance, our support team is here to help.
          </p>
          <Button variant="outline" onClick={() => setActiveSection?.("support")}>
            Contact Support
          </Button>
        </CardContent>
      </Card>

      <Dialog
        open={isUploadDialogOpen}
        onOpenChange={(open) => {
          setIsUploadDialogOpen(open)
          if (!open) {
            setIsEditMode(false)
            setEditingDocumentId(null)
            setNewDocument({
              type: "",
              frontFile: null,
              backFile: null,
              frontPreview: null,
              backPreview: null,
              expiryDate: "",
            })
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{isEditMode ? "Replace Identity Document" : "Upload Identity Document"}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-1">
            <div className="space-y-4 py-4">
              {isEditMode && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    You are replacing an existing document. The new document will be sent for admin review.
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="document-type">Document Type *</Label>
                <Select
                  value={newDocument.type}
                  onValueChange={(value) => setNewDocument({ ...newDocument, type: value })}
                >
                  <SelectTrigger id="document-type">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Passport">Passport</SelectItem>
                    <SelectItem value="PAN Card">PAN Card</SelectItem>
                    <SelectItem value="Driving License">Driving License</SelectItem>
                    <SelectItem value="Aadhaar Card">Aadhaar Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="expiry-date">Expiry Date (Optional)</Label>
                <Input
                  id="expiry-date"
                  type="date"
                  value={newDocument.expiryDate}
                  onChange={(e) => setNewDocument({ ...newDocument, expiryDate: e.target.value })}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty if document doesn't expire</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="front-upload">Front Image *</Label>
                  <div className="mt-2">
                    <Input
                      id="front-upload"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={(e) => handleFileSelect(e, "front")}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG (Max 5MB)</p>
                  </div>
                  {newDocument.frontPreview && (
                    <div className="mt-3 border rounded-lg p-2 bg-gray-50">
                      <p className="text-xs font-medium mb-2">Front Preview:</p>
                      <div className="h-[200px] overflow-hidden border rounded bg-white">
                        <img
                          src={newDocument.frontPreview || "/placeholder.svg"}
                          alt="Front preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="back-upload">Back Image *</Label>
                  <div className="mt-2">
                    <Input
                      id="back-upload"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={(e) => handleFileSelect(e, "back")}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG (Max 5MB)</p>
                  </div>
                  {newDocument.backPreview && (
                    <div className="mt-3 border rounded-lg p-2 bg-gray-50">
                      <p className="text-xs font-medium mb-2">Back Preview:</p>
                      <div className="h-[200px] overflow-hidden border rounded bg-white">
                        <img
                          src={newDocument.backPreview || "/placeholder.svg"}
                          alt="Back preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t flex-shrink-0">
            <Button
              className="flex-1"
              onClick={handleUploadDocument}
              disabled={!newDocument.type || !newDocument.frontFile || !newDocument.backFile}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isEditMode ? "Replace Document" : "Upload Document"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsUploadDialogOpen(false)
                setIsEditMode(false)
                setEditingDocumentId(null)
                setNewDocument({
                  type: "",
                  frontFile: null,
                  backFile: null,
                  frontPreview: null,
                  backPreview: null,
                  expiryDate: "",
                })
              }}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-blue-50 p-4">
                <div>
                  <p className="font-semibold">{selectedDocument.fileName || selectedDocument.name}</p>
                  <p className="text-sm text-gray-600">{selectedDocument.type}</p>
                  {selectedDocument.expiryDate && (
                    <p className="text-sm text-gray-600">Expires: {selectedDocument.expiryDate}</p>
                  )}
                </div>
                {selectedDocument.status && getStatusBadge(selectedDocument.status)}
              </div>

              {selectedDocument.frontImage && selectedDocument.backImage ? (
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
              ) : (
                <div className="flex items-center justify-center bg-gray-100 rounded-lg p-8 min-h-[400px]">
                  <img
                    src={
                      selectedDocument.previewUrl ||
                      `/placeholder.svg?height=600&width=800&query=document-preview-${selectedDocument.type || "/placeholder.svg"}`
                    }
                    alt={selectedDocument.fileName || selectedDocument.name}
                    className="max-w-full h-auto rounded shadow-lg"
                  />
                </div>
              )}

              {selectedDocument.reviewedBy && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Reviewed by:</strong> {selectedDocument.reviewedBy}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Upload Date:</strong> {selectedDocument.uploadDate}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
