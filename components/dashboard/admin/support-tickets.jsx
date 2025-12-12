"use client"

import { useState } from "react"
import { MessageSquare, Clock, CheckCircle, Send } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SupportTickets() {
  const [tickets, setTickets] = useState([
    {
      id: "TKT-001",
      customer: "John Doe",
      subject: "Issue with PNR verification",
      message: "I'm unable to verify my PNR code on the airline website...",
      status: "open",
      priority: "high",
      date: "2025-01-15 10:30 AM",
      email: "john@example.com",
      responses: [],
    },
    {
      id: "TKT-002",
      customer: "Jane Smith",
      subject: "Need to change travel dates",
      message: "Can I change my departure date from Jan 20 to Jan 25?",
      status: "in-progress",
      priority: "medium",
      date: "2025-01-15 09:15 AM",
      email: "jane@example.com",
      responses: [
        {
          from: "Admin",
          message: "Yes, we can help you with that. Please provide your booking reference.",
          date: "2025-01-15 09:30 AM",
        },
      ],
    },
    {
      id: "TKT-003",
      customer: "Mike Johnson",
      subject: "Refund request",
      message: "My visa was rejected, I need a refund for my booking...",
      status: "resolved",
      priority: "high",
      date: "2025-01-14 03:45 PM",
      email: "mike@example.com",
      responses: [
        {
          from: "Admin",
          message: "We've processed your refund. It will appear in your account within 5-7 business days.",
          date: "2025-01-14 04:00 PM",
        },
      ],
    },
    {
      id: "TKT-004",
      customer: "Sarah Williams",
      subject: "Question about hotel booking",
      message: "Does the hotel booking include breakfast?",
      status: "open",
      priority: "low",
      date: "2025-01-14 11:20 AM",
      email: "sarah@example.com",
      responses: [],
    },
  ])

  const [selectedTicket, setSelectedTicket] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [responseMessage, setResponseMessage] = useState("")

  const handleViewDetails = (ticket) => {
    setSelectedTicket(ticket)
    setResponseMessage("")
    setIsDialogOpen(true)
  }

  const handleSendResponse = () => {
    if (!responseMessage.trim()) {
      alert("Please enter a response message")
      return
    }

    const newResponse = {
      from: "Admin",
      message: responseMessage,
      date: new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    }

    setTickets(
      tickets.map((ticket) =>
        ticket.id === selectedTicket.id
          ? {
              ...ticket,
              responses: [...ticket.responses, newResponse],
              status: ticket.status === "open" ? "in-progress" : ticket.status,
            }
          : ticket,
      ),
    )

    setResponseMessage("")
    alert("Response sent successfully!")
  }

  const handleUpdateStatus = (newStatus) => {
    setTickets(tickets.map((ticket) => (ticket.id === selectedTicket.id ? { ...ticket, status: newStatus } : ticket)))
    setSelectedTicket({ ...selectedTicket, status: newStatus })
  }

  const openTickets = tickets.filter((t) => t.status === "open").length
  const inProgressTickets = tickets.filter((t) => t.status === "in-progress").length
  const resolvedTickets = tickets.filter((t) => t.status === "resolved").length

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Support Tickets</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Manage customer support requests and inquiries</p>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Open</p>
                <p className="text-2xl font-bold text-gray-900">{openTickets}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{inProgressTickets}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">{resolvedTickets}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-[#0066FF] transition-colors"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs sm:text-sm font-semibold text-gray-900">{ticket.id}</span>
                      <Badge
                        variant="outline"
                        className={
                          ticket.status === "open"
                            ? "bg-yellow-100 text-yellow-700"
                            : ticket.status === "in-progress"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                        }
                      >
                        {ticket.status}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          ticket.priority === "high"
                            ? "bg-red-100 text-red-700"
                            : ticket.priority === "medium"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-gray-100 text-gray-700"
                        }
                      >
                        {ticket.priority}
                      </Badge>
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-1">{ticket.subject}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{ticket.message}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span>Customer: {ticket.customer}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{ticket.date}</span>
                      {ticket.responses.length > 0 && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span>{ticket.responses.length} response(s)</span>
                        </>
                      )}
                    </div>
                    <Button
                      className="cursor-pointer w-full sm:w-auto min-h-[40px]"
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(ticket)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="px-4 sm:px-6 pt-6">
            <DialogTitle className="text-lg sm:text-xl">Ticket Details - {selectedTicket?.id}</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-6">
              {/* Ticket Info */}
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-gray-600">Customer</Label>
                  <p className="font-semibold">{selectedTicket.customer}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Email</Label>
                  <p className="font-semibold">{selectedTicket.email}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Priority</Label>
                  <Badge
                    className={
                      selectedTicket.priority === "high"
                        ? "bg-red-100 text-red-700"
                        : selectedTicket.priority === "medium"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-700"
                    }
                  >
                    {selectedTicket.priority}
                  </Badge>
                </div>
                <div>
                  <Label className="text-gray-600">Status</Label>
                  <Select value={selectedTicket.status} onValueChange={handleUpdateStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Original Message */}
              <div>
                <Label className="text-gray-600 mb-2 block">Subject</Label>
                <h3 className="text-base sm:text-lg font-semibold mb-2">{selectedTicket.subject}</h3>
                <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">{selectedTicket.message}</p>
                  <p className="text-xs text-gray-500 mt-2">{selectedTicket.date}</p>
                </div>
              </div>

              {/* Responses */}
              {selectedTicket.responses.length > 0 && (
                <div>
                  <Label className="text-gray-600 mb-2 block">Responses</Label>
                  <div className="space-y-3">
                    {selectedTicket.responses.map((response, index) => (
                      <div key={index} className="p-3 sm:p-4 bg-green-50 rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                          <span className="text-sm font-semibold text-gray-900">{response.from}</span>
                          <span className="text-xs text-gray-500">{response.date}</span>
                        </div>
                        <p className="text-sm text-gray-700">{response.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Response Form */}
              <div>
                <Label htmlFor="response" className="mb-2 block">
                  Send Response
                </Label>
                <Textarea
                  id="response"
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder="Type your response here..."
                  rows={4}
                  className="mb-3"
                />
                <Button
                  className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white cursor-pointer w-full sm:w-auto min-h-[44px]"
                  onClick={handleSendResponse}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Response
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
