"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DollarSign, ShoppingCart, Users, TrendingUp, ArrowUp, ArrowDown, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { SkeletonTable } from "@/components/ui/skeleton-table"

export function DashboardOverview() {
  const [stats, setStats] = useState([
    {
      title: "Total Revenue",
      value: "$0.00",
      change: "+0.0%",
      trend: "up",
      icon: DollarSign,
      color: "from-green-500 to-emerald-600",
    },
    {
      title: "Total Orders",
      value: "0",
      change: "+0.0%",
      trend: "up",
      icon: ShoppingCart,
      color: "from-blue-500 to-cyan-600",
    },
    {
      title: "Total Customers",
      value: "0",
      change: "+0.0%",
      trend: "up",
      icon: Users,
      color: "from-purple-500 to-pink-600",
    },
    {
      title: "Conversion Rate",
      value: "0.00%",
      change: "+0.0%",
      trend: "up",
      icon: TrendingUp,
      color: "from-orange-500 to-red-600",
    },
  ])
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const supabase = createClient()
  const { toast } = useToast()

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch stats
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*, service_plans(name)')
        .order('created_at', { ascending: false })

      if (bookingsError) throw bookingsError

      let profiles = []
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')

      if (profilesError) {
        console.error("Critical: Profile fetch failed.", profilesError)
        // Continue with empty profiles if fetch fails
        profiles = []
      } else {
        profiles = profilesData || []
      }

      // Calculate stats
      const totalRevenue = bookings.reduce((sum, booking) => sum + parseFloat(booking.amount || 0), 0)
      const totalOrders = bookings.length

      // Unify Customer Count (Profiles + Unique IDs from Bookings)
      const customerIds = new Set()
      profiles?.forEach(p => {
        // Use auth_user_id if available, fallback to user_id (the original column)
        const id = p.auth_user_id || p.user_id
        if (id) customerIds.add(id)
      })
      bookings?.forEach(b => {
        if (b.user_id) customerIds.add(b.user_id)
      })

      const totalUniqueCustomers = customerIds.size

      setStats([
        {
          title: "Total Revenue",
          value: `$${totalRevenue.toFixed(2)}`,
          change: "+100%", // Placeholder
          trend: "up",
          icon: DollarSign,
          color: "from-green-500 to-emerald-600",
        },
        {
          title: "Total Orders",
          value: totalOrders.toString(),
          change: "+100%", // Placeholder
          trend: "up",
          icon: ShoppingCart,
          color: "from-blue-500 to-cyan-600",
        },
        {
          title: "Total Customers",
          value: totalUniqueCustomers.toString(),
          change: "+100%", // Placeholder
          trend: "up",
          icon: Users,
          color: "from-purple-500 to-pink-600",
        },
        {
          title: "Conversion Rate",
          value: totalOrders > 0 ? `${((totalOrders / (totalUniqueCustomers || 1)) * 100).toFixed(1)}%` : "0%",
          change: "+0.0%",
          trend: "up",
          icon: TrendingUp,
          color: "from-orange-500 to-red-600",
        },
      ])

      // Format Recent Orders (Top 5)
      const formattedRecentOrders = bookings.slice(0, 5).map(booking => {
        let passengerName = "Guest"
        try {
          if (booking.passenger_details) {
            // Handle if passenger_details is object or array or string
            const details = typeof booking.passenger_details === 'string'
              ? JSON.parse(booking.passenger_details)
              : booking.passenger_details

            if (Array.isArray(details) && details.length > 0) {
              passengerName = `${details[0].firstName} ${details[0].lastName}`
            } else if (details.firstName) {
              passengerName = `${details.firstName} ${details.lastName}`
            }
          }
        } catch (e) { console.error("Error parsing passenger details", e) }

        return {
          id: booking.id,
          customer: passengerName,
          service: booking.service_plans?.name || "Unknown Service",
          amount: parseFloat(booking.amount || 0),
          currency: booking.currency || 'USD',
          status: booking.status || "pending",
          date: new Date(booking.created_at).toLocaleDateString(),
        }
      })

      setRecentOrders(formattedRecentOrders)

    } catch (error) {
      console.error("Error fetching dashboard data:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: error
      })
      toast({
        variant: "destructive",
        title: "Error Loading Dashboard",
        description: error.message || "Failed to load dashboard data. Please try again or check console."
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

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
                <div className={`p-2 rounded-lg bg-linear-to-br ${stat.color}`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{loading ? "..." : stat.value}</div>
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
          <Button variant="outline" asChild>
            <a href="/admin/orders">View All</a>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <SkeletonTable rows={5} columns={7} />
          ) : (
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
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order, index) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4 text-xs font-mono text-gray-500 break-all">
                          {order.id}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">{order.customer}</span>
                            <span className="text-xs text-gray-500">{order.email}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">{order.service}</td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                          ${order.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              order.status === "completed" || order.status === "paid"
                                ? "default"
                                : order.status === "processing"
                                  ? "secondary"
                                  : "outline"
                            }
                            className={
                              order.status === "completed" || order.status === "paid"
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
                          <Button variant="ghost" size="icon" onClick={() => handleView(order)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr><td colSpan="7" className="text-center py-4">No recent orders found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
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
                  <p className="font-semibold">${selectedOrder.amount.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Status</Label>
                  <Badge
                    className={
                      selectedOrder.status === "completed" || selectedOrder.status === "paid"
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
