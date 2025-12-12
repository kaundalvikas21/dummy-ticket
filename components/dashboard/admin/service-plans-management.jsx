"use client"

import { useState } from "react"
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Plane,
  FileText,
  Ticket,
  Globe,
  ArrowRightLeft,
  Calendar,
  Shield,
  Star,
  User,
  Home,
  Settings,
  CheckCircle,
  Clock,
  Upload,
} from "lucide-react"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"

// Icon mapping for dynamic rendering
const ICON_MAP = {
  plane: Plane,
  file: FileText,
  ticket: Ticket,
  global: Globe,
  exchange: ArrowRightLeft,
  calendar: Calendar,
  shield: Shield,
  star: Star,
  user: User,
  home: Home,
  settings: Settings,
  check: CheckCircle,
  clock: Clock,
}

const ICON_OPTIONS = [
  { value: "plane", label: "Plane" },
  { value: "file", label: "File" },
  { value: "ticket", label: "Ticket" },
  { value: "global", label: "Global" },
  { value: "exchange", label: "Exchange" },
  { value: "calendar", label: "Calendar" },
  { value: "shield", label: "Shield" },
  { value: "star", label: "Star" },
  { value: "user", label: "User" },
  { value: "home", label: "Home" },
  { value: "settings", label: "Settings" },
  { value: "check", label: "Check" },
  { value: "clock", label: "Clock" },
]

export function ServicePlansManagement() {
  const [servicePlans, setServicePlans] = useState([
    {
      id: 1,
      name: "DUMMY TICKET FOR VISA",
      price: 19,
      description: "Perfect for visa applications requiring proof of onward travel.",
      image: "https://placehold.co/100?text=Ticket",
      icon: "ticket",
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
      description: "Complete package including flight and hotel checks.",
      image: "https://placehold.co/100?text=Hotel",
      icon: "calendar",
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
      description: "Simple return ticket for immigration purposes.",
      image: "https://placehold.co/100?text=Return",
      icon: "exchange",
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
    description: "",
    image: "",
    icon: "",
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
      description: "",
      image: "",
      icon: "",
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
      description: plan.description || "",
      image: plan.image || "",
      icon: plan.icon || "",
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setFormData({ ...formData, image: imageUrl })
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
              description: formData.description,
              image: formData.image,
              icon: formData.icon,
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
        description: formData.description,
        image: formData.image,
        icon: formData.icon,
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
      formData.description !== initialFormData.description ||
      formData.image !== initialFormData.image ||
      formData.icon !== initialFormData.icon ||
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

  const renderIcon = (iconKey) => {
    const IconComponent = ICON_MAP[iconKey] || Plane
    return <IconComponent className="w-5 h-5 text-gray-500" />
  }

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
                <TableHead className="w-[60px]">S.No</TableHead>
                <TableHead>Plan Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Features</TableHead>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead className="w-[60px]">Icon</TableHead>
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
                    colSpan={12}
                    className="text-center py-8 text-gray-500"
                  >
                    No plans found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPlans.map((plan, index) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium text-gray-500">
                      {String(index + 1).padStart(2, "0")}
                    </TableCell>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell className="max-w-[200px]">
                      <p
                        className="truncate text-sm text-gray-500"
                        title={plan.description}
                      >
                        {plan.description}
                      </p>
                    </TableCell>
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
                    <TableCell>
                      {plan.image && (
                        <div className="w-10 h-10 rounded-md overflow-hidden border">
                          <img
                            src={plan.image}
                            alt={plan.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        {renderIcon(plan.icon)}
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

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of the plan..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="image">Featured Image</Label>
                <div className="flex items-center gap-4">
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-12 h-12 rounded-md object-cover border"
                    />
                  )}
                  <div className="flex-1">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">Plan Icon</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) =>
                    setFormData({ ...formData, icon: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          {renderIcon(option.value)}
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
