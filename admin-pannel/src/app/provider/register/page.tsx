"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { register, type RegisterRequest } from "@/lib/api"
import Link from "next/link"

interface Occupation {
  id: number
  name: string
  description: string
  isActive: boolean
}

export default function ProviderRegisterPage() {
  const [formData, setFormData] = useState<RegisterRequest & {
    occupationId: number
    businessName: string
    businessAddress: string
    phoneNumber: string
    experience: string
    skills: string[]
    certifications: string[]
    bio: string
  }>({
    email: "",
    password: "",
    fullName: "",
    occupationId: 0,
    businessName: "",
    businessAddress: "",
    phoneNumber: "",
    experience: "",
    skills: [],
    certifications: [],
    bio: ""
  })
  const [occupations, setOccupations] = useState<Occupation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [skillInput, setSkillInput] = useState("")
  const [certificationInput, setCertificationInput] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchOccupations()
  }, [])

  const fetchOccupations = async () => {
    try {
      const response = await fetch('/api/occupations')
      const data = await response.json()
      if (data.success) {
        setOccupations(data.data)
      }
    } catch (err) {
      console.error("Failed to fetch occupations:", err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // First register the user
      const authResponse = await register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName
      })
      
      if (authResponse.success && authResponse.data) {
        // Store tokens
        localStorage.setItem("accessToken", authResponse.data.accessToken)
        localStorage.setItem("refreshToken", authResponse.data.refreshToken)
        localStorage.setItem("user", JSON.stringify(authResponse.data.user))
        document.cookie = `accessToken=${authResponse.data.accessToken}; path=/; max-age=86400`
        
        // Create provider profile
        const profileResponse = await fetch('/api/provider/profile', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authResponse.data.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            occupationId: formData.occupationId,
            businessName: formData.businessName,
            businessAddress: formData.businessAddress,
            phoneNumber: formData.phoneNumber,
            experience: formData.experience,
            skills: formData.skills,
            certifications: formData.certifications,
            bio: formData.bio,
          }),
        })
        
        if (profileResponse.ok) {
          router.replace("/provider/services")
        } else {
          setError("Failed to create provider profile")
        }
      } else {
        setError(authResponse.error || "Registration failed")
      }
    } catch (err) {
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const addSkill = () => {
    if (skillInput.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }))
      setSkillInput("")
    }
  }

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }))
  }

  const addCertification = () => {
    if (certificationInput.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, certificationInput.trim()]
      }))
      setCertificationInput("")
    }
  }

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-4xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Service Provider Registration</CardTitle>
          <CardDescription className="text-center">
            Join our platform as a service provider and start offering your services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  minLength={6}
                />
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Professional Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="occupationId">Occupation</Label>
                <Select
                  value={formData.occupationId.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, occupationId: Number(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your occupation" />
                  </SelectTrigger>
                  <SelectContent>
                    {occupations.map((occupation) => (
                      <SelectItem key={occupation.id} value={occupation.id.toString()}>
                        {occupation.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name (Optional)</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="Your business name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessAddress">Business Address</Label>
                <Textarea
                  id="businessAddress"
                  name="businessAddress"
                  value={formData.businessAddress}
                  onChange={handleChange}
                  placeholder="Your business address"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="e.g., 5 years, 10+ years"
                />
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Skills & Certifications</h3>
              
              <div className="space-y-2">
                <Label>Skills</Label>
                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add a skill"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(index)}>
                      {skill} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Certifications</Label>
                <div className="flex gap-2">
                  <Input
                    value={certificationInput}
                    onChange={(e) => setCertificationInput(e.target.value)}
                    placeholder="Add a certification"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                  />
                  <Button type="button" onClick={addCertification}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.certifications.map((cert, index) => (
                    <Badge key={index} variant="outline" className="cursor-pointer" onClick={() => removeCertification(index)}>
                      {cert} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself and your professional background..."
                rows={4}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !formData.occupationId}
            >
              {loading ? "Creating Account..." : "Register as Service Provider"}
            </Button>
            
            <div className="text-center text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                Sign in here
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
