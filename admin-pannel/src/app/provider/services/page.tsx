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
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, Calendar, Clock } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { AuthGuard } from "@/components/auth-guard"
import { Service, getMyServices, createMyService, updateMyService, deleteMyService, CreateServiceRequest } from "@/lib/api"

export default function ProviderServicesPage() {
  const { hasPermission, user, token } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState<CreateServiceRequest>({
    name: "",
    description: "",
    price: 0,
    serviceType: "",
    durationMinutes: 0,
    availability: true,
    timeSlots: ""
  })

  // Check permissions
  if (!hasPermission('canManageOwnServices')) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            You don't have permission to manage services. Only service providers can manage their own services.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const fetchMyServices = async () => {
    try {
      setLoading(true)
      if (!token) {
        setError("No authentication token")
        return
      }
      
      const response = await getMyServices(token)
      if (response.success && response.data) {
        setServices(response.data)
      } else {
        setError(response.error || "Failed to fetch services")
      }
    } catch (err) {
      setError("Failed to fetch your services")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyServices()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      setError("No authentication token")
      return
    }

    try {
      if (editingService) {
        const response = await updateMyService(token, editingService.id, formData)
        if (!response.success) {
          setError(response.error || "Failed to update service")
          return
        }
      } else {
        const response = await createMyService(token, formData)
        if (!response.success) {
          setError(response.error || "Failed to create service")
          return
        }
      }
      
      setIsDialogOpen(false)
      setFormData({
        name: "",
        description: "",
        price: 0,
        serviceType: "",
        durationMinutes: 0,
        availability: true,
        timeSlots: ""
      })
      setEditingService(null)
      fetchMyServices()
    } catch (err) {
      setError("Failed to save service")
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description || "",
      price: service.price,
      serviceType: service.serviceType || "",
      durationMinutes: service.durationMinutes || 0,
      availability: service.availability,
      timeSlots: service.timeSlots || ""
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this service?")) {
      if (!token) {
        setError("No authentication token")
        return
      }

      try {
        const response = await deleteMyService(token, id)
        if (response.success) {
          fetchMyServices()
        } else {
          setError(response.error || "Failed to delete service")
        }
      } catch (err) {
        setError("Failed to delete service")
      }
    }
  }

  return (
    <AuthGuard>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">My Services</h1>
            <p className="text-gray-600">Manage your service offerings</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingService(null)
                setFormData({
                  name: "",
                  description: "",
                  price: "",
                  serviceType: "",
                  durationMinutes: "",
                  availability: true,
                  timeSlots: ""
                })
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingService ? "Edit Service" : "Add New Service"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Service Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      placeholder="e.g., Professional House Cleaning"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                      required
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                    placeholder="Describe your service in detail"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceType">Service Type</Label>
                    <Select
                      value={formData.serviceType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, serviceType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hourly">Hourly</SelectItem>
                        <SelectItem value="Fixed">Fixed</SelectItem>
                        <SelectItem value="Package">Package</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="durationMinutes">Duration (minutes)</Label>
                    <Input
                      id="durationMinutes"
                      type="number"
                      value={formData.durationMinutes}
                      onChange={(e) => setFormData(prev => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                      placeholder="60"
                      min="1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timeSlots">Available Time Slots</Label>
                  <Input
                    id="timeSlots"
                    value={formData.timeSlots}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeSlots: e.target.value }))}
                    placeholder="e.g., 8:00 AM - 6:00 PM"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="availability"
                    checked={formData.availability}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, availability: checked }))}
                  />
                  <Label htmlFor="availability">Service Available</Label>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingService ? "Update" : "Create"} Service
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <Badge variant={service.availability ? "default" : "secondary"}>
                    {service.availability ? "Available" : "Unavailable"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Price:</span>
                    <span className="text-lg font-bold text-blue-600">${service.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Type:</span>
                    <Badge variant="outline">{service.serviceType}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Duration:</span>
                    <span className="text-sm">{service.durationMinutes} minutes</span>
                  </div>
                  {service.timeSlots && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Available:</span>
                      <span className="text-sm">{service.timeSlots}</span>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(service)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(service.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {services.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Services Yet</h3>
              <p className="text-gray-600 mb-4">Start by adding your first service to begin offering your expertise.</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Service
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthGuard>
  )
}

