"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { apiGet, apiPost, getApiUrl } from "@/lib/api"
import { AuthGuard } from "@/components/auth-guard"


const EXPECTED_SERVICE_TYPES = [
  // 🧰 Home Maintenance & Repair
  "Electrician Services",
  "Plumber Services",
  "Carpenter Services",
  "Painter Services",
  "Masonry & Construction Work",
  "Handyman",
  "AC & Refrigerator Repair",
  "RO & Water Purifier Repair",

  // 🧹 Cleaning & Pest Control
  "Home Deep Cleaning",
  "Kitchen Cleaning",
  "Bathroom Cleaning",
  "Sofa & Carpet Cleaning",
  "Water Tank Cleaning",
  "Car Cleaning",
  "Pest Control",

  // 🪑 Home Interior & Renovation
  "Interior Design Consultation",
  "Modular Kitchen Design",
  "False Ceiling & Lighting",
  "Flooring & Tiling",
  "Furniture Design & Customization",
  "Bathroom Renovation",
  "Painting & Wallpapering",

  // 🧺 Appliance Services
  "AC Installation/Repair",
  "Washing Machine Repair",
  "Refrigerator Repair",
  "Microwave/Oven Repair",
  "TV Repair",
  "Geyser/Water Heater Repair",
  "Computer/Laptop Repair",

  // 💇‍♀️ Beauty & Personal Care
  "Salon at Home",
  "Spa & Massage at Home",
  "Makeup Artists",
  "Mehndi Artists",
  "Grooming Services for Men",
  "Bridal Packages",

  // 🧑‍🍳 Home Chef & Catering
  "Personal Chef",
  "Small Event Catering",
  "Tiffin Services",
  "Home Baker",
  "Party Snacks & Beverages",

  // 🧺 Laundry & Fabric Care
  "Laundry Pickup & Delivery",
  "Dry Cleaning",
  "Shoe Cleaning",
  "Curtain & Carpet Cleaning",
  "Ironing & Folding Services",

  // 🧒 Child & Elderly Care
  "Babysitter/Nanny",
  "Elderly Caregiver",
  "Nurse at Home",
  "Physiotherapist at Home",

  // 🏡 Home Security & Smart Devices
  "CCTV Installation",
  "Smart Doorbell Setup",
  "Biometric Lock Installation",
  "Security Alarm Systems",
  "Home Automation",

  // 🚗 Vehicle Care
  "Car Washing & Detailing",
  "Bike Servicing",
  "Car Denting & Painting",
  "Car AC & Battery Check",
  "Doorstep Mechanic",

  // 🌿 Gardening & Outdoor
  "Garden Maintenance",
  "Landscaping",
  "Lawn Mowing",
  "Plant Care & Pest Control",
  "Vertical Garden Setup",

  // 📦 Moving & Storage
  "Packers & Movers",
  "Local Shifting",
  "Storage & Warehousing",
  "Furniture Assembly/Disassembly",
  "Vehicle Transport",

  // 💻 IT & Smart Support
  "Computer Repair",
  "WiFi & Router Setup",
  "CCTV & IoT Device Configuration",
  "Printer Setup & Repair",

  // 🧾 Home Utility Services
  "Gas Pipeline Connection",
  "Solar Panel Installation",
  "Water Tank Installation",
  "Borewell & Motor Pump Service",

  // 🧑‍🏫 Tutoring & Home Classes
  "School Tuition (K-12)",
  "Competitive Exam Coaching",
  "Music & Dance Classes",
  "Fitness & Yoga Training",
  "Art & Craft Classes",
];


interface ServiceType {
  id: number
  name: string
  description: string
  categoryId: number
  createdAt: string
  updatedAt: string
}

interface Category {
  id: number
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export default function TypesPage() {
  const { hasPermission, token, loading: authLoading, user, isAuthenticated } = useAuth()
  const [types, setTypes] = useState<ServiceType[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingType, setEditingType] = useState<ServiceType | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: ""
  })

  const fetchCategories = async () => {
    try {
      if (!token) {
        console.log('No token available for fetching categories')
        return
      }
      const res = await apiGet<Category[]>('/services/meta/categories', token)
      if (res.success) {
        setCategories(res.data || [])
      } else {
        console.error('Failed to fetch categories:', res.error)
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  const fetchTypes = async () => {
    try {
      setLoading(true)
      if (!token) {
        setError("No authentication token")
        return
      }

      const res = await apiGet<ServiceType[]>('/services/meta/types', token)
      if (res.success) {
        setTypes(res.data || [])
      } else {
        setError(res.error || "Failed to fetch service types")
      }
    } catch (err) {
      setError("Failed to fetch service types")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && token) {
      fetchCategories()
      fetchTypes()
    }
  }, [token, authLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log('Form submission - token available:', !!token)
      console.log('Form submission - authLoading:', authLoading)
      console.log('Form submission - isAuthenticated:', isAuthenticated)
      console.log('Form submission - user:', user)
      
      if (!token) {
        setError("No authentication token - please log in first")
        return
      }

      if (!formData.categoryId) {
        setError("Please select a category")
        return
      }

      if (editingType) {
        const response = await fetch(getApiUrl(`/services/meta/types/${editingType.id}`), {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            categoryId: Number(formData.categoryId)
          }),
        })
        const data = await response.json()
        if (!response.ok || !data?.success) throw new Error(data?.error || 'Failed to update')
      } else {
        const res = await apiPost<ServiceType>('/services/meta/types', {
          name: formData.name,
          description: formData.description,
          categoryId: Number(formData.categoryId)
        }, token)
        if (!res.success) throw new Error(res.error || 'Failed to create')
      }
      
      setIsDialogOpen(false)
      setFormData({ name: "", description: "", categoryId: "" })
      setEditingType(null)
      fetchTypes()
    } catch (err) {
      setError("Failed to save service type")
    }
  }

  const handleEdit = (type: ServiceType) => {
    setEditingType(type)
    setFormData({
      name: type.name,
      description: type.description,
      categoryId: type.categoryId.toString()
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this service type?")) {
      try {
        // TODO: Implement delete API call
        console.log("Deleting type:", id)
        fetchTypes()
      } catch (err) {
        setError("Failed to delete service type")
      }
    }
  }

  // Show loading while authentication is being checked
  if (authLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Check permissions after all hooks
  if (!hasPermission('canManageTypes')) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            You don't have permission to manage service types.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Service Types Management</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingType(null)
                setFormData({ name: "", description: "", categoryId: "" })
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingType ? "Edit Service Type" : "Add New Service Type"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="category">Service Category</Label>
                  <Select value={formData.categoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
  <Label htmlFor="name">Type Name</Label>

  <Select
    value={
      EXPECTED_SERVICE_TYPES.includes(formData.name)
        ? formData.name
        : "Custom / Other"
    }
    onValueChange={(value) => {
      if (value === "Custom / Other") {
        setFormData((prev) => ({ ...prev, name: "" }));
      } else {
        setFormData((prev) => ({ ...prev, name: value }));
      }
    }}
  >
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Select service type" />
    </SelectTrigger>
    <SelectContent>
      {EXPECTED_SERVICE_TYPES.map((type) => (
        <SelectItem key={type} value={type}>
          {type}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>

  {/* Show input box when "Custom / Other" is selected */}
  {(!EXPECTED_SERVICE_TYPES.includes(formData.name) || formData.name === "") && (
    <div className="mt-3 space-y-2">
      <Label htmlFor="customType">Enter Custom Type</Label>
      <Input
        id="customType"
        value={formData.name}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, name: e.target.value }))
        }
        placeholder="e.g., Seasonal Plan, Trial Service"
        required
      />
    </div>
  )}
</div>

                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                    placeholder="Describe this service type"
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingType ? "Update" : "Create"} Type
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Service Types ({types.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading service types...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {types.map((type) => {
                    const category = categories.find(c => c.id === type.categoryId)
                    return (
                    <TableRow key={type.id}>
                      <TableCell className="font-medium">{type.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{category?.name || 'Unknown'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{type.name}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{type.description}</TableCell>
                      <TableCell>{new Date(type.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(type)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(type.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  )
}

