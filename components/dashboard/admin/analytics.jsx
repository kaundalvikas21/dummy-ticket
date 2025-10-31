"use client"

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

export function Analytics() {
  const monthlyData = [
    { month: "Jan", revenue: 4500, orders: 145 },
    { month: "Feb", revenue: 5200, orders: 168 },
    { month: "Mar", revenue: 4800, orders: 156 },
    { month: "Apr", revenue: 6100, orders: 198 },
    { month: "May", revenue: 7200, orders: 234 },
    { month: "Jun", revenue: 6800, orders: 221 },
  ]

  const topServices = [
    { name: "Visa Ticket", sales: 1234, revenue: 23446 },
    { name: "Ticket & Hotel", sales: 856, revenue: 29960 },
    { name: "Return Ticket", sales: 567, revenue: 8505 },
  ]

  const serviceDistribution = [
    { name: "Visa Ticket", value: 1234, color: "#0066FF" },
    { name: "Ticket & Hotel", value: 856, color: "#00D4AA" },
    { name: "Return Ticket", value: 567, color: "#FF6B35" },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-600 mt-1">Track performance and business insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">$61,911</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +12.5% from last month
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
                <p className="text-2xl font-bold text-gray-900">2,657</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +8.2% from last month
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
                <p className="text-sm text-gray-600">New Customers</p>
                <p className="text-2xl font-bold text-gray-900">342</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +15.3% from last month
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
                <p className="text-2xl font-bold text-gray-900">$23.30</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +3.8% from last month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue & Orders Trend</CardTitle>
          <CardDescription>Monthly performance over the last 6 months</CardDescription>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Services</CardTitle>
            <CardDescription>Revenue comparison by service type</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: {
                  label: "Revenue ($)",
                  color: "#0066FF",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topServices} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" fill="#0066FF" radius={[8, 8, 0, 0]} name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Distribution</CardTitle>
            <CardDescription>Sales breakdown by service type</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Sales",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {serviceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Service Performance</CardTitle>
          <CardDescription>Complete breakdown of all services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topServices.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0066FF] to-[#00D4AA] flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{service.name}</h4>
                    <p className="text-sm text-gray-600">{service.sales} sales</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">${service.revenue.toLocaleString()}</p>
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
