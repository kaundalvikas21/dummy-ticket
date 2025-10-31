"use client"

import { useState } from "react"
import { Search, Plus, Eye, Edit, Trash2, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { Label } from "@/components/ui/label"

export function VendorsManagement() {
  const [vendors, setVendors] = useState([
    {
      id: "VEN-001",
      name: "Global Travel Agency",
      email: "contact@globaltravel.com",
      phone: "+1 234 567 8900",
      totalBookings: 145,
      revenue: "$5,075.00",
      status: "active",
      joinDate: "2024-10-01",
      address: "123 Business St, New York, NY",
      commission: "15%",
    },
    {
      id: "VEN-002",
      name: "Sky High Tours",
      email: "info@skyhightours.com",
      phone: "+1 234 567 8901",
      totalBookings: 98,
      revenue: "$3,430.00",
      status: "active",
      joinDate: "2024-11-15",
      address: "456 Travel Ave, Los Angeles, CA",
      commission: "12%",
    },
    {
      id: "VEN-003",
      name: "Wanderlust Travels",
      email: "hello@wanderlust.com",
      phone: "+1 234 567 8902",
      totalBookings: 67,
      revenue: "$2,345.00",
      status: "pending",
      joinDate: "2025-01-05",
      address: "789 Journey Rd, Chicago, IL",
      commission: "10%",
    },
  ])

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [vendorToDelete, setVendorToDelete] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    commission: "",
  })

  const filteredVendors = vendors.filter(
    (vendor) =>
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleView = (vendor) => {
    setSelectedVendor(vendor)
    setIsViewDialogOpen(true)
  }

  const handleAdd = () => {
    setIsEditing(false)
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      commission: "",
    })
    setIsAddEditDialogOpen(true)
  }

  const handleEdit = (vendor) => {
    setIsEditing(true)
    setSelectedVendor(vendor)
    setFormData({
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address,
      commission: vendor.commission,
    })
    setIsAddEditDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      alert("Please fill in all required fields")
      return
    }

    if (isEditing && selectedVendor) {
      setVendors(
        vendors.map((vendor) =>
          vendor.id === selectedVendor.id
            ? {
                ...vendor,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                commission: formData.commission,
              }
            : vendor,
        ),
      )
    } else {
      const newVendor = {
        id: `VEN-${String(vendors.length + 1).padStart(3, "0")}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        commission: formData.commission,
        totalBookings: 0,
        revenue: "$0.00",
        status: "pending",
        joinDate: new Date().toISOString().split("T")[0],
      }
      setVendors([...vendors, newVendor])
    }

    setIsAddEditDialogOpen(false)
  }

  const handleDeleteClick = (id) => {
    setVendorToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (vendorToDelete) {
      setVendors(vendors.filter((vendor) => vendor.id !== vendorToDelete))
      setIsDeleteDialogOpen(false)
      setVendorToDelete(null)
    }
  }

  const handleApprove = (id) => {
    setVendors(vendors.map((vendor) => (vendor.id === id ? { ...vendor, status: "active" } : vendor)))
  }

  const handleReject = (id) => {
    setVendors(vendors.map((vendor) => (vendor.id === id ? { ...vendor, status: "rejected" } : vendor)))
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendors Management</h1>
          <p className="text-gray-600 mt-1">Manage travel agencies and vendor partners</p>
        </div>
        <Button className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white" onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Vendor
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search vendors by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Vendors Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Vendors ({filteredVendors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Vendor</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Contact</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total Bookings</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Revenue</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Join Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-gradient-to-br from-[#0066FF] to-[#00D4AA] text-white">
                            {vendor.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{vendor.name}</span>
                          <span className="text-xs text-gray-500">{vendor.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-600">{vendor.email}</span>
                        <span className="text-xs text-gray-600">{vendor.phone}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{vendor.totalBookings}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">{vendor.revenue}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={vendor.status === "active" ? "default" : "outline"}
                        className={
                          vendor.status === "active"
                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                            : vendor.status === "pending"
                              ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                              : "bg-red-100 text-red-700 hover:bg-red-100"
                        }
                      >
                        {vendor.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{vendor.joinDate}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleView(vendor)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(vendor)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        {vendor.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600"
                              onClick={() => handleApprove(vendor.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                              onClick={() => handleReject(vendor.id)}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteClick(vendor.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vendor Details - {selectedVendor?.id}</DialogTitle>
          </DialogHeader>
          {selectedVendor && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-gradient-to-br from-[#0066FF] to-[#00D4AA] text-white text-xl">
                    {selectedVendor.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{selectedVendor.name}</h3>
                  <p className="text-sm text-gray-600">{selectedVendor.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Email</Label>
                  <p className="font-semibold">{selectedVendor.email}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Phone</Label>
                  <p className="font-semibold">{selectedVendor.phone}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-600">Address</Label>
                  <p className="font-semibold">{selectedVendor.address}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Commission Rate</Label>
                  <p className="font-semibold">{selectedVendor.commission}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Join Date</Label>
                  <p className="font-semibold">{selectedVendor.joinDate}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Total Bookings</Label>
                  <p className="font-semibold">{selectedVendor.totalBookings}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Total Revenue</Label>
                  <p className="font-semibold">{selectedVendor.revenue}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Status</Label>
                  <Badge
                    className={
                      selectedVendor.status === "active"
                        ? "bg-green-100 text-green-700"
                        : selectedVendor.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }
                  >
                    {selectedVendor.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Vendor Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Global Travel Agency"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@agency.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 234 567 8900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Business St, City, State"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commission">Commission Rate</Label>
              <Input
                id="commission"
                value={formData.commission}
                onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                placeholder="15%"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white" onClick={handleSave}>
              {isEditing ? "Update Vendor" : "Add Vendor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the vendor and remove all associated data from
              the system.
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
