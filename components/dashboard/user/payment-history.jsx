"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, CreditCard, CheckCircle, FileX, MoveRight, ArrowLeftRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { RefreshButton } from "@/components/ui/refresh-button"
import { CURRENCY_SYMBOLS } from "@/lib/exchange-rate"
import { useCurrency } from "@/contexts/currency-context"
import { Pagination } from "@/components/ui/pagination"

export function PaymentHistory({ initialPayments = [] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const { toast } = useToast()
  const { rates, formatPrice } = useCurrency()

  const [payments, setPayments] = useState(initialPayments)

  useEffect(() => {
    setPayments(initialPayments)
  }, [initialPayments])

  const filteredPayments = payments.filter(
    (payment) =>
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage)
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Calculate total spent by converting all amounts to USD first
  // Calculate total spent by using raw status to include both past (Completed) and future (Active) bookings
  const completedPayments = payments.filter((p) => p.rawStatus === "paid")
  const uniqueCurrencies = [...new Set(completedPayments.map(p => p.currency || 'USD'))]
  const isSingleCurrency = uniqueCurrencies.length === 1
  const singleCurrency = isSingleCurrency ? uniqueCurrencies[0] : null

  let totalSpentDisplay
  let averageTransactionDisplay

  if (isSingleCurrency) {
    const total = completedPayments.reduce((sum, p) => sum + p.amount, 0)
    const symbol = CURRENCY_SYMBOLS[singleCurrency] || '$'

    // Format with commas and 2 decimal places if needed, or integers like the original if round numbers
    // The original formatPrice uses a specific context. Here we want a simple display.
    // Let's us basic toLocaleString
    const formattedTotal = total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    totalSpentDisplay = `${symbol}${formattedTotal}`

    const avg = completedPayments.length > 0 ? total / completedPayments.length : 0
    const formattedAvg = avg.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    averageTransactionDisplay = `${symbol}${formattedAvg}`
  } else {
    // Calculate total spent by converting all amounts to USD first (Existing Logic)
    const totalSpentUSD = completedPayments.reduce((sum, p) => {
      // If payment has currency and we have rates, convert to USD
      if (p.currency && p.currency !== "USD" && rates && rates[p.currency]) {
        return sum + (p.amount / rates[p.currency])
      }
      return sum + p.amount // Assume USD if no info
    }, 0)

    totalSpentDisplay = `$${totalSpentUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    const averageUSD = completedPayments.length > 0 ? totalSpentUSD / completedPayments.length : 0
    averageTransactionDisplay = `$${averageUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleExportAll = () => {
    const csvContent = [
      ["Payment ID", "Booking ID", "Date", "Description", "Method", "Amount", "Currency", "Status"],
      ...payments.map((p) => [p.id, p.bookingId, p.date, p.description, p.method, p.amount, p.currency || 'USD', p.status]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "payment-history.csv"
    link.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Successful",
      description: "Payment history has been exported to CSV.",
    })
  }

  const handleDownloadInvoice = async (paymentId) => {
    const payment = payments.find((p) => p.id === paymentId)
    if (!payment) return

    toast({
      title: "Download Started",
      description: `Generating invoice for ${paymentId}`,
    })

    try {
      // dynamically import to avoid SSR issues with react-pdf if any
      const { pdf } = await import('@react-pdf/renderer');
      const InvoicePDF = (await import('@/components/pdf/InvoicePDF')).default;

      const blob = await pdf(<InvoicePDF payment={payment} />).toBlob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a")
      link.href = url
      link.download = `Invoice-${paymentId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Download Complete",
        description: "Invoice downloaded successfully.",
      })
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast({
        title: "Download Failed",
        description: "Could not generate invoice.",
        variant: "destructive"
      })
    }
  }

  // Empty state component for reusability
  const EmptyState = ({ hasSearch }) => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <FileX className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">
        {hasSearch ? "No payments found" : "No payment history"}
      </h3>
      <p className="mb-4 text-sm text-gray-500 text-center max-w-sm">
        {hasSearch
          ? `No payments match "${searchTerm}". Try searching with different keywords.`
          : "You haven't made any payments yet. Start by booking your first ticket."}
      </p>
      {hasSearch && (
        <Button variant="outline" onClick={() => setSearchTerm("")}>
          Clear search
        </Button>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="lg:text-3xl text-2xl font-bold">Payment History</h2>
        <div className="flex items-center gap-2">
          <RefreshButton
            onRefreshStart={() => setIsRefreshing(true)}
            onRefreshEnd={() => setIsRefreshing(false)}
          />
          <Button className="cursor-pointer" variant="outline" onClick={handleExportAll} disabled={filteredPayments.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-blue-100 hover:bg-white duration-300 ease-in-out">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-gray-600">Total Spent</p>
                <p className="text-3xl font-bold mt-2">{totalSpentDisplay}</p>
              </div>
              <div className="bg-blue-200 p-3 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-100 hover:bg-white duration-300 ease-in-out">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-gray-600">Total Transactions</p>
                <p className="text-3xl font-bold mt-2">{payments.length}</p>
              </div>
              <div className="bg-green-200 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-100 hover:bg-white duration-300 ease-in-out">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-gray-600">Average Transaction</p>
                <p className="text-3xl font-bold mt-2">
                  {averageTransactionDisplay}
                </p>
              </div>
              <div className="bg-purple-200 p-3 rounded-lg">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by payment ID, booking ID, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {isRefreshing ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/12"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/12"></div>
                </div>
              ))}
            </div>
          ) : filteredPayments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Travel Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.id}</TableCell>
                    <TableCell>{payment.bookingId}</TableCell>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-gray-500">{payment.type}</span>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-blue-50/50 px-1.5 py-0.5 rounded border border-blue-100/30 max-w-[120px]" title={payment.departure}>
                            <span className="text-[12px] font-bold text-blue-700 truncate">{payment.departure}</span>
                          </div>

                          {payment.isRoundTrip ? (
                            <ArrowLeftRight className="h-3 w-3 text-slate-400" />
                          ) : (
                            <MoveRight className="h-3 w-3 text-slate-400" />
                          )}

                          <div className="flex items-center bg-emerald-50/50 px-1.5 py-0.5 rounded border border-emerald-100/30 max-w-[120px]" title={payment.arrival}>
                            <span className="text-[12px] font-bold text-emerald-700 truncate">{payment.arrival}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell className="font-semibold">{CURRENCY_SYMBOLS[payment.currency] || '$'}{payment.amount}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor("paid")}>Paid</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleDownloadInvoice(payment.id)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState hasSearch={searchTerm.length > 0} />
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  )
}