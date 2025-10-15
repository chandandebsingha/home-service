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
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { AuthGuard } from "@/components/auth-guard"

interface Occupation {
  id: number
  name: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function OccupationsPage() {
  const { hasPermission, token } = useAuth()
  const [occupations, setOccupations] = useState<Occupation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingOccupation, setEditingOccupation] = useState<Occupation | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true
  })

  // Check permissions
  if (!hasPermission('canManageCategories')) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            You don't have permission to manage occupations.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const fetchOccupations = async () => {
    try {
      setLoading(true)
      if (!token) {
        setError("No authentication token")
        return
      }
      
      const response = await fetch('/api/occupations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      if (data.success) {
        setOccupations(data.data)
      } else {
        setError(data.error || "Failed to fetch occupations")
      }
    } catch (err) {
      setError("Failed to fetch occupations")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOccupations()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      setError("No authentication token")
      return
    }

    try {
      const url = editingOccupation ? `/api/occupations/${editingOccupation.id}` : '/api/occupations'
      const method = editingOccupation ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json()
      if (data.success) {
        setIsDialogOpen(false)
        setFormData({ name: "", description: "", isActive: true })
        setEditingOccupation(null)
        fetchOccupations()
      } else {
        setError(data.error || "Failed to save occupation")
      }
    } catch (err) {
      setError("Failed to save occupation")
    }
  }

  const handleEdit = (occupation: Occupation) => {
    setEditingOccupation(occupation)
    setFormData({
      name: occupation.name,
      description: occupation.description,
      isActive: occupation.isActive
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this occupation?")) {
      if (!token) {
        setError("No authentication token")
        return
      }

      try {
        const response = await fetch(`/api/occupations/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        
        const data = await response.json()
        if (data.success) {
          fetchOccupations()
        } else {
          setError(data.error || "Failed to delete occupation")
        }
      } catch (err) {
        setError("Failed to delete occupation")
      }
    }
  }

  return (
    <AuthGuard>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Occupations Management</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingOccupation(null)
                setFormData({ name: "", description: "", isActive: true })
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Occupation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingOccupation ? "Edit Occupation" : "Add New Occupation"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="name">Occupation Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="e.g., Plumber, Electrician, Cleaner"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe this occupation"
                    rows={3}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingOccupation ? "Update" : "Create"} Occupation
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Occupations ({occupations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading occupations...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {occupations.map((occupation) => (
                    <TableRow key={occupation.id}>
                      <TableCell className="font-medium">{occupation.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{occupation.name}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{occupation.description}</TableCell>
                      <TableCell>
                        <Badge variant={occupation.isActive ? "default" : "secondary"}>
                          {occupation.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(occupation.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(occupation)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(occupation.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
