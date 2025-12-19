"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Users, DollarSign, ShoppingCart, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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

      bookings.forEach(booking => {
        const date = new Date(booking.created_at)
        const monthYearKey = `${months[date.getMonth()]} ${date.getFullYear()}`

        if (!monthlyStats[monthYearKey]) {
          monthlyStats[monthYearKey] = {
            month: monthYearKey,
            revenue: 0,
            orders: 0,
            sortKey: date.getFullYear() * 100 + date.getMonth()
          }
        }
        monthlyStats[monthYearKey].revenue += parseFloat(booking.amount || 0)
        monthlyStats[monthYearKey].orders += 1
      })

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
      const colors = ["#0066FF", "#00D4AA", "#FF6B35", "#FFC107", "#9C27B0"]
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
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? "..." : `$${keyMetrics.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  Lifetime
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <ShoppingCart className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? "..." : keyMetrics.orders}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  Lifetime
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? "..." : keyMetrics.customers}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  Registered
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg. Order Value</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? "..." : `$${keyMetrics.avgOrderValue.toFixed(2)}`}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  Per order
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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
                color: "#0066FF",
              },
              orders: {
                label: "Orders",
                color: "#00D4AA",
              },
            }}
            className="h-[350px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis yAxisId="left" stroke="#0066FF" />
                <YAxis yAxisId="right" orientation="right" stroke="#00D4AA" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0066FF"
                  strokeWidth={2}
                  name="Revenue ($)"
                  dot={{ fill: "#0066FF", r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="#00D4AA"
                  strokeWidth={2}
                  name="Orders"
                  dot={{ fill: "#00D4AA", r: 4 }}
                  activeDot={{ r: 6 }}
                />
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
                  color: "#0066FF",
                },
              }}
              className="h-[250px] sm:h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topServices} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    stroke="#6b7280"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" fill="#0066FF" radius={[8, 8, 0, 0]} name="Revenue ($)" />
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
              className="h-[250px] sm:h-[300px]"
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
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#0066FF] to-[#00D4AA] flex items-center justify-center text-white font-bold text-sm">
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
