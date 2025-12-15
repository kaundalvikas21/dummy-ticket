"use client"

import { useState, useEffect, useRef } from "react"
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
  Loader2,
  Hotel,
  RefreshCw,
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
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"
import { compressImage } from "@/lib/utils"

// Icon mapping for dynamic rendering
const ICON_MAP = {
  plane: Plane,
  hotel: Hotel,
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
  { value: "hotel", label: "Hotel" },
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
  const [servicePlans, setServicePlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
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
    displayOrder: "0",
  })
  const [initialFormData, setInitialFormData] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [tempImage, setTempImage] = useState(null)
  const fileInputRef = useRef(null)
  const isSavingRef = useRef(false)

  const supabase = createClient()

  useEffect(() => {
    fetchServicePlans()
  }, [])

  const fetchServicePlans = async (showLoader = true) => {
    if (showLoader) setLoading(true)
    const { data, error } = await supabase
      .from("service_plans")
      .select("*")
      .order("display_order", { ascending: true })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch service plans.",
        variant: "destructive",
      })
      console.error("Error fetching plans:", error)
    } else {
      setServicePlans(data || [])
    }
    setLoading(false)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Clean, readable parallel execution for minimum spin time
    await Promise.all([
      fetchServicePlans(false),
      new Promise(resolve => setTimeout(resolve, 800))
    ])
    setIsRefreshing(false)
  }

  const resetForm = () => {
    isSavingRef.current = false
    setTempImage(null) // Commit image
    setFormData({
      name: "",
      price: "",
      description: "",
      image: "",
      icon: "plane",
      features: "",
      active: true,
      featured: false,
      popularLabel: "",
      displayOrder: "0",
    })
    setEditingPlan(null)
    setInitialFormData(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleAddNew = () => {
    // Calculate next order
    const maxOrder = servicePlans.length > 0
      ? Math.max(...servicePlans.map(p => p.display_order || 0))
      : 0

    const nextOrder = maxOrder + 1

    const emptyForm = {
      name: "",
      price: "",
      description: "",
      image: "",
      icon: "plane",
      features: "",
      active: true,
      featured: false,
      popularLabel: "",
      displayOrder: nextOrder.toString(),
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
      icon: plan.icon || "plane",
      features: (plan.features || []).join("\n"),
      active: plan.active,
      featured: plan.featured,
      popularLabel: plan.popular_label || "",
      displayOrder: plan.display_order || "0",
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

  const confirmDelete = async () => {
    if (planToDelete !== null) {
      // Find the plan to get the image path
      const plan = servicePlans.find(p => p.id === planToDelete)

      // Delete image from storage if it exists
      if (plan && plan.image) {
        try {
          // Extract path from URL (assuming standard Supabase URL structure)
          // URL: .../assets/service_plans/feature_images/filename
          const pathIndex = plan.image.indexOf("service_plans")
          if (pathIndex !== -1) {
            const imagePath = plan.image.substring(pathIndex)
            await supabase.storage.from("assets").remove([imagePath])
          }
        } catch (err) {
          console.error("Error deleting image:", err)
          // Continue with db deletion even if image delete fails
        }
      }

      const { error } = await supabase
        .from("service_plans")
        .delete()
        .eq("id", planToDelete)

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete service plan.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Service plan deleted successfully.",
        })
        fetchServicePlans()
      }
      setIsDeleteAlertOpen(false)
      setPlanToDelete(null)
    }
  }

  const handleImageUpload = async (e) => {
    let file = e.target.files[0]
    if (!file) return

    setIsUploading(true)

    // Check size and compress if needed
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Optimizing Image",
        description: "Compressing image while maintaining quality...",
      })

      try {
        file = await compressImage(file, 2)
      } catch (error) {
        console.error("Compression failed:", error)
        toast({
          title: "Error",
          description: "Failed to compress image.",
          variant: "destructive",
        })
        setIsUploading(false)
        return
      }
    }

    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").toLowerCase()
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName
    const ext = originalName.substring(originalName.lastIndexOf('.'))

    let fileName = originalName
    let counter = 0
    let uploadSuccess = false
    let finalPath = ""
    let publicUrl = ""

    // Retry loop for duplicate names (up to 20 attempts)
    while (!uploadSuccess && counter < 20) {
      if (counter > 0) {
        fileName = `${nameWithoutExt}_${counter}${ext}`
      }

      const filePath = `service_plans/feature_images/${fileName}`

      const { data, error } = await supabase.storage
        .from("assets")
        .upload(filePath, file, {
          upsert: false // Do not overwrite
        })

      if (error) {
        // Check if it's a duplicate error
        // Supabase error for duplicates usually mentions "Duplicate" or "already exists"
        if (error.message && (error.message.includes("Duplicate") || error.message.includes("already exists"))) {
          counter++
          continue
        } else {
          // Genuine error
          console.error("Upload error:", error)
          toast({
            title: "Error",
            description: "Failed to upload image.",
            variant: "destructive",
          })
          setIsUploading(false)
          return
        }
      }

      // Success
      uploadSuccess = true
      finalPath = filePath

      const { data: publicUrlData } = supabase.storage
        .from("assets")
        .getPublicUrl(filePath)

      publicUrl = publicUrlData.publicUrl
    }

    if (!uploadSuccess) {
      toast({
        title: "Error",
        description: "Could not upload image: too many duplicate filenames.",
        variant: "destructive",
      })
      setIsUploading(false)
      return
    }

    // If there was a previous temp image in this session, delete it to avoid accumulation
    if (tempImage) {
      await supabase.storage.from("assets").remove([tempImage])
    }

    setFormData({ ...formData, image: publicUrl })
    setTempImage(finalPath) // Track for cleanup
    setIsUploading(false)

    toast({
      title: "Success",
      description: "Image uploaded successfully",
    })
  }

  const handleCloseDialog = async () => {
    // Cleanup orphan image if not saved and not currently saving
    // unconditional delete if tempImage exists AND we are not in the middle of saving
    if (tempImage && !isSavingRef.current) {
      await supabase.storage.from("assets").remove([tempImage])
    }
    setTempImage(null)
    setIsDialogOpen(false)
    resetForm()
  }

  const handleSave = async () => {
    isSavingRef.current = true
    if (!formData.name || !formData.price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const featuresArray = formData.features.split("\n").filter((f) => f.trim())
    const planData = {
      name: formData.name,
      price: Number.parseFloat(formData.price),
      description: formData.description,
      image: formData.image,
      icon: formData.icon,
      features: featuresArray,
      active: formData.active,
      featured: formData.featured,
      popular_label: formData.popularLabel,
      display_order: Number(formData.displayOrder) || 0,
    }

    let error

    if (editingPlan) {
      const { error: updateError } = await supabase
        .from("service_plans")
        .update(planData)
        .eq("id", editingPlan.id)

      // Delete old image if replaced
      if (!updateError && editingPlan.image && editingPlan.image !== formData.image) {
        // Extract path from URL (assuming standard Supabase URL structure)
        // URL: .../assets/service_plans/feature_images/filename
        const oldPath = editingPlan.image.substring(editingPlan.image.indexOf("service_plans"))
        if (oldPath) {
          await supabase.storage.from("assets").remove([oldPath])
        }
      }

      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from("service_plans")
        .insert([planData])
      error = insertError
    }

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save service plan.",
        variant: "destructive",
      })
      console.error("Save error:", error)
    } else {
      toast({
        title: "Success",
        description: `Service plan ${editingPlan ? "updated" : "created"
          } successfully.`,
      })
      setTempImage(null) // Clear temp image on successful save (committed)
      setIsDialogOpen(false)
      fetchServicePlans()
    }
    isSavingRef.current = false
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
      formData.popularLabel !== initialFormData.popularLabel ||
      formData.displayOrder !== initialFormData.displayOrder
    )
  }

  const isSaveDisabled =
    !isFormChanged() || !formData.name || !formData.price || isUploading

  const toggleFeatured = async (plan) => {
    // Optimistic update
    setServicePlans(
      servicePlans.map((p) =>
        p.id === plan.id ? { ...p, featured: !p.featured } : p,
      ),
    )

    const { error } = await supabase
      .from("service_plans")
      .update({ featured: !plan.featured })
      .eq("id", plan.id)

    if (error) {
      // Revert on error
      fetchServicePlans()
      toast({
        title: "Error",
        description: "Failed to update featured status.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: `Plan ${!plan.featured ? "marked as featured" : "removed from featured"}.`,
      })
    }
  }

  const filteredPlans = servicePlans.filter((plan) =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const renderIcon = (iconKey) => {
    const IconComponent = ICON_MAP[iconKey] || Plane
    return <IconComponent className="w-5 h-5 text-gray-500" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#0066FF] to-[#00D4AA] bg-clip-text text-transparent">
          Service Plans Management
        </h1>
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

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            if (!open) handleCloseDialog()
            else setIsDialogOpen(true)
          }}>
            <Button
              className="bg-gradient-to-r from-[#0066FF] to-[#00D4AA] text-white cursor-pointer"
              onClick={handleAddNew}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Plan
            </Button>
            <DialogContent className="max-w-[90vw] md:max-w-2xl max-h-[90vh] overflow-y-auto mx-auto rounded-lg">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="image">Featured Image</Label>
                    <div className="flex flex-col gap-4">
                      {formData.image && (
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-12 h-12 rounded-md object-cover border"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Input
                              id="image"
                              type="file"
                              accept="image/*.jpg,.jpeg,.png,.webp"
                              onChange={handleImageUpload}
                              className="hidden"
                              disabled={isUploading}
                              ref={fileInputRef}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploading}
                            >
                              {isUploading ? "Uploading..." : "Choose File"}
                            </Button>
                            <span className="text-xs text-muted-foreground">
                              Formats: PNG, JPG (Max 2MB)
                            </span>
                          </div>
                          {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                        </div>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayOrder">Display Order</Label>
                    <Input
                      id="displayOrder"
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) =>
                        setFormData({ ...formData, displayOrder: e.target.value })
                      }
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                </div>

                <div className="space-y-2">
                  <Label htmlFor="features">Features (one per line)</Label>
                  <Textarea
                    id="features"
                    value={formData.features}
                    onChange={(e) =>
                      setFormData({ ...formData, features: e.target.value })
                    }
                    placeholder="Flight reservation/ itinerary\nVerifiable on airline website\nUp to 4 changes allowed"
                    rows={6}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="active" className="cursor-pointer">Active Status</Label>
                      <span className="text-xs text-muted-foreground">Visible to users (main services)</span>
                    </div>
                    <Switch
                      id="active"
                      checked={formData.active}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, active: checked })
                      }
                      className="data-[state=checked]:bg-green-500 scale-110 active:scale-95 md:scale-100 md:active:scale-100 transition-all data-[state=unchecked]:bg-slate-200"
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="featured" className="cursor-pointer">Featured Plan</Label>
                      <span className="text-xs text-muted-foreground">Highlighted on home</span>
                    </div>
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, featured: checked })
                      }
                      className="data-[state=checked]:bg-blue-600 scale-110 active:scale-95 md:scale-100 md:active:scale-100 transition-all data-[state=unchecked]:bg-slate-200"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  className="cursor-pointer"
                  variant="outline"
                  onClick={() => handleCloseDialog()}
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
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : editingPlan ? (
                    "Update Plan"
                  ) : (
                    "Add Plan"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
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
          <div className="w-full overflow-x-auto pb-4 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-track]:bg-transparent">
            <Table className="min-w-[800px]">
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
                  <TableHead>Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={13}
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
                            {(plan.features || [])[0]}
                          </span>
                          {(plan.features || []).length > 1 && (
                            <span className="text-xs text-muted-foreground">
                              +{(plan.features || []).length - 1} more features
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {plan.image && (
                          <div className="w-10 h-10 rounded-md overflow-hidden border">
                            <img
                              src={plan.image || "/placeholder.svg"}
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
                      <TableCell>{plan.total_sales || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Switch
                            checked={plan.featured}
                            onCheckedChange={() => toggleFeatured(plan)}
                            className="data-[state=checked]:bg-green-500"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        {plan.popular_label && (
                          <Badge
                            variant="secondary"
                            className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100"
                          >
                            {plan.popular_label}
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
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {plan.display_order || 0}
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
                            <Edit className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(plan.id)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
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
    </div>
  )
}

