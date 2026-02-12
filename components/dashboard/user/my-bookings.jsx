"use client"

import { useState, useEffect } from "react"
import { CURRENCY_SYMBOLS } from "@/lib/exchange-rate"


import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Eye, Download, Plane, Calendar, Filter, ChevronDown, XCircle, MoveRight, ArrowLeftRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { SkeletonCard, SkeletonCardContent } from "@/components/ui/skeleton-card"
import { RefreshButton } from "@/components/ui/refresh-button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu"
import { Pagination } from "@/components/ui/pagination"

import { RecipientPDF } from "@/components/pdf/RecipientPDF"
import { useTicketDownload } from "@/hooks/use-ticket-download"

const Booking = {
  id: "",
  route: "",
  departure: "",
  arrival: "",
  date: "",
  passenger: "",
  email: "",
  phone: "",
  type: "",
  status: "",
  amount: 0,
  bookingDate: "",
}

const MyBookingsProps = {
  setActiveSection: null,
}

const formatLocation = (loc) => {
  if (!loc) return loc;
  return loc.replace(/ - ([a-zA-Z]+)$/, (match, code) => ` - ${code.toUpperCase()}`);
};

export function MyBookings({ setActiveSection, initialBookings = [] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const { download, isDownloading, templateRef } = useTicketDownload()

  // Keep track of which booking is being downloaded for the UI feedback
  const [downloadingBookingId, setDownloadingBookingId] = useState(null)

  const activeFiltersCount = (statusFilter !== "all" ? 1 : 0) + (searchTerm ? 1 : 0)

  const clearAllFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setCurrentPage(1)
  }

  const router = useRouter()
  const { toast } = useToast()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [bookings, setBookings] = useState(initialBookings)

  useEffect(() => {
    setBookings(initialBookings)
  }, [initialBookings])

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.route.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || booking.status.toLowerCase() === statusFilter
    return matchesSearch && matchesStatus
  })

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking)
    setIsDialogOpen(true)
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-orange-100 text-orange-800"
      case "paid":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDownloadTicket = async (bookingId) => {
    const booking = bookings.find((b) => b.id === bookingId)
    if (!booking) return

    setDownloadingBookingId(bookingId)
    toast({
      title: "Generating Ticket",
      description: `Preparing your download for booking ${bookingId}...`,
    })

    const success = await download(booking)

    if (success) {
      toast({
        title: "Download Complete",
        description: `Ticket for booking ${bookingId} has been downloaded.`,
      })
    } else {
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "There was an error generating your ticket. Please try again.",
      })
    }

    setDownloadingBookingId(null)
  }

  const handleContactSupport = () => {
    setIsDialogOpen(false)
    router.push("/user/support")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="lg:text-3xl text-2xl font-bold">My Bookings</h2>
        <div className="flex items-center gap-2">
          <RefreshButton
            onRefreshStart={() => setIsRefreshing(true)}
            onRefreshEnd={() => setIsRefreshing(false)}
          />
          <Button className="cursor-pointer" onClick={() => router.push("/buy-ticket")}>Book New Ticket</Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by booking ID or route..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center justify-between w-full md:w-48 h-[44px] px-3 py-2 text-sm font-medium transition-colors bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Filters</span>
                    {statusFilter !== "all" && (
                      <Badge variant="secondary" className="px-1.5 py-0 h-5 bg-blue-100 text-blue-700 hover:bg-blue-100 border-none text-[10px] font-bold uppercase tracking-wider">
                        {statusFilter}
                      </Badge>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 ml-auto text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={clearAllFilters}
                  className="text-red-600 focus:text-red-600 cursor-pointer font-medium bg-red-50/50 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Clear All Filters
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={statusFilter === "all"}
                  onCheckedChange={() => setStatusFilter("all")}
                >
                  All Status
                </DropdownMenuCheckboxItem>
                {["active", "pending", "processing", "completed", "cancelled"].map(status => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={statusFilter === status}
                    onCheckedChange={() => setStatusFilter(status)}
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

      {/* Bookings List */}
      <div className="space-y-4">
        {loading || isRefreshing ? (
          // Loading skeleton cards
          Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i}>
              <div className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-200 animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                      </div>
                      <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                      <div className="flex items-center gap-4">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </SkeletonCard>
          ))
        ) : paginatedBookings.length > 0 ? (
          paginatedBookings.map((booking) => (
            <Card key={booking.id} className="hover:bg-gray-100 hover:border-blue-200 transition-colors duration-200">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-50 border border-blue-100/50">
                      {booking.isRoundTrip ? (
                        <ArrowLeftRight className="h-8 w-8 text-blue-600" />
                      ) : (
                        <Plane className="h-8 w-8 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                        <p className="text-sm text-gray-400">ID: {booking.id}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex flex-col bg-blue-50/50 px-2 py-1 rounded border border-blue-100/50 min-w-[70px]">
                          <span className="text-[8px] font-bold text-blue-400 uppercase leading-none mb-1">From</span>
                          <span className="text-xs font-bold text-blue-700 truncate" title={booking.departure}>{formatLocation(booking.departure)}</span>
                        </div>

                        {booking.isRoundTrip ? (
                          <ArrowLeftRight className="h-4 w-4 text-slate-400" />
                        ) : (
                          <MoveRight className="h-4 w-4 text-slate-400" />
                        )}

                        <div className="flex flex-col bg-emerald-50/50 px-2 py-1 rounded border border-emerald-100/50 min-w-[70px]">
                          <span className="text-[8px] font-bold text-emerald-400 uppercase leading-none mb-1">To</span>
                          <span className="text-xs font-bold text-emerald-700 truncate" title={booking.arrival}>{formatLocation(booking.arrival)}</span>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {booking.date}
                        </span>
                        <span>{booking.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(booking)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDownloadTicket(booking.id)} disabled={downloadingBookingId === booking.id}>
                      {downloadingBookingId === booking.id ? (
                        <span className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mr-2"></span>
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">No bookings found</h3>
              <p className="mb-6 max-w-sm text-sm text-gray-500">
                {searchTerm || statusFilter !== "all" ? (
                  <>
                    We couldn't find any bookings matching your search criteria.
                    Try adjusting your filters or search terms.
                  </>
                ) : (
                  <>
                    You don't have any bookings yet.
                    Ready to plan your next journey?
                  </>
                )}
              </p>
              <div className="flex gap-3">
                {(searchTerm || statusFilter !== "all") && (
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                  >
                    Clear Filters
                  </Button>
                )}
                <Button onClick={() => router.push("/buy-ticket")}>
                  Book Your First Ticket
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Booking Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6">
              <div className="flex items-center justify-between rounded-lg bg-blue-50 p-4">
                <div>
                  <p className="text-sm text-gray-600">Booking ID</p>
                  <p className="text-lg font-semibold">{selectedBooking.id}</p>
                </div>
                <Badge className={getStatusColor(selectedBooking.status)}>{selectedBooking.status}</Badge>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-4 font-semibold">Flight Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Route</p>
                      <p className="font-medium">{formatLocation(selectedBooking.route)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Departure</p>
                      <p className="font-medium">{formatLocation(selectedBooking.departure)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Arrival</p>
                      <p className="font-medium">{formatLocation(selectedBooking.arrival)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Travel Date</p>
                      <p className="font-medium">{selectedBooking.date}</p>
                    </div>
                    {selectedBooking.isRoundTrip && selectedBooking.returnDate && (
                      <div>
                        <p className="text-sm text-gray-600">Return Date</p>
                        <p className="font-medium">{selectedBooking.returnDate}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="mb-4 font-semibold">Passenger Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{selectedBooking.passenger}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedBooking.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{selectedBooking.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Service Type</p>
                    <p className="font-semibold">{selectedBooking.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-blue-600">{`${CURRENCY_SYMBOLS[selectedBooking.currency || 'USD'] || '$'}${selectedBooking.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => handleDownloadTicket(selectedBooking.id)} disabled={downloadingBookingId === selectedBooking.id}>
                  {downloadingBookingId === selectedBooking.id ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Download Ticket
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent" onClick={handleContactSupport}>
                  Contact Support
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Hidden PDF template for generation */}
      <RecipientPDF booking={bookings.find(b => b.id === downloadingBookingId) || selectedBooking} ref={templateRef} />
    </div>
  )
}