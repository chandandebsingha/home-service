"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, MapPin, Star, Phone, MessageSquare } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { AuthGuard } from "@/components/auth-guard"
import { Booking } from "@/lib/api"

export default function UserBookingsPage() {
  const { hasPermission } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Check permissions
  if (!hasPermission('canViewOwnBookings')) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            You don't have permission to view bookings.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const fetchMyBookings = async () => {
    try {
      setLoading(true)
      // TODO: Implement API call to fetch user's bookings
      // const response = await getMyBookings()
      // setBookings(response.data)
      
      // Mock data for now
      setBookings([
        {
          id: 1,
          userId: 1,
          serviceId: 1,
          date: "2024-01-15",
          time: "10:00 AM",
          address: "123 Main St, City, State",
          specialInstructions: "Please use eco-friendly products",
          price: 150,
          status: "upcoming",
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          userId: 1,
          serviceId: 2,
          date: "2024-01-10",
          time: "2:00 PM",
          address: "456 Oak Ave, City, State",
          specialInstructions: "",
          price: 80,
          status: "completed",
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          userId: 1,
          serviceId: 3,
          date: "2024-01-05",
          time: "9:00 AM",
          address: "789 Pine Rd, City, State",
          specialInstructions: "Pet-friendly cleaning products only",
          price: 200,
          status: "cancelled",
          createdAt: new Date().toISOString()
        }
      ])
    } catch (err) {
      setError("Failed to fetch bookings")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyBookings()
  }, [])

  const handleCancelBooking = async (bookingId: number) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      try {
        // TODO: Implement cancel booking API call
        console.log("Cancelling booking:", bookingId)
        
        setBookings(prev => prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled' as any }
            : booking
        ))
      } catch (err) {
        setError("Failed to cancel booking")
      }
    }
  }

  const handleLeaveReview = (bookingId: number) => {
    // TODO: Implement review modal/form
    console.log("Leaving review for booking:", bookingId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'default'
      case 'completed':
        return 'secondary'
      case 'cancelled':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const upcomingBookings = bookings.filter(b => b.status === 'upcoming')
  const completedBookings = bookings.filter(b => b.status === 'completed')
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled')

  return (
    <AuthGuard>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-gray-600">Track and manage your service bookings</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Upcoming ({upcomingBookings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{upcomingBookings.length}</div>
              <p className="text-sm text-gray-600">Scheduled services</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2" />
                Completed ({completedBookings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedBookings.length}</div>
              <p className="text-sm text-gray-600">Finished services</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Cancelled ({cancelledBookings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{cancelledBookings.length}</div>
              <p className="text-sm text-gray-600">Cancelled bookings</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Booking #{booking.id}</CardTitle>
                    <p className="text-sm text-gray-600">Service ID: {booking.serviceId}</p>
                  </div>
                  <Badge variant={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium">{booking.date}</div>
                        <div className="text-sm text-gray-600">Date</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium">{booking.time}</div>
                        <div className="text-sm text-gray-600">Time</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium">{booking.address}</div>
                        <div className="text-sm text-gray-600">Address</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Price:</span>
                      <span className="text-lg font-bold text-green-600">${booking.price}</span>
                    </div>
                    
                    {booking.specialInstructions && (
                      <div>
                        <div className="text-sm font-medium text-gray-600">Special Instructions:</div>
                        <div className="text-sm">{booking.specialInstructions}</div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Booked on:</span>
                      <span className="text-sm">{new Date(booking.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="flex space-x-2">
                    {booking.status === 'upcoming' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        Cancel Booking
                      </Button>
                    )}
                    
                    {booking.status === 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLeaveReview(booking.id)}
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Leave Review
                      </Button>
                    )}
                    
                    {booking.status === 'cancelled' && (
                      <span className="text-sm text-gray-500">This booking was cancelled</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {bookings.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Bookings Yet</h3>
              <p className="text-gray-600 mb-4">Start by browsing and booking services you need.</p>
              <Button>
                Browse Services
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthGuard>
  )
}

