"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye, Download } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

export function MyServices() {
  const { toast } = useToast()
  const [services, setServices] = useState([
    { id: "SRV-001", name: "Flight Ticket Booking", price: "$350", category: "Flight", status: "active", bookings: 45 },
    { id: "SRV-002", name: "Visa Processing", price: "$150", category: "Visa", status: "active", bookings: 32 },
    { id: "SRV-003", name: "Hotel Booking", price: "$280", category: "Hotel", status: "active", bookings: 28 },
    { id: "SRV-004", name: "Travel Insurance", price: "$50", category: "Insurance", status: "inactive", bookings: 15 },
  ])

  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    status: "active",
  })

  const handleAdd = () => {
    setIsEditing(false)
    setFormData({ name: "", price: "", category: "", description: "", status: "active" })
    setIsAddEditDialogOpen(true)
  }

  const handleEdit = (service) => {
    setIsEditing(true)
    setSelectedService(service)
    setFormData({
      name: service.name,
      price: service.price,
      category: service.category,
      description: "Service description here",
      status: service.status,
    })
    setIsAddEditDialogOpen(true)
  }

  const handleView = (service) => {
    setSelectedService(service)
    setIsViewDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.name || !formData.price || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (isEditing && selectedService) {
      setServices(
        services.map((s) =>
          s.id === selectedService.id
            ? {
                ...s,
                name: formData.name,
                price: formData.price,
                category: formData.category,
                status: formData.status,
              }
            : s,
        ),
      )
      toast({
        title: "Service updated",
        description: "Your service has been updated successfully",
      })
    } else {
      const newService = {
        id: `SRV-${String(services.length + 1).padStart(3, "0")}`,
        name: formData.name,
        price: formData.price,
        category: formData.category,
        status: formData.status,
        bookings: 0,
      }
      setServices([...services, newService])
      toast({
        title: "Service added",
        description: "New service has been added successfully",
      })
    }

    setIsAddEditDialogOpen(false)
  }

  const handleDeleteClick = (id) => {
    setServiceToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (serviceToDelete) {
      setServices(services.filter((s) => s.id !== serviceToDelete))
      toast({
        title: "Service deleted",
        description: "Service has been removed successfully",
      })
      setIsDeleteDialogOpen(false)
      setServiceToDelete(null)
    }
  }

  const handleExport = () => {
    const csv = [
      ["Service ID", "Name", "Price", "Category", "Status", "Total Bookings"].join(","),
      ...services.map((service) =>
        [service.id, service.name, service.price, service.category, service.status, service.bookings].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `services-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Successful",
      description: "Services have been exported to CSV.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Services</h1>
          <p className="text-gray-600 mt-1">Manage your service offerings</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white" onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{service.name}</CardTitle>
                <Badge
                  className={service.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}
                >
                  {service.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Price</span>
                  <span className="text-lg font-bold text-gray-900">{service.price}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Category</span>
                  <span className="text-sm font-medium text-gray-900">{service.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Bookings</span>
                  <span className="text-sm font-medium text-gray-900">{service.bookings}</span>
                </div>
                <div className="flex items-center gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => handleView(service)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => handleEdit(service)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteClick(service.id)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Service Details - {selectedService?.id}</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Service Name</Label>
                  <p className="font-semibold">{selectedService.name}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Price</Label>
                  <p className="font-semibold">{selectedService.price}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Category</Label>
                  <p className="font-semibold">{selectedService.category}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Status</Label>
                  <Badge
                    className={
                      selectedService.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    }
                  >
                    {selectedService.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-gray-600">Total Bookings</Label>
                  <p className="font-semibold">{selectedService.bookings}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Service" : "Add New Service"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Flight Ticket Booking"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="$350"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Flight"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your service..."
                rows={4}
              />
            </div>
            <div className="flex items-center justify-between space-y-2 pt-4 border-t">
              <div className="space-y-0.5">
                <Label htmlFor="status">Service Status</Label>
                <p className="text-sm text-gray-500">Make this service available to customers</p>
              </div>
              <Switch
                id="status"
                checked={formData.status === "active"}
                onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? "active" : "inactive" })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white" onClick={handleSave}>
              {isEditing ? "Update Service" : "Add Service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the service.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
