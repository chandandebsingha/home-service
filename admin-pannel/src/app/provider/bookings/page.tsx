"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, MapPin, User, Phone } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { AuthGuard } from "@/components/auth-guard"
import { Booking, getMyBookings, updateBookingStatus } from "@/lib/api"

export default function ProviderBookingsPage() {
  const { hasPermission, token } = useAuth()
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
      // TODO: Implement API call to fetch provider's bookings
      // const response = await getMyBookings()
      // setBookings(response.data)
      
      // Mock data for now
      setBookings([
        {
          id: 1,
          userId: 101,
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
          userId: 102,
          serviceId: 2,
          date: "2024-01-16",
          time: "2:00 PM",
          address: "456 Oak Ave, City, State",
          specialInstructions: "",
          price: 80,
          status: "completed",
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          userId: 103,
          serviceId: 1,
          date: "2024-01-17",
          time: "9:00 AM",
          address: "789 Pine Rd, City, State",
          specialInstructions: "Pet-friendly cleaning products only",
          price: 150,
          status: "upcoming",
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

  const handleStatusUpdate = async (bookingId: number, newStatus: string) => {
    try {
      // TODO: Implement status update API call
      console.log("Updating booking status:", bookingId, newStatus)
      
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus as any }
          : booking
      ))
    } catch (err) {
      setError("Failed to update booking status")
    }
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
          <p className="text-gray-600">Manage your service bookings</p>
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
              <p className="text-sm text-gray-600">Scheduled bookings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
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
                <User className="w-5 h-5 mr-2" />
                Cancelled ({cancelledBookings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{cancelledBookings.length}</div>
              <p className="text-sm text-gray-600">Cancelled bookings</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Bookings ({bookings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading bookings...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">#{booking.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">User #{booking.userId}</div>
                          <div className="text-sm text-gray-600">Customer</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">Service #{booking.serviceId}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{booking.date}</div>
                          <div className="text-sm text-gray-600">{booking.time}</div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 mr-1 mt-0.5 text-gray-400" />
                          <span className="text-sm">{booking.address}</span>
                        </div>
                        {booking.specialInstructions && (
                          <div className="text-xs text-gray-500 mt-1">
                            Note: {booking.specialInstructions}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold">${booking.price}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {booking.status === 'upcoming' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(booking.id, 'completed')}
                              >
                                Complete
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                          {booking.status === 'completed' && (
                            <span className="text-sm text-gray-500">Completed</span>
                          )}
                          {booking.status === 'cancelled' && (
                            <span className="text-sm text-gray-500">Cancelled</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  )
}

