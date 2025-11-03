"use client"

import { useState } from "react"
import { Search, Download, Eye, Edit, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

export function OrdersManagement() {
  const [orders, setOrders] = useState([
    {
      id: "ORD-12345",
      customer: "John Doe",
      email: "john@example.com",
      service: "Dummy Ticket for Visa",
      amount: "$19.00",
      status: "completed",
      date: "2025-01-15",
      departure: "New York (JFK)",
      arrival: "London (LHR)",
      phone: "+1 234 567 8900",
      pnr: "ABC123",
    },
    {
      id: "ORD-12344",
      customer: "Jane Smith",
      email: "jane@example.com",
      service: "Dummy Ticket & Hotel",
      amount: "$35.00",
      status: "processing",
      date: "2025-01-15",
      departure: "Los Angeles (LAX)",
      arrival: "Paris (CDG)",
      phone: "+1 234 567 8901",
      pnr: "DEF456",
    },
    {
      id: "ORD-12343",
      customer: "Mike Johnson",
      email: "mike@example.com",
      service: "Dummy Return Ticket",
      amount: "$15.00",
      status: "completed",
      date: "2025-01-14",
      departure: "Chicago (ORD)",
      arrival: "Tokyo (NRT)",
      phone: "+1 234 567 8902",
      pnr: "GHI789",
    },
    {
      id: "ORD-12342",
      customer: "Sarah Williams",
      email: "sarah@example.com",
      service: "Dummy Ticket for Visa",
      amount: "$19.00",
      status: "pending",
      date: "2025-01-14",
      departure: "Miami (MIA)",
      arrival: "Dubai (DXB)",
      phone: "+1 234 567 8903",
      pnr: "JKL012",
    },
    {
      id: "ORD-12341",
      customer: "David Brown",
      email: "david@example.com",
      service: "Dummy Ticket & Hotel",
      amount: "$35.00",
      status: "completed",
      date: "2025-01-13",
      departure: "San Francisco (SFO)",
      arrival: "Sydney (SYD)",
      phone: "+1 234 567 8904",
      pnr: "MNO345",
    },
  ])

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState(null)

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleView = (order) => {
    setSelectedOrder(order)
    setIsViewDialogOpen(true)
  }

  const handleEdit = (order) => {
    setSelectedOrder(order)
    setIsEditDialogOpen(true)
  }

  const handleUpdateStatus = (newStatus) => {
    setOrders(orders.map((order) => (order.id === selectedOrder.id ? { ...order, status: newStatus } : order)))
    setIsEditDialogOpen(false)
  }

  const handleDeleteClick = (id) => {
    setOrderToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (orderToDelete) {
      setOrders(orders.filter((order) => order.id !== orderToDelete))
      setIsDeleteDialogOpen(false)
      setOrderToDelete(null)
    }
  }

  const handleExport = () => {
    const csv = [
      ["Order ID", "Customer", "Email", "Service", "Amount", "Status", "Date", "Departure", "Arrival"].join(","),
      ...filteredOrders.map((order) =>
        [
          order.id,
          order.customer,
          order.email,
          order.service,
          order.amount,
          order.status,
          order.date,
          order.departure,
          order.arrival,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600 mt-1">Manage and track all customer bookings</p>
        </div>
        <Button className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white cursor-pointer" onClick={handleExport} disabled={filteredOrders.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Export Orders
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search by order ID, customer name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Order ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Service</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Route</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{order.id}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{order.customer}</span>
                          <span className="text-xs text-gray-500">{order.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">{order.service}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-600">{order.departure}</span>
                          <span className="text-xs text-gray-400">→</span>
                          <span className="text-xs text-gray-600">{order.arrival}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900">{order.amount}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            order.status === "completed"
                              ? "default"
                              : order.status === "processing"
                                ? "secondary"
                                : "outline"
                          }
                          className={
                            order.status === "completed"
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : order.status === "processing"
                                ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                          }
                        >
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{order.date}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleView(order)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(order)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteClick(order.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-teal-50 rounded-full flex items-center justify-center">
                          <Search className="w-10 h-10 text-gray-400" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold text-gray-900">No orders found</h3>
                          <p className="text-sm text-gray-500 max-w-sm mx-auto">
                            {searchQuery || statusFilter !== "all" ? (
                              <>
                                We couldn't find any orders matching your search criteria.
                                <br />
                                Try adjusting your filters or search terms.
                              </>
                            ) : (
                              "No orders have been placed yet."
                            )}
                          </p>
                        </div>
                        {(searchQuery || statusFilter !== "all") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSearchQuery("")
                              setStatusFilter("all")
                            }}
                            className="mt-2"
                          >
                            Clear filters
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Customer Name</Label>
                  <p className="font-semibold">{selectedOrder.customer}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Email</Label>
                  <p className="font-semibold">{selectedOrder.email}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Phone</Label>
                  <p className="font-semibold">{selectedOrder.phone}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Service</Label>
                  <p className="font-semibold">{selectedOrder.service}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Departure</Label>
                  <p className="font-semibold">{selectedOrder.departure}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Arrival</Label>
                  <p className="font-semibold">{selectedOrder.arrival}</p>
                </div>
                <div>
                  <Label className="text-gray-600">PNR Code</Label>
                  <p className="font-semibold">{selectedOrder.pnr}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Amount</Label>
                  <p className="font-semibold">{selectedOrder.amount}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Status</Label>
                  <Badge
                    className={
                      selectedOrder.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : selectedOrder.status === "processing"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                    }
                  >
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-gray-600">Date</Label>
                  <p className="font-semibold">{selectedOrder.date}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Order Status - {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Status</Label>
              <p className="text-sm text-gray-600">
                Current status: <span className="font-semibold">{selectedOrder?.status}</span>
              </p>
            </div>
            <div className="space-y-2">
              <Label>Update to:</Label>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="justify-start bg-transparent"
                  onClick={() => handleUpdateStatus("pending")}
                >
                  Pending
                </Button>
                <Button
                  variant="outline"
                  className="justify-start bg-transparent"
                  onClick={() => handleUpdateStatus("processing")}
                >
                  Processing
                </Button>
                <Button
                  variant="outline"
                  className="justify-start bg-transparent"
                  onClick={() => handleUpdateStatus("completed")}
                >
                  Completed
                </Button>
                <Button
                  variant="outline"
                  className="justify-start text-red-600 bg-transparent"
                  onClick={() => handleUpdateStatus("cancelled")}
                >
                  Cancelled
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the order and remove the data from the system.
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