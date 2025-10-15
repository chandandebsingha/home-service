"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Filter, Star, Clock, MapPin, DollarSign } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { AuthGuard } from "@/components/auth-guard"
import { Service } from "@/lib/api"

export default function UserServicesPage() {
  const { hasPermission } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [sortBy, setSortBy] = useState("name")

  // Check permissions
  if (!hasPermission('canBrowseServices')) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            You don't have permission to browse services.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const fetchServices = async () => {
    try {
      setLoading(true)
      // TODO: Implement API call to fetch available services
      // const response = await getAvailableServices()
      // setServices(response.data)
      
      // Mock data for now
      const mockServices: Service[] = [
        {
          id: 1,
          name: "Professional House Cleaning",
          description: "Complete house cleaning with eco-friendly products. Includes all rooms, kitchen, bathrooms, and common areas.",
          price: 150,
          serviceType: "Fixed",
          availability: true,
          durationMinutes: 240,
          timeSlots: "8:00 AM - 6:00 PM",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 2,
          name: "Plumbing Repair Service",
          description: "Expert plumbing repairs for leaks, clogs, and fixture installations. Licensed and insured.",
          price: 80,
          serviceType: "Hourly",
          availability: true,
          durationMinutes: 60,
          timeSlots: "9:00 AM - 5:00 PM",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 3,
          name: "Garden Maintenance Package",
          description: "Monthly garden maintenance including mowing, trimming, and plant care. Perfect for busy homeowners.",
          price: 200,
          serviceType: "Package",
          availability: true,
          durationMinutes: 180,
          timeSlots: "7:00 AM - 4:00 PM",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 4,
          name: "Electrical Installation",
          description: "Safe electrical work including outlets, switches, and lighting installation. Certified electrician.",
          price: 120,
          serviceType: "Hourly",
          availability: true,
          durationMinutes: 90,
          timeSlots: "8:00 AM - 6:00 PM",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      
      setServices(mockServices)
      setFilteredServices(mockServices)
    } catch (err) {
      setError("Failed to fetch services")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  useEffect(() => {
    let filtered = services

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter (mock - would be based on actual categories)
    if (selectedCategory !== "all") {
      // filtered = filtered.filter(service => service.category === selectedCategory)
    }

    // Type filter
    if (selectedType !== "all") {
      filtered = filtered.filter(service => service.serviceType === selectedType)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "name":
          return a.name.localeCompare(b.name)
        case "duration":
          return (a.durationMinutes || 0) - (b.durationMinutes || 0)
        default:
          return 0
      }
    })

    setFilteredServices(filtered)
  }, [services, searchTerm, selectedCategory, selectedType, sortBy])

  const handleBookService = (service: Service) => {
    // TODO: Implement booking flow
    console.log("Booking service:", service)
    // This would typically redirect to a booking form or modal
  }

  return (
    <AuthGuard>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Browse Services</h1>
          <p className="text-gray-600">Find and book the services you need</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="gardening">Gardening</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Service Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Hourly">Hourly</SelectItem>
                    <SelectItem value="Fixed">Fixed</SelectItem>
                    <SelectItem value="Package">Package</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Grid */}
        {loading ? (
          <div className="text-center py-8">Loading services...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service) => (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <Badge variant={service.availability ? "default" : "secondary"}>
                      {service.availability ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{service.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 mr-1" />
                        Price
                      </div>
                      <span className="text-lg font-bold text-blue-600">${service.price}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <Filter className="w-4 h-4 mr-1" />
                        Type
                      </div>
                      <Badge variant="outline">{service.serviceType}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        Duration
                      </div>
                      <span className="text-sm">{service.durationMinutes} minutes</span>
                    </div>
                    
                    {service.timeSlots && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-1" />
                          Available
                        </div>
                        <span className="text-sm">{service.timeSlots}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <Button 
                      className="w-full" 
                      onClick={() => handleBookService(service)}
                      disabled={!service.availability}
                    >
                      {service.availability ? "Book Service" : "Unavailable"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredServices.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-8">
              <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Services Found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthGuard>
  )
}

