"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Eye, CheckCircle, XCircle, Download } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export function Bookings() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [bookings, setBookings] = useState([
    {
      id: "BK-001",
      customer: "John Doe",
      email: "john@example.com",
      service: "Flight Ticket",
      amount: "$350",
      status: "completed",
      date: "2025-01-20",
      phone: "+1 234 567 8900",
    },
    {
      id: "BK-002",
      customer: "Jane Smith",
      email: "jane@example.com",
      service: "Visa Processing",
      amount: "$150",
      status: "pending",
      date: "2025-01-21",
      phone: "+1 234 567 8901",
    },
    {
      id: "BK-003",
      customer: "Mike Johnson",
      email: "mike@example.com",
      service: "Hotel Booking",
      amount: "$280",
      status: "completed",
      date: "2025-01-21",
      phone: "+1 234 567 8902",
    },
    {
      id: "BK-004",
      customer: "Sarah Williams",
      email: "sarah@example.com",
      service: "Flight Ticket",
      amount: "$420",
      status: "processing",
      date: "2025-01-22",
      phone: "+1 234 567 8903",
    },
  ])

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleView = (booking) => {
    setSelectedBooking(booking)
    setIsViewDialogOpen(true)
  }

  const handleApprove = (id) => {
    setBookings(bookings.map((b) => (b.id === id ? { ...b, status: "completed" } : b)))
    toast({
      title: "Booking approved",
      description: "Booking has been marked as completed",
    })
  }

  const handleReject = (id) => {
    setBookings(bookings.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)))
    toast({
      title: "Booking cancelled",
      description: "Booking has been cancelled",
      variant: "destructive",
    })
  }

  const handleExport = () => {
    const csv = [
      ["Booking ID", "Customer", "Email", "Phone", "Service", "Amount", "Status", "Date"].join(","),
      ...filteredBookings.map((booking) =>
        [
          booking.id,
          booking.customer,
          booking.email,
          booking.phone,
          booking.service,
          booking.amount,
          booking.status,
          booking.date,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bookings-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Successful",
      description: "Bookings have been exported to CSV.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600 mt-1">Manage customer bookings</p>
        </div>
        <Button className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export Bookings
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search bookings by customer or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings ({filteredBookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Booking ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Service</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{booking.id}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{booking.customer}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{booking.service}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">{booking.amount}</td>
                    <td className="py-3 px-4">
                      <Badge
                        className={
                          booking.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : booking.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : booking.status === "processing"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-red-100 text-red-700"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{booking.date}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleView(booking)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {booking.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600"
                              onClick={() => handleApprove(booking.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                              onClick={() => handleReject(booking.id)}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details - {selectedBooking?.id}</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Customer Name</Label>
                  <p className="font-semibold">{selectedBooking.customer}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Email</Label>
                  <p className="font-semibold">{selectedBooking.email}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Phone</Label>
                  <p className="font-semibold">{selectedBooking.phone}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Service</Label>
                  <p className="font-semibold">{selectedBooking.service}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Amount</Label>
                  <p className="font-semibold">{selectedBooking.amount}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Booking Date</Label>
                  <p className="font-semibold">{selectedBooking.date}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Status</Label>
                  <Badge
                    className={
                      selectedBooking.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : selectedBooking.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                    }
                  >
                    {selectedBooking.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
