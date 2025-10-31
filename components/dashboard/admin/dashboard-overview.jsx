"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DollarSign, ShoppingCart, Users, TrendingUp, ArrowUp, ArrowDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

const stats = [
  {
    title: "Total Revenue",
    value: "$45,231",
    change: "+20.1%",
    trend: "up",
    icon: DollarSign,
    color: "from-green-500 to-emerald-600",
  },
  {
    title: "Total Orders",
    value: "2,345",
    change: "+15.3%",
    trend: "up",
    icon: ShoppingCart,
    color: "from-blue-500 to-cyan-600",
  },
  {
    title: "Total Customers",
    value: "1,892",
    change: "+8.2%",
    trend: "up",
    icon: Users,
    color: "from-purple-500 to-pink-600",
  },
  {
    title: "Conversion Rate",
    value: "3.24%",
    change: "-2.4%",
    trend: "down",
    icon: TrendingUp,
    color: "from-orange-500 to-red-600",
  },
]

const recentOrders = [
  {
    id: "ORD-12345",
    customer: "John Doe",
    service: "Dummy Ticket for Visa",
    amount: "$19.00",
    status: "completed",
    date: "2025-01-15",
  },
  {
    id: "ORD-12344",
    customer: "Jane Smith",
    service: "Dummy Ticket & Hotel",
    amount: "$35.00",
    status: "processing",
    date: "2025-01-15",
  },
  {
    id: "ORD-12343",
    customer: "Mike Johnson",
    service: "Dummy Return Ticket",
    amount: "$15.00",
    status: "completed",
    date: "2025-01-14",
  },
  {
    id: "ORD-12342",
    customer: "Sarah Williams",
    service: "Dummy Ticket for Visa",
    amount: "$19.00",
    status: "pending",
    date: "2025-01-14",
  },
  {
    id: "ORD-12341",
    customer: "David Brown",
    service: "Dummy Ticket & Hotel",
    amount: "$35.00",
    status: "completed",
    date: "2025-01-13",
  },
]

export function DashboardOverview() {
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const handleView = (order) => {
    setSelectedOrder(order)
    setIsViewDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your business today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="flex items-center gap-1 mt-1">
                  {stat.trend === "up" ? (
                    <ArrowUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500">from last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Latest bookings and transactions</p>
          </div>
          <Button variant="outline">View All</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Order ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Service</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{order.id}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{order.customer}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{order.service}</td>
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
                      <Button variant="ghost" size="sm" onClick={() => handleView(order)}>
                        View
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Dialog for Order Details */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Order ID</Label>
                  <p className="font-semibold">{selectedOrder.id}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Customer Name</Label>
                  <p className="font-semibold">{selectedOrder.customer}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Service</Label>
                  <p className="font-semibold">{selectedOrder.service}</p>
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
    </div>
  )
}
