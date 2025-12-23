"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { TrendingUp, Users, DollarSign, ShoppingCart, Calendar, ArrowUp, ArrowDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Pie,
  PieChart,
  Cell,
} from "recharts"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export function Analytics() {
  const [monthlyData, setMonthlyData] = useState([])
  const [topServices, setTopServices] = useState([])
  const [serviceDistribution, setServiceDistribution] = useState([])
  const [keyMetrics, setKeyMetrics] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    avgOrderValue: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeMetric, setActiveMetric] = useState('both') // 'both', 'revenue', 'orders'

  const supabase = createClient()
  const { toast } = useToast()

  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      // Fetch all bookings for aggregation
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('amount, created_at, status, service_plans(name)')
        .order('created_at', { ascending: true })

      if (bookingsError) throw bookingsError

      let profiles = []
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')

      if (profilesError) {
        console.warn("Analytics: Profile fetch failed.", profilesError.message)
        // Continue with empty profiles if fetch fails
        profiles = []
      } else {
        profiles = profilesData || []
      }

      // key metrics
      const totalRevenue = bookings.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0)
      const totalOrders = bookings.length
      const avgOrderVal = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // Compute Total Customers (Profiles + Bookings unique ids)
      const customerIds = new Set()
      profiles?.forEach(p => {
        // Use auth_user_id if available, fallback to user_id
        const id = p.auth_user_id || p.user_id
        if (id) customerIds.add(id)
      })
      bookings?.forEach(b => { if (b.user_id) customerIds.add(b.user_id) })
      const totalUniqueCustomers = customerIds.size

      setKeyMetrics({
        revenue: totalRevenue,
        orders: totalOrders,
        customers: totalUniqueCustomers,
        avgOrderValue: avgOrderVal
      })

      // Process Monthly Data (Grouped by Month and Year)
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const monthlyStats = {}

      if (bookings.length > 0 || true) { // Always show a range even with no bookings
        // Show at least the last 6 months
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
        let startDate = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth(), 1)

        if (bookings.length > 0) {
          const firstBookingDate = new Date(bookings[0].created_at)
          const firstMonth = new Date(firstBookingDate.getFullYear(), firstBookingDate.getMonth(), 1)
          if (firstMonth < startDate) {
            startDate = firstMonth
          }
        }

        const endBooking = new Date() // Today
        let current = new Date(startDate)
        const last = new Date(endBooking.getFullYear(), endBooking.getMonth(), 1)

        // Initialize all months with zero values
        while (current <= last) {
          const monthYearKey = `${months[current.getMonth()]} ${current.getFullYear()}`
          monthlyStats[monthYearKey] = {
            month: monthYearKey,
            revenue: 0,
            orders: 0,
            sortKey: current.getFullYear() * 100 + current.getMonth()
          }
          current.setMonth(current.getMonth() + 1)
        }

        // Fill in actual data
        bookings.forEach(booking => {
          const date = new Date(booking.created_at)
          const monthYearKey = `${months[date.getMonth()]} ${date.getFullYear()}`

          if (monthlyStats[monthYearKey]) {
            monthlyStats[monthYearKey].revenue += parseFloat(booking.amount || 0)
            monthlyStats[monthYearKey].orders += 1
          }
        })
      }

      // Ensure chronological order
      const chartData = Object.values(monthlyStats).sort((a, b) => a.sortKey - b.sortKey)

      setMonthlyData(chartData.length > 0 ? chartData : [{ month: "No Data", revenue: 0, orders: 0 }])

      // Process Services Data
      const serviceStats = {}
      bookings.forEach(booking => {
        const serviceName = booking.service_plans?.name || "Unknown Service"
        if (!serviceStats[serviceName]) {
          serviceStats[serviceName] = { name: serviceName, sales: 0, revenue: 0 }
        }
        serviceStats[serviceName].sales += 1
        serviceStats[serviceName].revenue += parseFloat(booking.amount || 0)
      })

      const servicesArray = Object.values(serviceStats).sort((a, b) => b.revenue - a.revenue)
      setTopServices(servicesArray)

      // Service Distribution (Pie Chart)
      const colors = ["#00D4AA", "#0066FF", "#FF6B35", "#FFC107", "#9C27B0"] // Updated with new primary colors
      const distArray = servicesArray.map((s, i) => ({
        name: s.name,
        value: s.sales,
        color: colors[i % colors.length]
      }))
      setServiceDistribution(distArray)

    } catch (error) {
      console.error("Error fetching analytics data:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: error
      })
      toast({
        variant: "destructive",
        title: "Error Loading Analytics",
        description: error.message || "Failed to load analytics data. Please check console."
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Track performance and business insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <motion.div
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="h-full cursor-pointer"
          onClick={() => setActiveMetric(activeMetric === 'revenue' ? 'both' : 'revenue')}
        >
          <Card className={cn(
            "transition-all duration-300 hover:shadow-xl bg-green-50/80 hover:bg-white/80 border-gray-100/50 group h-full",
            activeMetric === 'revenue' && "ring-2 ring-green-500 bg-white",
            activeMetric === 'orders' && "opacity-60 saturate-50"
          )}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold text-gray-600 transition-colors group-hover:text-gray-900">Total Revenue</CardTitle>
              <div className="p-2 rounded-lg bg-linear-to-br from-[#00D4AA] to-emerald-600 shadow-sm transition-transform group-hover:scale-110">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 tracking-tight">
                {loading ? "..." : `$${keyMetrics.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-sm text-gray-400">Total revenue accumulated</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Orders */}
        <motion.div
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="h-full cursor-pointer"
          onClick={() => setActiveMetric(activeMetric === 'orders' ? 'both' : 'orders')}
        >
          <Card className={cn(
            "transition-all duration-300 hover:shadow-xl bg-blue-50/80 hover:bg-white/80 border-gray-100/50 group h-full",
            activeMetric === 'orders' && "ring-2 ring-blue-500 bg-white",
            activeMetric === 'revenue' && "opacity-60 saturate-50"
          )}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold text-gray-600 transition-colors group-hover:text-gray-900">Total Orders</CardTitle>
              <div className="p-2 rounded-lg bg-linear-to-br from-[#0066FF] to-cyan-600 shadow-sm transition-transform group-hover:scale-110">
                <ShoppingCart className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 tracking-tight">{loading ? "..." : keyMetrics.orders}</div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-sm text-gray-400">Total bookings completed</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Customers */}
        <motion.div whileHover={{ y: -4 }} className="h-full">
          <Card className="transition-all duration-300 hover:shadow-xl bg-purple-50/80 hover:bg-white/80 border-gray-100/50 group h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold text-gray-600 transition-colors group-hover:text-gray-900">Total Customers</CardTitle>
              <div className="p-2 rounded-lg bg-linear-to-br from-purple-500 to-pink-600 shadow-sm transition-transform group-hover:scale-110">
                <Users className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 tracking-tight">{loading ? "..." : keyMetrics.customers}</div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-sm text-gray-400">Registered users</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Avg Order Value */}
        <motion.div whileHover={{ y: -4 }} className="h-full">
          <Card className="transition-all duration-300 hover:shadow-xl bg-orange-50/80 hover:bg-white/80 border-gray-100/50 group h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold text-gray-600 transition-colors group-hover:text-gray-900">Avg. Order Value</CardTitle>
              <div className="p-2 rounded-lg bg-linear-to-br from-orange-500 to-red-600 shadow-sm transition-transform group-hover:scale-110">
                <Calendar className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 tracking-tight">
                {loading ? "..." : `$${keyMetrics.avgOrderValue.toFixed(2)}`}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-sm text-gray-400">Average amount per order</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue & Orders Trend</CardTitle>
          <CardDescription>Monthly performance</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              revenue: {
                label: "Revenue ($)",
                color: "#00D4AA",
              },
              orders: {
                label: "Orders",
                color: "#0066FF",
              },
            }}
            className="h-[350px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="month" hide />
                {(activeMetric === 'both' || activeMetric === 'revenue') && (
                  <YAxis yAxisId="left" stroke="#00D4AA" />
                )}
                {(activeMetric === 'both' || activeMetric === 'orders') && (
                  <YAxis yAxisId="right" orientation="right" stroke="#0066FF" />
                )}
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  formatter={(value) => <span className="text-sm font-medium ml-1">{value}</span>}
                  onClick={(e) => {
                    if (e.dataKey === 'revenue') setActiveMetric(activeMetric === 'revenue' ? 'both' : 'revenue')
                    if (e.dataKey === 'orders') setActiveMetric(activeMetric === 'orders' ? 'both' : 'orders')
                  }} />
                {(activeMetric === 'both' || activeMetric === 'revenue') && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#00D4AA"
                    strokeWidth={3}
                    name="Revenue ($)"
                    dot={{ fill: "#00D4AA", r: 4 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={true}
                    animationDuration={1500}
                    animationEasing="ease-in-out"
                  />
                )}
                {(activeMetric === 'both' || activeMetric === 'orders') && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    stroke="#0066FF"
                    strokeWidth={3}
                    name="Orders"
                    dot={{ fill: "#0066FF", r: 4 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={true}
                    animationDuration={1500}
                    animationEasing="ease-in-out"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 xl:grid-cols-2">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Top Performing Services</CardTitle>
            <CardDescription className="text-sm">Revenue comparison by service type</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <ChartContainer
              config={{
                revenue: {
                  label: "Revenue ($)",
                  color: "#00D4AA",
                },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topServices}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    stroke="#6b7280"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 11 }}
                    interval={0}
                  />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: 'transparent' }} />
                  <Bar
                    dataKey="revenue"
                    fill="#00D4AA"
                    radius={[4, 4, 0, 0]}
                    name="Revenue ($)"
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Service Distribution</CardTitle>
            <CardDescription className="text-sm">Sales breakdown by service type</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <ChartContainer
              config={{
                value: {
                  label: "Sales",
                },
              }}
              className="h-[250px] sm:h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => {
                      // Hide labels on very small screens
                      if (typeof window !== 'undefined' && window.innerWidth < 640) return '';
                      return `${name}: ${(percent * 100).toFixed(0)}%`;
                    }}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {serviceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-xs">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Detailed Service Performance</CardTitle>
          <CardDescription className="text-sm">Complete breakdown of all services</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="space-y-3">
            {topServices.map((service, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#00D4AA] to-[#0066FF] flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{service.name}</h4>
                    <p className="text-xs sm:text-sm text-gray-600">{service.sales} sales</p>
                  </div>
                </div>
                <div className="text-right sm:text-left">
                  <p className="font-bold text-gray-900 text-sm sm:text-base">${service.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p className="text-xs text-gray-600">Total Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
