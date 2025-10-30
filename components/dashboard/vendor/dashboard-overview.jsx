"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, DollarSign, Package, TrendingUp, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export function DashboardOverview() {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)

  const stats = [
    { title: "Total Bookings", value: "145", change: "+12%", icon: ShoppingCart, color: "from-blue-500 to-cyan-500" },
    {
      title: "Total Revenue",
      value: "$5,075",
      change: "+8%",
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
    },
    { title: "Active Services", value: "8", change: "+2", icon: Package, color: "from-purple-500 to-pink-500" },
    { title: "Avg. Rating", value: "4.8", change: "+0.2", icon: TrendingUp, color: "from-orange-500 to-red-500" },
  ]

  const recentBookings = [
    {
      id: "BK-001",
      customer: "John Doe",
      service: "Flight Ticket",
      amount: "$350",
      status: "completed",
      date: "2025-01-20",
      email: "john.doe@example.com",
      phone: "+1 234 567 8900",
    },
    {
      id: "BK-002",
      customer: "Jane Smith",
      service: "Visa Processing",
      amount: "$150",
      status: "pending",
      date: "2025-01-21",
      email: "jane.smith@example.com",
      phone: "+1 234 567 8901",
    },
    {
      id: "BK-003",
      customer: "Mike Johnson",
      service: "Hotel Booking",
      amount: "$280",
      status: "completed",
      date: "2025-01-21",
      email: "mike.johnson@example.com",
      phone: "+1 234 567 8902",
    },
    {
      id: "BK-004",
      customer: "Sarah Williams",
      service: "Flight Ticket",
      amount: "$420",
      status: "processing",
      date: "2025-01-22",
      email: "sarah.williams@example.com",
      phone: "+1 234 567 8903",
    },
  ]

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking)
    setIsViewDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your business.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <p className="text-sm text-green-600 mt-2">{stat.change} from last month</p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
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
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
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
                              : "bg-blue-100 text-blue-700"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{booking.date}</td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm" onClick={() => handleViewBooking(booking)}>
                        <Eye className="w-4 h-4" />
                      </Button>
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
            <DialogTitle>Booking Details - {selectedBooking?.id}</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Booking ID</Label>
                  <p className="font-semibold">{selectedBooking.id}</p>
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
                  <p className="font-semibold text-green-600">{selectedBooking.amount}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Booking Date</Label>
                  <p className="font-semibold">{selectedBooking.date}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
