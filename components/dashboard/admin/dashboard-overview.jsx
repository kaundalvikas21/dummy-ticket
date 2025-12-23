"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DollarSign, ShoppingCart, Users, TrendingUp, ArrowUp, ArrowDown, Eye, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { SkeletonTable } from "@/components/ui/skeleton-table"
import { cn } from "@/lib/utils"

export function DashboardOverview() {
  const [stats, setStats] = useState([
    {
      title: "Total Revenue",
      value: "$0.00",
      change: "+0.0%",
      trend: "up",
      icon: DollarSign,
      color: "from-green-500 to-emerald-600",
      hover: "hover:bg-green-50",
    },
    {
      title: "Total Orders",
      value: "0",
      change: "+0.0%",
      trend: "up",
      icon: ShoppingCart,
      color: "from-blue-500 to-cyan-600",
      hover: "hover:bg-blue-50",
    },
    {
      title: "Total Customers",
      value: "0",
      change: "+0.0%",
      trend: "up",
      icon: Users,
      color: "from-purple-500 to-pink-600",
      hover: "hover:bg-purple-50",
    },
    {
      title: "Conversion Rate",
      value: "0.00%",
      change: "+0.0%",
      trend: "up",
      icon: TrendingUp,
      color: "from-orange-500 to-red-600",
      hover: "hover:bg-orange-50",
    },
  ])
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [dateRange, setDateRange] = useState("all_time")
  const [dateRangeLabel, setDateRangeLabel] = useState("")
  const [customDate, setCustomDate] = useState(undefined)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const supabase = createClient()
  const { toast } = useToast()

  const getDateRange = (range) => {
    const now = new Date()
    const currentStart = new Date(now)
    const currentEnd = new Date(now)
    const prevStart = new Date(now)
    const prevEnd = new Date(now)

    if (range === "all_time") {
      if (customDate?.from) {
        // Clone to avoid mutating state
        const start = new Date(customDate.from)
        start.setHours(0, 0, 0, 0)

        // If 'to' is missing (in progress), default to 'from' (single day filter) instead of today (which confusingly shows huge current range)
        const end = customDate.to ? new Date(customDate.to) : new Date(customDate.from)
        end.setHours(23, 59, 59, 999)

        return {
          currentStart: start,
          currentEnd: end,
          prevStart: null,
          prevEnd: null
        }
      }
      return { currentStart: null, currentEnd: null, prevStart: null, prevEnd: null }
    }

    switch (range) {
      case "last_7_days":
        // Last 7 days (rolling)
        currentStart.setDate(now.getDate() - 7)
        // Previous period: The 7 days before that (days 8-14 ago)
        prevEnd.setDate(now.getDate() - 7)
        prevStart.setDate(now.getDate() - 14)
        break

      case "this_year":
        // This Year (Jan 1st to now)
        currentStart.setFullYear(now.getFullYear())
        currentStart.setMonth(0, 1)
        currentStart.setHours(0, 0, 0, 0)

        // Previous Year (Full last year)
        prevStart.setFullYear(now.getFullYear() - 1)
        prevStart.setMonth(0, 1)
        prevStart.setHours(0, 0, 0, 0)

        prevEnd.setFullYear(now.getFullYear() - 1)
        prevEnd.setMonth(11, 31)
        prevEnd.setHours(23, 59, 59, 999)
        break

      case "this_month":
        // This Month (1st to now)
        currentStart.setDate(1)
        currentStart.setHours(0, 0, 0, 0)

        // Previous Month (1st to last day of prev month)
        prevStart.setMonth(now.getMonth() - 1)
        prevStart.setDate(1)
        prevStart.setHours(0, 0, 0, 0)
        prevEnd.setDate(0) // Last day of previous month
        prevEnd.setHours(23, 59, 59, 999)
        break

      case "last_month":
        // Previous Calendar Month
        currentStart.setMonth(now.getMonth() - 1)
        currentStart.setDate(1)
        currentStart.setHours(0, 0, 0, 0)
        currentEnd.setDate(0) // Last day of last month
        currentEnd.setHours(23, 59, 59, 999)

        // Month before last
        prevStart.setMonth(now.getMonth() - 2)
        prevStart.setDate(1)
        prevStart.setHours(0, 0, 0, 0)
        prevEnd.setMonth(now.getMonth() - 1)
        prevEnd.setDate(0)
        prevEnd.setHours(23, 59, 59, 999)
        break

      case "last_year":
        // Last Calendar Year
        currentStart.setFullYear(now.getFullYear() - 1)
        currentStart.setMonth(0, 1) // Jan 1st
        currentStart.setHours(0, 0, 0, 0)

        currentEnd.setFullYear(now.getFullYear() - 1)
        currentEnd.setMonth(11, 31) // Dec 31st
        currentEnd.setHours(23, 59, 59, 999)

        // Year before last
        prevStart.setFullYear(now.getFullYear() - 2)
        prevStart.setMonth(0, 1)

        prevEnd.setFullYear(now.getFullYear() - 2)
        prevEnd.setMonth(11, 31)
        break

      default:
        // Default to This Month
        currentStart.setDate(1)
        currentStart.setHours(0, 0, 0, 0)
        prevStart.setMonth(now.getMonth() - 1)
        prevStart.setDate(1)
    }

    return { currentStart, currentEnd, prevStart, prevEnd }
  }

  const formatDate = (date) => {
    if (!date) return ""
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const calculateChange = (current, previous, isLifetime) => {
    if (isLifetime) return "Lifetime"
    if (previous === 0) return current > 0 ? "+100%" : "0%"
    const change = ((current - previous) / previous) * 100
    return `${change > 0 ? "+" : ""}${change.toFixed(1)}%`
  }

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const isAllTimeView = dateRange === "all_time"
      const hasCustomDate = isAllTimeView && customDate?.from
      const isLifetime = isAllTimeView && !hasCustomDate

      const { currentStart, currentEnd, prevStart, prevEnd } = getDateRange(dateRange)

      // Set label
      if (isAllTimeView) {
        if (hasCustomDate) {
          if (customDate.to) {
            setDateRangeLabel(`${format(customDate.from, "LLL dd, y")} - ${format(customDate.to, "LLL dd, y")}`)
          } else {
            setDateRangeLabel(`${format(customDate.from, "LLL dd, y")}`)
          }
        } else {
          // Default All Time: Show current date as requested ("bottom current date")
          setDateRangeLabel(format(new Date(), "LLL dd, y"))
        }
      } else {
        setDateRangeLabel(`${formatDate(currentStart)} - ${formatDate(currentEnd)}`)
      }

      // Fetch bookings for both periods
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
        // handle
        profiles = []
      } else {
        profiles = profilesData || []
      }

      // Filter Data
      const filterByDate = (item, start, end) => {
        if (isLifetime) return true
        if (!start || !end) return true
        const date = new Date(item.created_at)
        return date >= start && date <= end
      }

      // Current Period Data
      const currentBookings = bookings.filter(b => filterByDate(b, currentStart, currentEnd))
      const currentProfiles = profiles.filter(p => filterByDate(p, currentStart, currentEnd))

      // Previous Period Data
      // For All Time/Custom, we don't have a "previous all time".
      const prevBookings = isAllTimeView ? [] : bookings.filter(b => filterByDate(b, prevStart, prevEnd))
      const prevProfiles = isAllTimeView ? [] : profiles.filter(p => filterByDate(p, prevStart, prevEnd))

      // Stats Calculation
      const currentRevenue = currentBookings.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0)
      const prevRevenue = prevBookings.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0)

      const currentOrders = currentBookings.length
      const prevOrders = prevBookings.length

      const currentCustomers = currentProfiles.length
      const prevCustomers = prevProfiles.length

      // Conversion Rate (Orders / Unique Customers in Period) - tricky if no customers
      // If 0 customers, 0 conversion.
      const currentConversion = currentCustomers > 0 ? (currentOrders / currentCustomers) * 100 : 0
      const prevConversion = prevCustomers > 0 ? (prevOrders / prevCustomers) * 100 : 0

      setStats([
        {
          title: isLifetime ? "Total Revenue" : "Revenue",
          value: `$${currentRevenue.toFixed(2)}`,
          change: calculateChange(currentRevenue, prevRevenue, isLifetime),
          trend: isLifetime ? "neutral" : (currentRevenue >= prevRevenue ? "up" : "down"),
          icon: DollarSign,
          color: "from-green-500 to-emerald-600",
        },
        {
          title: isLifetime ? "Total Orders" : "Orders",
          value: currentOrders.toString(),
          change: calculateChange(currentOrders, prevOrders, isLifetime),
          trend: isLifetime ? "neutral" : (currentOrders >= prevOrders ? "up" : "down"),
          icon: ShoppingCart,
          color: "from-blue-500 to-cyan-600",
        },
        {
          title: isLifetime ? "Total Customers" : "New Customers",
          value: currentCustomers.toString(),
          change: calculateChange(currentCustomers, prevCustomers, isLifetime),
          trend: isLifetime ? "neutral" : (currentCustomers >= prevCustomers ? "up" : "down"),
          icon: Users,
          color: "from-purple-500 to-pink-600",
        },
        {
          title: "Conversion Rate",
          value: `${currentConversion.toFixed(2)}%`,
          change: calculateChange(currentConversion, prevConversion, isLifetime),
          trend: isLifetime ? "neutral" : (currentConversion >= prevConversion ? "up" : "down"),
          icon: TrendingUp,
          color: "from-orange-500 to-red-600",
        },
      ])

      // Format Recent Orders (Top 5 from Current Range or just Global Top 5? Usually global recent is fine, but if filtering dashboard, maybe recent in that period?)
      // Let's show recent orders from the filtered selection to be consistent.
      const formattedRecentOrders = currentBookings.slice(0, 5).map(booking => {
        let passengerName = "Guest"
        try {
          if (booking.passenger_details) {
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
      console.error("Error fetching dashboard data:", error)
      toast({
        variant: "destructive",
        title: "Error Loading Dashboard",
        description: error.message || "Failed to load dashboard data."
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [dateRange, customDate]) // Trigger when dateRange or customDate changes

  const handleView = (order) => {
    setSelectedOrder(order)
    setIsViewDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your business.</p>
        </div>

        {/* Date Range Select */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
            <Calendar className="w-4 h-4 text-gray-500 ml-2" />
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px] border-0 focus:ring-0 shadow-none h-9 font-medium text-gray-700">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_time" className="cursor-pointer">All Time</SelectItem>
                <SelectItem value="last_7_days" className="cursor-pointer">Last 7 Days</SelectItem>
                <SelectItem value="this_month" className="cursor-pointer">This Month</SelectItem>
                <SelectItem value="last_month" className="cursor-pointer">Last Month</SelectItem>
                <SelectItem value="this_year" className="cursor-pointer">This Year</SelectItem>
                <SelectItem value="last_year" className="cursor-pointer">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {dateRangeLabel && (
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <div
                  onClick={() => dateRange === 'all_time' && setIsCalendarOpen(true)}
                  className={cn(
                    "w-full flex justify-center items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-200 rounded-full shadow-xs transition-colors",
                    dateRange === 'all_time' ? "cursor-pointer hover:bg-gray-100 hover:border-gray-300" : "cursor-default"
                  )}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", dateRange === 'all_time' ? "bg-blue-500" : "bg-emerald-500")} />
                  <span className="text-xs font-medium text-gray-600">
                    {dateRangeLabel}
                  </span>
                </div>
              </PopoverTrigger>
              {dateRange === 'all_time' && (
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent
                    mode="range"
                    defaultMonth={customDate?.from || new Date()}
                    selected={customDate}
                    onSelect={setCustomDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              )}
            </Popover>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
            className="h-full"
          >
            <Card className={cn(
              "relative overflow-hidden transition-all duration-300 hover:shadow-xl border-gray-100/50 h-full group hover:bg-white/80",
              stat.title.includes("Revenue") && "bg-green-50/80",
              stat.title.includes("Orders") && "bg-blue-50/80",
              stat.title.includes("Customers") && "bg-purple-50/80",
              stat.title.includes("Conversion") && "bg-orange-50/80"
            )}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold text-gray-600 transition-colors group-hover:text-gray-900">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg bg-linear-to-br ${stat.color} shadow-sm transition-transform group-hover:scale-110`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 tracking-tight">{loading ? "..." : stat.value}</div>
                <div className="flex items-center gap-1 mt-1">
                  {stat.trend === "neutral" ? (
                    <span className="text-sm font-medium text-gray-500">Total accumulated</span>
                  ) : (
                    <>
                      {stat.trend === "up" ? (
                        <ArrowUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`text-sm font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-400">
                        {dateRange === 'this_month' ? 'vs last month' :
                          dateRange === 'last_month' ? 'vs prev month' :
                            dateRange === 'last_year' ? 'vs prev year' : 'vs prev period'}
                      </span>
                    </>
                  )}
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
            <p className="text-sm text-gray-600 mt-1">
              Latest bookings {dateRange === 'all_time' ? 'overall' : `for ${dateRange.replace(/_/g, ' ')}`}
            </p>
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
                    <tr><td colSpan="7" className="text-center py-4">No recent orders found for this period.</td></tr>
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
