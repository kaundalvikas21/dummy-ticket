"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, CreditCard, CheckCircle, FileX } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function PaymentHistory() {
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const payments = [
    {
      id: "PAY-001",
      bookingId: "TKT-12345",
      date: "Dec 10, 2024",
      amount: 19,
      method: "Credit Card",
      status: "Completed",
      description: "Visa Ticket - New York to London",
    },
    {
      id: "PAY-002",
      bookingId: "TKT-12346",
      date: "Dec 12, 2024",
      amount: 15,
      method: "PayPal",
      status: "Completed",
      description: "Return Ticket - Paris to Tokyo",
    },
    {
      id: "PAY-003",
      bookingId: "TKT-12344",
      date: "Nov 5, 2024",
      amount: 35,
      method: "Credit Card",
      status: "Completed",
      description: "Ticket & Hotel - Dubai to Singapore",
    },
  ]

  const filteredPayments = payments.filter(
    (payment) =>
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalSpent = payments.filter((p) => p.status === "Completed").reduce((sum, p) => sum + p.amount, 0)

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleExportAll = () => {
    const csvContent = [
      ["Payment ID", "Booking ID", "Date", "Description", "Method", "Amount", "Status"],
      ...payments.map((p) => [p.id, p.bookingId, p.date, p.description, p.method, p.amount, p.status]),
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

  const handleDownloadInvoice = (paymentId) => {
    const payment = payments.find((p) => p.id === paymentId)
    if (!payment) return

    toast({
      title: "Download Started",
      description: `Downloading invoice for ${paymentId}`,
    })

    // Create PDF-like invoice content
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 600
>>
stream
BT
/F1 24 Tf
50 750 Td
(INVOICE) Tj
0 -40 Td
/F1 12 Tf
(Payment ID: ${payment.id}) Tj
0 -20 Td
(Booking ID: ${payment.bookingId}) Tj
0 -20 Td
(Date: ${payment.date}) Tj
0 -40 Td
(Description: ${payment.description}) Tj
0 -30 Td
(Payment Method: ${payment.method}) Tj
0 -20 Td
(Status: ${payment.status}) Tj
0 -40 Td
/F1 16 Tf
(Amount: $${payment.amount}.00) Tj
0 -40 Td
/F1 10 Tf
(Thank you for your business!) Tj
0 -20 Td
(For questions, contact: billing@dummyticket.com) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000317 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
967
%%EOF`

    const blob = new Blob([pdfContent], { type: "application/pdf" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `invoice-${paymentId}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
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
        <Button className="cursor-pointer" variant="outline" onClick={handleExportAll} disabled={filteredPayments.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export All
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-3xl font-bold mt-2">${totalSpent}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-3xl font-bold mt-2">{payments.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Transaction</p>
                <p className="text-3xl font-bold mt-2">
                  ${payments.length > 0 ? (totalSpent / payments.length).toFixed(2) : "0.00"}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
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
          {filteredPayments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.id}</TableCell>
                    <TableCell>{payment.bookingId}</TableCell>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell className="max-w-xs truncate">{payment.description}</TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell className="font-semibold">${payment.amount}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
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
    </div>
  )
}