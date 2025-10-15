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
import { Plus, Edit, Trash2, Eye } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { apiGet, apiPost, getApiUrl } from "@/lib/api"
import { AuthGuard } from "@/components/auth-guard"
import { Service } from "@/lib/api"

interface ServiceType {
  id: number
  name: string
  description: string
  categoryId: number
  createdAt: string
  updatedAt: string
}

export default function ServicesPage() {
  const { hasPermission, token, loading: authLoading } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    serviceTypeId: "",
    durationMinutes: "",
    availability: true,
    timeSlots: ""
  })

  const fetchServiceTypes = async () => {
    try {
      if (!token) return
      const res = await apiGet<ServiceType[]>('/services/meta/types', token)
      if (res.success) {
        setServiceTypes(res.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch service types:', err)
    }
  }

  const fetchServices = async () => {
    try {
      setLoading(true)
      if (!token) {
        setError("No authentication token")
        return
      }

      const res = await apiGet<Service[]>('/services', token)
      if (res.success) {
        setServices(res.data || [])
      } else {
        setError(res.error || "Failed to fetch services")
      }
    } catch (err) {
      setError("Failed to fetch services")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && token) {
      fetchServiceTypes()
      fetchServices()
    }
  }, [token, authLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!token) {
        setError("No authentication token")
        return
      }

      if (!formData.serviceTypeId) {
        setError("Please select a service type")
        return
      }

      const serviceData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        serviceTypeId: Number(formData.serviceTypeId),
        durationMinutes: formData.durationMinutes ? Number(formData.durationMinutes) : undefined,
        availability: formData.availability,
        timeSlots: formData.timeSlots || undefined
      }

      if (editingService) {
        const response = await fetch(getApiUrl(`/services/${editingService.id}`), {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(serviceData),
        })
        const data = await response.json()
        if (!response.ok || !data?.success) throw new Error(data?.error || 'Failed to update')
      } else {
        const res = await apiPost<Service>('/services', serviceData, token)
        if (!res.success) throw new Error(res.error || 'Failed to create')
      }
      
      setIsDialogOpen(false)
      setFormData({
        name: "",
        description: "",
        price: "",
        serviceTypeId: "",
        durationMinutes: "",
        availability: true,
        timeSlots: ""
      })
      setEditingService(null)
      fetchServices()
    } catch (err) {
      setError("Failed to save service")
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description || "",
      price: service.price.toString(),
      serviceTypeId: service.serviceTypeId?.toString() || "",
      durationMinutes: service.durationMinutes?.toString() || "",
      availability: service.availability,
      timeSlots: service.timeSlots || ""
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this service?")) {
      try {
        if (!token) {
          setError("No authentication token")
          return
        }

        const response = await fetch(getApiUrl(`/services/${id}`), {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        const data = await response.json()
        if (!response.ok || !data?.success) throw new Error(data?.error || 'Failed to delete')
        
        fetchServices()
      } catch (err) {
        setError("Failed to delete service")
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
  if (!hasPermission('canManageAllServices')) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            You don't have permission to manage all services.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Services Management</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingService(null)
                setFormData({
                  name: "",
                  description: "",
                  price: "",
                  serviceTypeId: "",
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
                      placeholder="e.g., Basic Plumbing Repair"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
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
                    placeholder="Describe the service in detail"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceType">Service Type</Label>
                    <Select
                      value={formData.serviceTypeId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, serviceTypeId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceTypes.map((serviceType) => (
                          <SelectItem key={serviceType.id} value={serviceType.id.toString()}>
                            {serviceType.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="durationMinutes">Duration (minutes)</Label>
                    <Input
                      id="durationMinutes"
                      type="number"
                      value={formData.durationMinutes}
                      onChange={(e) => setFormData(prev => ({ ...prev, durationMinutes: e.target.value }))}
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
                    placeholder="e.g., 9:00 AM - 5:00 PM"
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

        <Card>
          <CardHeader>
            <CardTitle>All Services ({services.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading services...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => {
                    const serviceType = serviceTypes.find(st => st.id === service.serviceTypeId)
                    return (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.id}</TableCell>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{service.description}</TableCell>
                      <TableCell>${service.price}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{serviceType?.name || service.serviceType || 'Unknown'}</Badge>
                      </TableCell>
                      <TableCell>{service.durationMinutes}min</TableCell>
                      <TableCell>
                        <Badge variant={service.availability ? "default" : "secondary"}>
                          {service.availability ? "Available" : "Unavailable"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(service)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(service.id)}
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

