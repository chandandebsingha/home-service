import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  getAdminStats, 
  getAllServices, 
  getAllBookings, 
  type AdminStatsResponse,
  type Service,
  type Booking 
} from "@/lib/api"
import { cookies } from "next/headers"
import { AuthGuard } from "@/components/auth-guard"
import { AdminOnly } from "@/components/role-guard"

async function fetchStats(): Promise<AdminStatsResponse | null> {
  const token = (await cookies()).get("accessToken")?.value
  const res = await getAdminStats(token)
  if (!res.success) return null
  return res.data as AdminStatsResponse
}

async function fetchAllServices(): Promise<Service[]> {
  const token = (await cookies()).get("accessToken")?.value
  const res = await getAllServices(token)
  if (!res.success) return []
  return res.data as Service[]
}

async function fetchAllBookings(): Promise<Booking[]> {
  const token = (await cookies()).get("accessToken")?.value
  if (!token) return []
  const res = await getAllBookings(token)
  if (!res.success) return []
  return res.data as Booking[]
}

export default async function Page() {
  const [stats, services, bookings] = await Promise.all([
    fetchStats(),
    fetchAllServices(),
    fetchAllBookings()
  ])
  
  return (
    <AuthGuard>
      <AdminOnly>
        <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Admin Panel
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Users</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-semibold">
                {stats?.counts.users ?? "-"}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Services</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-semibold">
                {stats?.counts.services ?? "-"}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Bookings</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-semibold">
                {stats?.counts.bookings ?? "-"}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>All Services ({services.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between text-sm p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{service.name}</div>
                        <div className="text-gray-600 text-xs">{service.description}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={service.availability ? "default" : "secondary"}>
                            {service.availability ? "Available" : "Unavailable"}
                          </Badge>
                          {service.serviceType && (
                            <Badge variant="outline">{service.serviceType}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-blue-600">₹ {service.price}</div>
                        {service.durationMinutes && (
                          <div className="text-xs text-gray-500">{service.durationMinutes}min</div>
                        )}
                      </div>
                    </div>
                  ))}
                  {services.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      No services found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Bookings ({bookings.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between text-sm p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">Booking #{booking.id}</div>
                        <div className="text-gray-600 text-xs">{booking.date} at {booking.time}</div>
                        <div className="text-gray-600 text-xs">{booking.address}</div>
                        <Badge 
                          variant={
                            booking.status === 'upcoming' ? 'default' : 
                            booking.status === 'completed' ? 'secondary' : 'destructive'
                          }
                        >
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">${booking.price}</div>
                        <div className="text-xs text-gray-500">Service #{booking.serviceId}</div>
                      </div>
                    </div>
                  ))}
                  {bookings.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      No bookings found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Data Tables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Services Table</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {services.map((service) => (
                          <TableRow key={service.id}>
                            <TableCell className="font-medium">{service.id}</TableCell>
                            <TableCell>{service.name}</TableCell>
                            <TableCell className="max-w-xs truncate">{service.description || "-"}</TableCell>
                            <TableCell>₹ {service.price}</TableCell>
                            <TableCell>{service.serviceType || "-"}</TableCell>
                            <TableCell>
                              <Badge variant={service.availability ? "default" : "secondary"}>
                                {service.availability ? "Available" : "Unavailable"}
                              </Badge>
                            </TableCell>
                            <TableCell>{service.createdAt ? new Date(service.createdAt).toLocaleDateString() : "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Bookings Table</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>User ID</TableHead>
                          <TableHead>Service ID</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-medium">{booking.id}</TableCell>
                            <TableCell>{booking.userId}</TableCell>
                            <TableCell>{booking.serviceId}</TableCell>
                            <TableCell>{booking.date} {booking.time}</TableCell>
                            <TableCell className="max-w-xs truncate">{booking.address}</TableCell>
                            <TableCell>${booking.price}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  booking.status === 'upcoming' ? 'default' : 
                                  booking.status === 'completed' ? 'secondary' : 'destructive'
                                }
                              >
                                {booking.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </SidebarInset>
        </SidebarProvider>
      </AdminOnly>
    </AuthGuard>
  )
}
