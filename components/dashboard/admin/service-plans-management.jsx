"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"

export function ServicePlansManagement() {
  const [servicePlans, setServicePlans] = useState([
    {
      id: 1,
      name: "DUMMY TICKET FOR VISA",
      price: 19,
      features: [
        "Flight reservation/ itinerary",
        "Verifiable on airline website",
        "Up to 4 changes allowed",
        "Use for visa application/ proof of return",
      ],
      active: true,
      featured: true,
      popularLabel: "Best Value",
      totalSales: 1234,
    },
    {
      id: 2,
      name: "DUMMY TICKET & HOTEL",
      price: 35,
      features: [
        "Actual reservation from airline/hotel",
        "Verifiable on airline/hotel website",
        "Accommodation up to one month",
        "Up to 4 changes allowed",
        "Use for visa application/ proof of return",
      ],
      active: true,
      featured: false,
      popularLabel: "Most Popular",
      totalSales: 856,
    },
    {
      id: 3,
      name: "DUMMY RETURN TICKET",
      price: 15,
      features: [
        "Return ticket for showing in immigration",
        "Verifiable flight reservation with PNR",
        "Can be used to show as proof of return or onward travel in most countries",
      ],
      active: true,
      featured: false,
      popularLabel: "",
      totalSales: 567,
    },
  ])

  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState(null)
  const [editingPlan, setEditingPlan] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    features: "",
    active: true,
    featured: false,
    popularLabel: "",
  })
  const [initialFormData, setInitialFormData] = useState(null)

  const handleAddNew = () => {
    const emptyForm = {
      name: "",
      price: "",
      features: "",
      active: true,
      featured: false,
      popularLabel: "",
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
      features: plan.features.join("\n"),
      active: plan.active,
      featured: plan.featured,
      popularLabel: plan.popularLabel || "",
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
              features: featuresArray,
              active: formData.active,
              featured: formData.featured,
              popularLabel: formData.popularLabel,
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
        features: featuresArray,
        active: formData.active,
        featured: formData.featured,
        popularLabel: formData.popularLabel,
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
      formData.features !== initialFormData.features ||
      formData.active !== initialFormData.active ||
      formData.featured !== initialFormData.featured ||
      formData.popularLabel !== initialFormData.popularLabel
    )
  }

  const isSaveDisabled = !isFormChanged() || !formData.name || !formData.price

  const toggleFeatured = (id) => {
    setServicePlans(
      servicePlans.map((plan) =>
        plan.id === id ? { ...plan, featured: !plan.featured } : plan,
      ),
    )
  }

  const filteredPlans = servicePlans.filter((plan) =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Service Plans Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage pricing and features for your services
          </p>
        </div>
        <Button
          className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white cursor-pointer"
          onClick={handleAddNew}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Plan
        </Button>
      </div>

      {/* Search and Table */}
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search plans..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Features</TableHead>
                <TableHead>Total Sales</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlans.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-gray-500"
                  >
                    No plans found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>${plan.price}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 max-w-[300px]">
                        <span className="text-sm truncate">
                          {plan.features[0]}
                        </span>
                        {plan.features.length > 1 && (
                          <span className="text-xs text-muted-foreground">
                            +{plan.features.length - 1} more features
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{plan.totalSales}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Switch
                          checked={plan.featured}
                          onCheckedChange={() => toggleFeatured(plan.id)}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      {plan.popularLabel && (
                        <Badge
                          variant="secondary"
                          className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100"
                        >
                          {plan.popularLabel}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={plan.active ? "default" : "outline"}
                        className={
                          plan.active ? "bg-green-100 text-green-700" : ""
                        }
                      >
                        {plan.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(plan)}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(plan.id)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              service plan and remove it from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPlanToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? "Edit Service Plan" : "Add New Service Plan"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., DUMMY TICKET FOR VISA"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="19"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="popularLabel">Popular Label (Badge)</Label>
                <Input
                  id="popularLabel"
                  value={formData.popularLabel}
                  onChange={(e) =>
                    setFormData({ ...formData, popularLabel: e.target.value })
                  }
                  placeholder="e.g., Best Value"
                />
              </div>
              <div className="space-y-2 flex flex-col justify-end pb-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, featured: checked })
                    }
                  />
                  <Label htmlFor="featured">Featured Plan</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Features (one per line)</Label>
              <Textarea
                id="features"
                value={formData.features}
                onChange={(e) =>
                  setFormData({ ...formData, features: e.target.value })
                }
                placeholder="Flight reservation/ itinerary&#10;Verifiable on airline website&#10;Up to 4 changes allowed"
                rows={6}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, active: checked })
                }
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
              className={`cursor-pointer ${isSaveDisabled
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
