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
import { Button } from "@/components/ui/button"
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

  // Filter State
  const [dateRange, setDateRange] = useState("last_6_months") // Default to last 6 months as requested
  const [dateRangeLabel, setDateRangeLabel] = useState("")
  const [customDate, setCustomDate] = useState(undefined)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [chartData, setChartData] = useState([]) // Replaces monthlyData

  const supabase = createClient()
  const { toast } = useToast()

  const getDateRange = (range) => {
    const now = new Date()
    const currentStart = new Date(now)
    const currentEnd = new Date(now)

    if (range === "all_time") {
      if (customDate?.from) {
        const start = new Date(customDate.from)
        start.setHours(0, 0, 0, 0)
        const end = customDate.to ? new Date(customDate.to) : new Date(customDate.from)
        end.setHours(23, 59, 59, 999)
        return { start, end }
      }
      return { start: null, end: null } // All time
    }

    switch (range) {
      case "last_7_days":
        currentStart.setDate(now.getDate() - 7)
        currentStart.setHours(0, 0, 0, 0)
        break
      case "this_year":
        currentStart.setFullYear(now.getFullYear())
        currentStart.setMonth(0, 1)
        currentStart.setHours(0, 0, 0, 0)
        break
      case "this_month":
        currentStart.setDate(1)
        currentStart.setHours(0, 0, 0, 0)
        break
      case "last_month":
        currentStart.setMonth(now.getMonth() - 1)
        currentStart.setDate(1)
        currentStart.setHours(0, 0, 0, 0)
        currentEnd.setDate(0)
        currentEnd.setHours(23, 59, 59, 999)
        break
      case "last_year":
        currentStart.setFullYear(now.getFullYear() - 1)
        currentStart.setMonth(0, 1)
        currentStart.setHours(0, 0, 0, 0)
        currentEnd.setFullYear(now.getFullYear() - 1)
        currentEnd.setMonth(11, 31)
        currentEnd.setHours(23, 59, 59, 999)
        break
      case "last_6_months":
        currentStart.setMonth(now.getMonth() - 5)
        currentStart.setDate(1)
        currentStart.setHours(0, 0, 0, 0)
        break
      default:
        currentStart.setDate(1)
        currentStart.setHours(0, 0, 0, 0)
    }
    return { start: currentStart, end: currentEnd }
  }

  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      // Fetch all bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('amount, created_at, status, service_plans(name), user_id')
        .order('created_at', { ascending: true })

      if (bookingsError) throw bookingsError

      let profiles = []
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')

      if (!profilesError) profiles = profilesData || []

      // --- Global Metrics (Always All Time based on user request "Same i want in Revenue & Orders Trend right side displayed") ---
      // Implied: Top cards remain global totals, only the Trend Chart is filtered.
      const totalRevenue = bookings.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0)
      const totalOrders = bookings.length
      const avgOrderVal = totalOrders > 0 ? totalRevenue / totalOrders : 0

      const customerIds = new Set()
      profiles?.forEach(p => {
        const id = p.auth_user_id || p.user_id
        if (id) customerIds.add(id)
      })
      bookings?.forEach(b => { if (b.user_id) customerIds.add(b.user_id) })

      setKeyMetrics({
        revenue: totalRevenue,
        orders: totalOrders,
        customers: customerIds.size,
        avgOrderValue: avgOrderVal
      })


      // --- Chart Data Filtering ---
      const { start, end } = getDateRange(dateRange)
      const isAllTime = dateRange === "all_time" && !customDate?.from // True all time

      // Update Label
      if (dateRange === "all_time") {
        if (customDate?.from) {
          setDateRangeLabel(customDate.to ?
            `${format(customDate.from, "LLL dd, y")} - ${format(customDate.to, "LLL dd, y")}` :
            format(customDate.from, "LLL dd, y"))
        } else {
          // Default All Time: Show current date 
          setDateRangeLabel(format(new Date(), "LLL dd, y"))
        }
      } else {
        setDateRangeLabel(`${format(start, "LLL dd, y")} - ${format(end, "LLL dd, y")}`)
      }


      const filteredBookings = bookings.filter(b => {
        if (isAllTime) return true
        const d = new Date(b.created_at)
        return d >= start && d <= end
      })

      // Determine grouping: Daily if <= 60 days, else Monthly
      let useDaily = false
      if (!isAllTime) {
        const diffTime = Math.abs(end - start)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        useDaily = diffDays <= 62
      }

      const chartStats = {}
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

      // Initialize Chart buckets
      let iterDate = isAllTime
        ? (bookings.length > 0 ? new Date(bookings[0].created_at) : new Date())
        : new Date(start)
      const endDate = isAllTime ? new Date() : new Date(end)

      if (isAllTime) iterDate.setDate(1) // Start from 1st of month for consistency

      // Guard for empty initial state
      if (iterDate > endDate && !isAllTime) iterDate = new Date(endDate)

      while (iterDate <= endDate) {
        let key, sortKey
        if (useDaily) {
          key = format(iterDate, "MMM dd")
          sortKey = iterDate.getTime()
          iterDate.setDate(iterDate.getDate() + 1)
        } else {
          key = `${months[iterDate.getMonth()]} ${iterDate.getFullYear()}`
          sortKey = iterDate.getFullYear() * 100 + iterDate.getMonth()
          iterDate.setMonth(iterDate.getMonth() + 1)
          iterDate.setDate(1) // Reset to 1st to avoid skipping months with shorter days
        }

        chartStats[key] = { name: key, revenue: 0, orders: 0, sortKey }
      }

      // Populate Data
      filteredBookings.forEach(b => {
        const d = new Date(b.created_at)
        let key
        if (useDaily) {
          key = format(d, "MMM dd")
        } else {
          key = `${months[d.getMonth()]} ${d.getFullYear()}`
        }

        if (chartStats[key]) {
          chartStats[key].revenue += parseFloat(b.amount || 0)
          chartStats[key].orders += 1
        }
      })

      const finalChartData = Object.values(chartStats).sort((a, b) => a.sortKey - b.sortKey)
      setChartData(finalChartData.length > 0 ? finalChartData : [{ name: "No Data", revenue: 0, orders: 0 }])


      // --- Service Stats (Also Global or Filtered? Request said "Revenue & Orders Trend", likely top services stays global unless specified. I'll keep it simple and consistent: Top Services usually reflects current context. Let's make Top Services reflect the Filtered Range too for consistency.) ---
      // Decision: Dashboard usually filters everything. I'll filter Top Services too.
      const serviceStats = {}
      filteredBookings.forEach(booking => {
        const serviceName = booking.service_plans?.name || "Unknown Service"
        if (!serviceStats[serviceName]) {
          serviceStats[serviceName] = { name: serviceName, sales: 0, revenue: 0 }
        }
        serviceStats[serviceName].sales += 1
        serviceStats[serviceName].revenue += parseFloat(booking.amount || 0)
      })

      const servicesArray = Object.values(serviceStats).sort((a, b) => b.revenue - a.revenue)
      setTopServices(servicesArray)

      // Service Distribution
      const colors = ["#00D4AA", "#0066FF", "#FF6B35", "#FFC107", "#9C27B0", "#E91E63", "#3F51B5"]
      const distArray = servicesArray.map((s, i) => ({
        name: s.name,
        value: s.sales,
        color: colors[i % colors.length]
      }))
      setServiceDistribution(distArray)

    } catch (error) {
      console.error("Error fetching analytics data:", error)
      toast({
        variant: "destructive",
        title: "Error Loading Analytics",
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, [dateRange, customDate])

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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Revenue & Orders Trend</CardTitle>
            <CardDescription>{dateRange === 'all_time' ? "All time performance" : `Performance for ${dateRangeLabel}`}</CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
              <Calendar className="w-4 h-4 text-gray-500 ml-2" />
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[150px] border-0 focus:ring-0 shadow-none h-9 font-medium text-gray-700">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_time" className="cursor-pointer">All Time</SelectItem>
                  <SelectItem value="last_6_months" className="cursor-pointer">Last 6 Months</SelectItem>
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
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" hide={false} tick={{ fontSize: 12 }} />
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
