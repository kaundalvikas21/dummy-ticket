"use client"

import { useState, useEffect } from "react"
import { Search, Download, Eye, Mail, Phone, Filter, ChevronDown, RefreshCw, Trash2, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { SkeletonTable } from "@/components/ui/skeleton-table"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { RefreshButton } from "@/components/ui/refresh-button"
import { Pagination } from "@/components/ui/pagination"
import { useCurrency } from "@/contexts/currency-context"

export function CustomersManagement() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState(null)

  // Filter states
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterOrderRange, setFilterOrderRange] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  const { rates } = useCurrency()
  const { toast } = useToast()
  const supabase = createClient()

  const fetchCustomers = async (showLoader = true) => {
    if (showLoader) setLoading(true)
    try {
      // Fetch user profiles and all bookings in parallel
      const [{ data: profiles, error: profilesError }, { data: bookings, error: bookingsError }] = await Promise.all([
        supabase.from('user_profiles').select('*'),
        supabase.from('bookings').select('user_id, amount, currency, passenger_details, created_at')
      ])

      if (profilesError) throw profilesError
      if (bookingsError) throw bookingsError

      // Helper to extract info from passenger_details
      const getInfoFromDetails = (details) => {
        if (!details) return {}
        try {
          const d = typeof details === 'string' ? JSON.parse(details) : details
          // Some structures might be an array, some a single object
          const p = Array.isArray(d) ? d[0] : d
          return {
            email: p?.email || p?.contactEmail || p?.deliveryEmail || null,
            firstName: p?.firstName || p?.name || null,
            lastName: p?.lastName || null,
            phone: p?.phone || p?.whatsappNumber || null
          }
        } catch (e) { return {} }
      }

      // We'll use a Map to keep track of unique customers by user_id
      const customerMap = new Map()

      // 1. Initialize from Profiles
      profiles?.forEach(profile => {
        const id = profile.auth_user_id || profile.user_id || profile.id
        const firstName = profile.first_name || '';
        const lastName = profile.last_name || '';
        let displayName = (firstName === lastName || !lastName)
          ? firstName
          : `${firstName} ${lastName}`.trim();

        if (displayName === 'Unknown User' || !firstName || firstName === 'Unknown') {
          displayName = 'Customer';
        }

        customerMap.set(id, {
          id: id.toString(),
          auth_user_id: profile.auth_user_id,
          user_id: profile.user_id,
          profile_id: profile.id,
          name: displayName,
          email: profile.email || 'N/A',
          phone: profile.phone_number || 'N/A',
          location: `${profile.city || ''}, ${profile.country || ''}`.replace(/^, $/, 'N/A'),
          orders: 0,
          spent: 0,
          status: "active",
          avatar_url: profile.avatar_url,
          joinDate: new Date(profile.created_at || Date.now()).toLocaleDateString(),
          rawJoinDate: new Date(profile.created_at || Date.now())
        })
      })

      // 2. Aggregate Bookings and add missing users
      bookings?.forEach(booking => {
        const userId = booking.user_id

        if (!userId) return

        let customer = customerMap.get(userId)

        if (!customer) {
          // If the user profile doesn't exist (e.g. deleted), we do NOT want to show them
          // even if they have bookings. This checks strictly against the fetched profiles.
          return
        }

        customer.orders += 1
        const amount = parseFloat(booking.amount || 0)
        const currencyCode = booking.currency || 'USD'

        // Convert to USD if needed
        let finalAmount = amount
        if (currencyCode !== 'USD') {
          const rate = (rates && rates[currencyCode]) ? rates[currencyCode] : 1
          finalAmount = rate ? amount / rate : amount
        }

        customer.spent += finalAmount

        const bookingDate = new Date(booking.created_at)
        if (bookingDate < customer.rawJoinDate) {
          customer.rawJoinDate = bookingDate
          customer.joinDate = bookingDate.toLocaleDateString()
        }
      })

      const formattedCustomers = Array.from(customerMap.values())
      setCustomers(formattedCustomers)
    } catch (error) {
      console.error('Error fetching customers:', error)
      console.error('Error details:', {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      })
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch customers."
      })
    } finally {
      if (showLoader) setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [rates])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterStatus])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setLoading(true)
    try {
      await fetchCustomers(false)
      // Small delay for UI feel
      await new Promise(resolve => setTimeout(resolve, 800))
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return

    try {
      // Use auth_user_id as the primary identifier for Auth deletion
      // If auth_user_id is missing, we can't delete from Auth easily properly (unless we have a way to lookup).
      // But assuming the customer object was built with it.
      const userIdToDelete = customerToDelete.auth_user_id

      if (!userIdToDelete) {
        throw new Error("Cannot delete user: Missing Auth ID")
      }

      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userIdToDelete }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete user")
      }

      toast({
        title: "Success",
        description: "Customer account permanently deleted."
      })

      // Update local state
      setCustomers(prev => prev.filter(c => c.id !== customerToDelete.id))
    } catch (error) {
      console.error('Error in handleDelete:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete customer record."
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setCustomerToDelete(null)
    }
  }

  // Apply filters and search
  const filteredCustomers = customers
    .filter(
      (customer) =>
        (customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.phone.includes(searchQuery)) &&
        (filterStatus === "all" || customer.status === filterStatus)
    )
    .sort((a, b) => {
      // Default sort by name
      return a.name.localeCompare(b.name)
    })

  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE)
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleView = (customer) => {
    setSelectedCustomer(customer)
    setIsViewDialogOpen(true)
  }

  const handleExport = () => {
    const csv = [
      ["Customer ID", "Name", "Email", "Phone", "Location", "Orders", "Total Spent", "Status", "Join Date"].join(","),
      ...filteredCustomers.map((customer) =>
        [
          customer.id,
          customer.name,
          customer.email,
          customer.phone,
          `"${customer.location}"`, // Quote location to handle commas
          customer.orders,
          customer.spent,
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

  const clearFilters = () => {
    setSearchQuery("")
    setFilterStatus("all")
    setFilterOrderRange("all")
    setSortBy("name")
  }

  const activeFiltersCount = [
    filterStatus !== "all",
    searchQuery !== "",
  ].filter(Boolean).length

  // No Results Component
  const NoResultsMessage = () => (
    <tr>
      <td colSpan="7" className="py-12 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <p className="text-gray-900 font-medium">
              {searchQuery || activeFiltersCount > 0 ? "No customers found" : "No customers yet"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {searchQuery
                ? `No results for "${searchQuery}". Try different search terms.`
                : activeFiltersCount > 0
                  ? "Try adjusting your filters"
                  : "Add your first customer to get started"}
            </p>
          </div>
          {(searchQuery || activeFiltersCount > 0) && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="mt-2"
            >
              Clear all filters
            </Button>
          )}
        </div>
      </td>
    </tr>
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers Management</h1>
          <p className="text-gray-600 mt-1">View and manage customer information</p>
        </div>
        <div className="flex gap-2">
          <RefreshButton
            onRefreshStart={handleRefresh}
            className="cursor-pointer"
          />
          <Button
            className="bg-linear-to-r from-[#0066FF] to-[#00D4AA] text-white cursor-pointer"
            onClick={handleExport}
            disabled={filteredCustomers.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Customers
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-w-[140px] gap-2">
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                  {filterStatus !== "all" && (
                    <Badge variant="secondary" className="px-1.5 py-0 h-5 bg-blue-100 text-blue-700 hover:bg-blue-100 border-none text-[10px] font-bold uppercase tracking-wider">
                      {filterStatus}
                    </Badge>
                  )}
                  <ChevronDown className="w-4 h-4 ml-auto" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={clearFilters}
                  className="text-red-600 focus:text-red-600 font-medium bg-red-50/50 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Clear All Filters
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={filterStatus === "all"}
                  onCheckedChange={() => setFilterStatus("all")}
                >
                  All Status
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterStatus === "active"}
                  onCheckedChange={() => setFilterStatus("active")}
                >
                  Active Only
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterStatus === "inactive"}
                  onCheckedChange={() => setFilterStatus("inactive")}
                >
                  Inactive Only
                </DropdownMenuCheckboxItem>

              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Customers {loading ? '' : `(${filteredCustomers.length})`}
            {!loading && searchQuery && filteredCustomers.length > 0 && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                matching "{searchQuery}"
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <SkeletonTable rows={5} columns={7} />
          ) : (
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
                  {paginatedCustomers.length > 0 ? (
                    paginatedCustomers.map((customer) => (
                      <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              {customer.avatar_url ? (
                                <img src={customer.avatar_url} alt={customer.name} className="h-full w-full object-cover" />
                              ) : (
                                <AvatarFallback className="bg-linear-to-br from-[#0066FF] to-[#00D4AA] text-white">
                                  {customer.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900">{customer.name}</span>
                              <span className="text-xs text-gray-500 font-mono break-all" title={customer.id}>{customer.id}</span>
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
                        <td className="py-3 px-4 text-sm text-gray-700">{customer.orders}</td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-900">${customer.spent.toFixed(2)}</td>
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
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleView(customer)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(customer)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <NoResultsMessage />
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
        {!loading && filteredCustomers.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details - {selectedCustomer?.id}</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  {selectedCustomer.avatar_url ? (
                    <img src={selectedCustomer.avatar_url} alt={selectedCustomer.name} className="h-full w-full object-cover" />
                  ) : (
                    <AvatarFallback className="bg-linear-to-br from-[#0066FF] to-[#00D4AA] text-white text-xl">
                      {selectedCustomer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  )}
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
                  <Label className="text-gray-600">Location</Label>
                  <p className="font-semibold">{selectedCustomer.location}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Join Date</Label>
                  <p className="font-semibold">{selectedCustomer.joinDate}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Total Orders</Label>
                  <p className="font-semibold">{selectedCustomer.orders}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Total Spent</Label>
                  <p className="font-semibold">${selectedCustomer.spent.toFixed(2)}</p>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer's profile record from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}