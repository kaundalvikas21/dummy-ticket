"use client"

import { useState } from "react"
import { Search, Download, Eye, Mail, Phone } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export function CustomersManagement() {
  const [customers] = useState([
    {
      id: "CUST-001",
      name: "John Doe",
      email: "john@example.com",
      phone: "+1 234 567 8900",
      totalOrders: 5,
      totalSpent: "$95.00",
      status: "active",
      joinDate: "2024-12-01",
      address: "123 Main St, New York, NY 10001",
      lastOrder: "2025-01-15",
    },
    {
      id: "CUST-002",
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1 234 567 8901",
      totalOrders: 3,
      totalSpent: "$105.00",
      status: "active",
      joinDate: "2024-12-15",
      address: "456 Oak Ave, Los Angeles, CA 90001",
      lastOrder: "2025-01-15",
    },
    {
      id: "CUST-003",
      name: "Mike Johnson",
      email: "mike@example.com",
      phone: "+1 234 567 8902",
      totalOrders: 2,
      totalSpent: "$30.00",
      status: "active",
      joinDate: "2025-01-05",
      address: "789 Pine Rd, Chicago, IL 60601",
      lastOrder: "2025-01-14",
    },
    {
      id: "CUST-004",
      name: "Sarah Williams",
      email: "sarah@example.com",
      phone: "+1 234 567 8903",
      totalOrders: 1,
      totalSpent: "$19.00",
      status: "inactive",
      joinDate: "2025-01-10",
      address: "321 Elm St, Miami, FL 33101",
      lastOrder: "2025-01-14",
    },
    {
      id: "CUST-005",
      name: "David Brown",
      email: "david@example.com",
      phone: "+1 234 567 8904",
      totalOrders: 4,
      totalSpent: "$140.00",
      status: "active",
      joinDate: "2024-11-20",
      address: "654 Maple Dr, San Francisco, CA 94101",
      lastOrder: "2025-01-13",
    },
  ])

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery),
  )

  const handleView = (customer) => {
    setSelectedCustomer(customer)
    setIsDialogOpen(true)
  }

  const handleExport = () => {
    const csv = [
      ["Customer ID", "Name", "Email", "Phone", "Total Orders", "Total Spent", "Status", "Join Date"].join(","),
      ...filteredCustomers.map((customer) =>
        [
          customer.id,
          customer.name,
          customer.email,
          customer.phone,
          customer.totalOrders,
          customer.totalSpent,
          customer.status,
          customer.joinDate,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `customers-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers Management</h1>
          <p className="text-gray-600 mt-1">View and manage customer information</p>
        </div>
        <Button className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export Customers
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
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Customers ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Contact</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total Orders</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total Spent</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Join Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-gradient-to-br from-[#0066FF] to-[#00D4AA] text-white">
                            {customer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{customer.name}</span>
                          <span className="text-xs text-gray-500">{customer.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Mail className="w-3 h-3" />
                          {customer.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Phone className="w-3 h-3" />
                          {customer.phone}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{customer.totalOrders}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">{customer.totalSpent}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={customer.status === "active" ? "default" : "outline"}
                        className={
                          customer.status === "active"
                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                        }
                      >
                        {customer.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{customer.joinDate}</td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm" onClick={() => handleView(customer)}>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details - {selectedCustomer?.id}</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-gradient-to-br from-[#0066FF] to-[#00D4AA] text-white text-xl">
                    {selectedCustomer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{selectedCustomer.name}</h3>
                  <p className="text-sm text-gray-600">{selectedCustomer.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Email</Label>
                  <p className="font-semibold">{selectedCustomer.email}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Phone</Label>
                  <p className="font-semibold">{selectedCustomer.phone}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Address</Label>
                  <p className="font-semibold">{selectedCustomer.address}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Join Date</Label>
                  <p className="font-semibold">{selectedCustomer.joinDate}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Total Orders</Label>
                  <p className="font-semibold">{selectedCustomer.totalOrders}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Total Spent</Label>
                  <p className="font-semibold">{selectedCustomer.totalSpent}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Last Order</Label>
                  <p className="font-semibold">{selectedCustomer.lastOrder}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Status</Label>
                  <Badge
                    className={
                      selectedCustomer.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    }
                  >
                    {selectedCustomer.status}
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
