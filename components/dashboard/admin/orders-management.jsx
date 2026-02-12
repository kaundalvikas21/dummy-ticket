"use client"

import { useState, useEffect } from "react"
import { Search, Download, Eye, Edit, Trash2, RefreshCw, MoreHorizontal, Filter, ChevronDown, Pencil, XCircle, MoveRight, ArrowLeftRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { SkeletonTable } from "@/components/ui/skeleton-table"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Pagination } from "@/components/ui/pagination"
// Import Currency Context
import { useCurrency } from "@/contexts/currency-context"

export function OrdersManagement() {
  const { rates } = useCurrency() // Consume rates
  const [orders, setOrders] = useState([])
  const [rawBookings, setRawBookings] = useState([]) // Store raw data
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all") // Changed from statusFilter
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10
  const { toast } = useToast()
  const supabase = createClient()

  const fetchOrders = async (showLoader = true) => {
    if (showLoader) setLoading(true)
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, service_plans(name)')
        .order('created_at', { ascending: false })

      if (error) throw error

      setRawBookings(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      console.error('Error details:', {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      })
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch orders."
      })
    } finally {
      if (showLoader) setLoading(false)
    }
  }

  // Process raw bookings into display format whenever data or rates change
  useEffect(() => {
    if (!rawBookings.length) {
      setOrders([])
      return
    }

    const formattedOrders = rawBookings.map(booking => {
      let passengerName = "Guest"
      let passengerEmail = "N/A"
      let passengerPhone = "N/A"
      let fromCity = "N/A"
      let toCity = "N/A"
      let travelDate = "N/A"

      try {
        if (booking.passenger_details) {
          const details = typeof booking.passenger_details === 'string'
            ? JSON.parse(booking.passenger_details)
            : booking.passenger_details

          if (Array.isArray(details) && details.length > 0) {
            const p = details[0]
            passengerName = `${p.firstName || ''} ${p.lastName || ''}`.trim()
            passengerEmail = p.email || p.contactEmail || "N/A"
            passengerPhone = p.phone || p.contactPhone || "N/A"
            fromCity = p.fromCity || p.departureCity || "N/A"
            toCity = p.toCity || p.arrivalCity || "N/A"
            travelDate = p.departureDate || "N/A"
          } else {
            if (details.firstName) {
              passengerName = `${details.firstName} ${details.lastName}`.trim()
            }
            passengerEmail = details.contactEmail || details.email || "N/A"
            passengerPhone = details.contactPhone || details.phone || "N/A"
            fromCity = details.departureCity || details.fromCity || "N/A"
            toCity = details.arrivalCity || details.toCity || "N/A"
            travelDate = details.departureDate || "N/A"
          }
        }
      } catch (e) { console.error("Error parsing details", e) }

      // Detect round trip
      let isRoundTrip = false
      try {
        const details = typeof booking.passenger_details === 'string'
          ? JSON.parse(booking.passenger_details)
          : booking.passenger_details

        if (Array.isArray(details) && details.length > 0) {
          isRoundTrip = details[0].tripType === 'round-trip' || !!details[0].returnDate
        } else if (details) {
          isRoundTrip = details.tripType === 'round-trip' || !!details.returnDate
        }
      } catch (e) { }

      // Convert to USD
      const nativeAmount = parseFloat(booking.amount || 0)
      const currencyCode = booking.currency || 'USD'
      const rate = (rates && rates[currencyCode]) ? rates[currencyCode] : 1
      const amountInUSD = currencyCode === 'USD' ? nativeAmount : (rate ? nativeAmount / rate : nativeAmount)

      const formatLocation = (loc) => {
        if (!loc || loc === "N/A") return loc
        return loc.replace(/ - ([a-zA-Z]+)$/, (match, code) => ` - ${code.toUpperCase()}`)
      }

      return {
        id: booking.id,
        customer: passengerName || 'Guest',
        email: passengerEmail,
        service: booking.service_plans?.name || 'Unknown Service',
        amount: amountInUSD, // Now in USD
        currency: 'USD',    // Force display logic to USD
        status: booking.status,
        booking_status: booking.booking_status || 'confirmed',
        date: new Date(booking.created_at).toLocaleDateString(),
        departure: formatLocation(fromCity),
        arrival: formatLocation(toCity),
        phone: passengerPhone,
        pnr: booking.pnr || 'N/A',
        payment_intent_id: booking.payment_intent_id || 'N/A',
        isRoundTrip: isRoundTrip,
        travelDate: travelDate || 'N/A',
        details: { ...booking }
      }
    })

    setOrders(formattedOrders)
  }, [rawBookings, rates])

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterStatus])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setLoading(true) // Show skeleton
    await Promise.all([
      fetchOrders(false), // Fetch data without toggling loader off
      new Promise(resolve => setTimeout(resolve, 800))
    ])
    setLoading(false) // Hide skeleton only after delay
    setIsRefreshing(false)
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = filterStatus === "all" || order.booking_status.toLowerCase() === filterStatus.toLowerCase()

    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleView = (order) => {
    setSelectedOrder(order)
    setIsViewDialogOpen(true)
  }

  const handleEdit = (order) => {
    setSelectedOrder(order)
    setIsEditDialogOpen(true)
  }

  const handleUpdateStatus = async (newStatus) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', selectedOrder.id)

      if (error) throw error

      toast({
        title: "Payment Status Updated",
        description: `Order ${selectedOrder.id} payment status changed to ${newStatus}`
      })
      fetchOrders() // Refresh list
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update payment status."
      })
    }
  }

  const handleUpdateBookingStatus = async (newBookingStatus) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ booking_status: newBookingStatus })
        .eq('id', selectedOrder.id)

      if (error) throw error

      toast({
        title: "Booking Status Updated",
        description: `Order ${selectedOrder.id} booking status changed to ${newBookingStatus}`
      })
      fetchOrders() // Refresh list
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error('Error updating booking status:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update booking status."
      })
    }
  }

  const getBookingStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
      case "pending":
        return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
      case "processing":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100"
      case "cancelled":
        return "bg-red-100 text-red-700 hover:bg-red-100"
      default:
        return "bg-slate-100 text-slate-700 hover:bg-slate-100"
    }
  }

  const handleDeleteClick = (order) => {
    setOrderToDelete(order)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (orderToDelete) {
      try {
        const { error } = await supabase
          .from('bookings')
          .delete()
          .eq('id', orderToDelete.id)

        if (error) throw error

        toast({
          title: "Order Deleted",
          description: "Order has been permanently removed"
        })
        setOrders(orders.filter((order) => order.id !== orderToDelete.id))
        setIsDeleteDialogOpen(false)
      } catch (error) {
        console.error('Error deleting order:', error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete order."
        })
      } finally {
        setIsDeleteDialogOpen(false)
        setOrderToDelete(null)
      }
    }
  }

  const handleExport = () => {
    const csv = [
      ["Order ID", "Transaction ID", "Customer", "Email", "Service", "Amount", "Payment Status", "Booking Status", "Booking Date", "Travel Date", "Departure", "Arrival"].join(","),
      ...filteredOrders.map((order) =>
        [
          order.id,
          order.payment_intent_id,
          order.customer,
          order.email,
          order.service,
          `${order.currency} ${order.amount.toFixed(2)}`,
          order.status,
          order.booking_status,
          order.date,
          order.travelDate,
          order.departure,
          order.arrival,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const clearFilters = () => {
    setSearchQuery("")
    setFilterStatus("all")
  }

  const activeFiltersCount = [
    filterStatus !== "all",
    searchQuery !== "",
  ].filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600 mt-1">Manage and track all customer bookings</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            title="Refresh"
            className="cursor-pointer gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading || isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button className="bg-linear-to-r from-[#0066FF] to-[#00D4AA] text-white cursor-pointer" onClick={handleExport} disabled={filteredOrders.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export Orders
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
                placeholder="Search by order ID, customer name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-w-[140px] gap-2">
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                  {filterStatus !== "all" && (
                    <Badge variant="secondary" className={`px-1.5 py-0 h-5 border-none text-[10px] font-bold uppercase tracking-wider ${getBookingStatusColor(filterStatus)}`}>
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
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {['all', 'confirmed', 'pending', 'processing', 'cancelled'].map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={filterStatus === status}
                    onCheckedChange={() => setFilterStatus(status)}
                    className="capitalize"
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
                ))}

              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders {loading ? '' : `(${filteredOrders.length})`}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <SkeletonTable rows={5} columns={8} />
          ) : (
            <div className="overflow-x-auto pb-4">
              <table className="w-full min-w-[1200px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 whitespace-nowrap">Order ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 whitespace-nowrap">Transaction ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 whitespace-nowrap">Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 whitespace-nowrap">Service</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 whitespace-nowrap">Route</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 whitespace-nowrap">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 whitespace-nowrap">Payment Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 whitespace-nowrap">Booking Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 whitespace-nowrap md:min-w-[140px]">Booking Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.length > 0 ? (
                    paginatedOrders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900 whitespace-nowrap" title={order.id}>{order.id}</td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-900 whitespace-nowrap" title={order.payment_intent_id}>{order.payment_intent_id}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">{order.customer}</span>
                            <span className="text-xs text-gray-500">{order.email}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap">{order.service}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col bg-blue-50/50 px-2 py-1 rounded border border-blue-100/50 min-w-[70px] max-w-[150px]">
                              <span className="text-[8px] font-bold text-blue-400 uppercase leading-none mb-1">From</span>
                              <span className="text-xs font-bold text-blue-700 truncate" title={order.departure}>{order.departure}</span>
                            </div>
                            {order.isRoundTrip ? (
                              <ArrowLeftRight className="h-4 w-4 text-slate-400" />
                            ) : (
                              <MoveRight className="h-4 w-4 text-slate-400" />
                            )}
                            <div className="flex flex-col bg-emerald-50/50 px-2 py-1 rounded border border-emerald-100/50 min-w-[70px] max-w-[150px]">
                              <span className="text-[8px] font-bold text-emerald-400 uppercase leading-none mb-1">To</span>
                              <span className="text-xs font-bold text-emerald-700 truncate" title={order.arrival}>{order.arrival}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-900">${order.amount.toFixed(2)}</td>
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
                        <td className="py-3 px-4">
                          <Badge
                            variant={order.booking_status === "confirmed" ? "default" : "outline"}
                            className={getBookingStatusColor(order.booking_status)}
                          >
                            {order.booking_status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{order.date}</td>
                        <td className="py-3 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleView(order)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(order)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Update Status
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => handleDeleteClick(order)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Order
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="w-20 h-20 bg-linear-to-br from-blue-50 to-teal-50 rounded-full flex items-center justify-center">
                            <Search className="w-10 h-10 text-gray-400" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-lg font-semibold text-gray-900">No orders found</h3>
                            <p className="text-sm text-gray-500 max-w-sm mx-auto">
                              {searchQuery || filterStatus !== "all" ? (
                                <>
                                  We couldn't find any orders matching your search criteria.
                                  <br />
                                  Try adjusting your filters or search terms.
                                </>
                              ) : (
                                "No orders have been placed yet."
                              )}
                            </p>
                          </div>
                          {(searchQuery || filterStatus !== "all") && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSearchQuery("")
                                setFilterStatus("all")
                              }}
                              className="mt-2"
                            >
                              Clear filters
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
        {!loading && filteredOrders.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Full details for order <span className="font-mono text-xs">{selectedOrder?.id}</span>
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Customer Name</Label>
                  <p className="font-semibold">{selectedOrder.customer}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Email</Label>
                  <p className="font-semibold">{selectedOrder.email}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Phone</Label>
                  <p className="font-semibold">{selectedOrder.phone}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Service</Label>
                  <p className="font-semibold">{selectedOrder.service}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Departure</Label>
                  <p className="font-semibold">{selectedOrder.departure}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Arrival</Label>
                  <p className="font-semibold">{selectedOrder.arrival}</p>
                </div>
                <div>
                  <Label className="text-gray-600">PNR Code</Label>
                  <p className="font-semibold">{selectedOrder.pnr}</p>
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
                  <Label className="text-gray-600">Booking Status</Label>
                  <Badge className={getBookingStatusColor(selectedOrder.booking_status)}>
                    {selectedOrder.booking_status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-gray-600">Booking Date</Label>
                  <p className="font-semibold">{selectedOrder.date}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Travel Date</Label>
                  <p className="font-semibold">{selectedOrder.travelDate}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-600">Transaction ID</Label>
                  <p className="font-mono text-xs text-gray-700 break-all">{selectedOrder.payment_intent_id}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>Change the status of order <span className="font-mono">{selectedOrder?.id}</span></DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Booking Status</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className={`justify-start bg-transparent transition-colors hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 ${selectedOrder?.booking_status === 'confirmed' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : ''}`}
                onClick={() => handleUpdateBookingStatus("confirmed")}
              >
                Confirmed
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`justify-start bg-transparent transition-colors hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-200 ${selectedOrder?.booking_status === 'pending' ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : ''}`}
                onClick={() => handleUpdateBookingStatus("pending")}
              >
                Pending
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`justify-start bg-transparent transition-colors hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 ${selectedOrder?.booking_status === 'processing' ? 'border-blue-500 bg-blue-50 text-blue-700' : ''}`}
                onClick={() => handleUpdateBookingStatus("processing")}
              >
                Processing
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`justify-start transition-colors hover:bg-red-50 hover:text-red-700 hover:border-red-200 bg-transparent ${selectedOrder?.booking_status === 'cancelled' ? 'border-red-500 bg-red-50 text-red-700' : 'text-red-600'}`}
                onClick={() => handleUpdateBookingStatus("cancelled")}
              >
                Cancelled
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the order from the database.
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
    </div >
  )
}