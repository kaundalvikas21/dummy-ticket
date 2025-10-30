"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, CreditCard, Calendar, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export function Revenue() {
  const { toast } = useToast()
  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false)
  const [payoutAmount, setPayoutAmount] = useState("")

  const stats = [
    { title: "Total Earnings", value: "$5,075.00", icon: DollarSign, color: "from-green-500 to-emerald-500" },
    { title: "This Month", value: "$1,250.00", icon: Calendar, color: "from-blue-500 to-cyan-500" },
    { title: "Pending Payouts", value: "$350.00", icon: CreditCard, color: "from-orange-500 to-red-500" },
    { title: "Growth", value: "+12.5%", icon: TrendingUp, color: "from-purple-500 to-pink-500" },
  ]

  const transactions = [
    {
      id: "TXN-001",
      date: "2025-01-20",
      description: "Booking Payment - BK-001",
      amount: "$350.00",
      status: "completed",
    },
    {
      id: "TXN-002",
      date: "2025-01-21",
      description: "Booking Payment - BK-002",
      amount: "$150.00",
      status: "pending",
    },
    {
      id: "TXN-003",
      date: "2025-01-21",
      description: "Booking Payment - BK-003",
      amount: "$280.00",
      status: "completed",
    },
    {
      id: "TXN-004",
      date: "2025-01-22",
      description: "Booking Payment - BK-004",
      amount: "$420.00",
      status: "processing",
    },
  ]

  const handleRequestPayout = () => {
    setPayoutAmount("350.00")
    setIsPayoutDialogOpen(true)
  }

  const handleSubmitPayout = () => {
    if (!payoutAmount || Number.parseFloat(payoutAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid payout amount",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Payout requested",
      description: `Your payout request of $${payoutAmount} has been submitted successfully`,
    })
    setIsPayoutDialogOpen(false)
    setPayoutAmount("")
  }

  const handleExport = () => {
    const csv = [
      ["Transaction ID", "Date", "Description", "Amount", "Status"].join(","),
      ...transactions.map((txn) => [txn.id, txn.date, txn.description, txn.amount, txn.status].join(",")),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `revenue-transactions-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Successful",
      description: "Transaction history has been exported to CSV.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revenue & Earnings</h1>
          <p className="text-gray-600 mt-1">Track your earnings and payouts</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white" onClick={handleRequestPayout}>
            Request Payout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {transaction.date} • {transaction.id}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{transaction.amount}</p>
                  <p
                    className={`text-sm mt-1 ${
                      transaction.status === "completed"
                        ? "text-green-600"
                        : transaction.status === "pending"
                          ? "text-yellow-600"
                          : "text-blue-600"
                    }`}
                  >
                    {transaction.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isPayoutDialogOpen} onOpenChange={setIsPayoutDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Payout</DialogTitle>
            <DialogDescription>Enter the amount you want to withdraw from your available balance</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Payout Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="amount"
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-7"
                  step="0.01"
                  min="0"
                />
              </div>
              <p className="text-sm text-gray-500">Available balance: $350.00</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> Payout requests are processed within 3-5 business days. Funds will be transferred
                to your registered bank account.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPayoutDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white" onClick={handleSubmitPayout}>
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
