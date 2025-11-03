"use client"

import { useState } from "react"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

export function ServicePlansManagement() {
  const [servicePlans, setServicePlans] = useState([
    {
      id: 1,
      name: "DUMMY TICKET FOR VISA",
      price: 19,
      currencies: "19 USD | 1200 INR | 70 AED | 16 EUR | 14.50 GBP",
      features: [
        "Flight reservation/ itinerary",
        "Verifiable on airline website",
        "Up to 4 changes allowed",
        "Use for visa application/ proof of return",
      ],
      active: true,
      totalSales: 1234,
    },
    {
      id: 2,
      name: "DUMMY TICKET & HOTEL",
      price: 35,
      currencies: "35 USD | 2750 INR | 128 AED | 30 EUR | 26.70 GBP",
      features: [
        "Actual reservation from airline/hotel",
        "Verifiable on airline/hotel website",
        "Accommodation up to one month",
        "Up to 4 changes allowed",
        "Use for visa application/ proof of return",
      ],
      active: true,
      totalSales: 856,
    },
    {
      id: 3,
      name: "DUMMY RETURN TICKET",
      price: 15,
      currencies: "15 USD | 990 INR | 55 AED | 14 EUR | 12.50 GBP",
      features: [
        "Return ticket for showing in immigration",
        "Verifiable flight reservation with PNR",
        "Can be used to show as proof of return or onward travel in most countries",
      ],
      active: true,
      totalSales: 567,
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState(null)
  const [editingPlan, setEditingPlan] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    currencies: "",
    features: "",
    active: true,
  })
  const [initialFormData, setInitialFormData] = useState(null)

  const handleAddNew = () => {
    const emptyForm = {
      name: "",
      price: "",
      currencies: "",
      features: "",
      active: true,
    }
    setEditingPlan(null)
    setFormData(emptyForm)
    setInitialFormData(emptyForm)
    setIsDialogOpen(true)
  }

  const handleEdit = (plan) => {
    const editForm = {
      name: plan.name,
      price: plan.price.toString(),
      currencies: plan.currencies,
      features: plan.features.join("\n"),
      active: plan.active,
    }
    setEditingPlan(plan)
    setFormData(editForm)
    setInitialFormData(editForm)
    setIsDialogOpen(true)
  }

  const handleDelete = (id) => {
    setPlanToDelete(id)
    setIsDeleteAlertOpen(true)
  }

  const confirmDelete = () => {
    if (planToDelete !== null) {
      setServicePlans(servicePlans.filter((plan) => plan.id !== planToDelete))
      setIsDeleteAlertOpen(false)
      setPlanToDelete(null)
    }
  }

  const handleSave = () => {
    if (!formData.name || !formData.price) {
      alert("Please fill in all required fields")
      return
    }

    const featuresArray = formData.features.split("\n").filter((f) => f.trim())

    if (editingPlan) {
      // Update existing plan
      setServicePlans(
        servicePlans.map((plan) =>
          plan.id === editingPlan.id
            ? {
                ...plan,
                name: formData.name,
                price: Number.parseFloat(formData.price),
                currencies: formData.currencies,
                features: featuresArray,
                active: formData.active,
              }
            : plan,
        ),
      )
    } else {
      // Add new plan
      const newPlan = {
        id: Math.max(...servicePlans.map((p) => p.id)) + 1,
        name: formData.name,
        price: Number.parseFloat(formData.price),
        currencies: formData.currencies,
        features: featuresArray,
        active: formData.active,
        totalSales: 0,
      }
      setServicePlans([...servicePlans, newPlan])
    }

    setIsDialogOpen(false)
  }

  // 🔍 Detect if form changed compared to initialFormData
  const isFormChanged = () => {
    if (!initialFormData) return false
    return (
      formData.name !== initialFormData.name ||
      formData.price !== initialFormData.price ||
      formData.currencies !== initialFormData.currencies ||
      formData.features !== initialFormData.features ||
      formData.active !== initialFormData.active
    )
  }

  const isSaveDisabled = !isFormChanged() || !formData.name || !formData.price

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Plans Management</h1>
          <p className="text-gray-600 mt-1">Manage pricing and features for your services</p>
        </div>
        <Button
          className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white cursor-pointer"
          onClick={handleAddNew}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Plan
        </Button>
      </div>

      {/* Service Plans Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servicePlans.map((plan) => (
          <Card key={plan.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-sm text-gray-500">/ person</span>
                  </div>
                </div>
                <Badge
                  variant={plan.active ? "default" : "outline"}
                  className={plan.active ? "bg-green-100 text-green-700" : ""}
                >
                  {plan.active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600">{plan.currencies}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Features:</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                      <span className="text-[#00D4AA] mt-0.5">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Sales:</span>
                  <span className="font-semibold text-gray-900">{plan.totalSales}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => handleEdit(plan)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700 bg-transparent"
                  onClick={() => handleDelete(plan.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the service plan and remove it from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPlanToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Edit Service Plan" : "Add New Service Plan"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., DUMMY TICKET FOR VISA"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="19"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currencies">Currency Conversions</Label>
              <Input
                id="currencies"
                value={formData.currencies}
                onChange={(e) => setFormData({ ...formData, currencies: e.target.value })}
                placeholder="19 USD | 1200 INR | 70 AED | 16 EUR | 14.50 GBP"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="features">Features (one per line)</Label>
              <Textarea
                id="features"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder="Flight reservation/ itinerary&#10;Verifiable on airline website&#10;Up to 4 changes allowed"
                rows={6}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <Label htmlFor="active">Active Plan</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              className="cursor-pointer"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={isSaveDisabled}
              className={`cursor-pointer ${
                isSaveDisabled
                  ? "opacity-50 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white"
              }`}
              onClick={handleSave}
            >
              {editingPlan ? "Update Plan" : "Add Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
