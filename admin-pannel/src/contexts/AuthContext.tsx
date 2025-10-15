"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { User, AuthResponse } from "@/lib/api"
import { UserRole, getUserRoleFromString, hasPermission, ROLE_PERMISSIONS, type RolePermissions } from "@/lib/roles"

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (user: User, token: string, refreshToken: string) => void
  logout: () => void
  isAuthenticated: boolean
  userRole: UserRole
  permissions: RolePermissions
  hasPermission: (permission: keyof RolePermissions) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Role and dynamic permissions
  const userRole = user?.role ? getUserRoleFromString(user.role) : UserRole.USER
  const permissions: RolePermissions = ROLE_PERMISSIONS[userRole]

  useEffect(() => {
    // Check for existing auth data on mount
    const storedToken = localStorage.getItem("accessToken")
    const storedUser = localStorage.getItem("user")
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("user")
      }
    }
    
    setLoading(false)
  }, [])

  const login = (userData: User, accessToken: string, refreshToken: string) => {
    setUser(userData)
    setToken(accessToken)
    
    // Store in localStorage
    localStorage.setItem("accessToken", accessToken)
    localStorage.setItem("refreshToken", refreshToken)
    localStorage.setItem("user", JSON.stringify(userData))
    
    // Set cookie for server-side access
    document.cookie = `accessToken=${accessToken}; path=/; max-age=86400`
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    
    // Clear localStorage
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
    
    // Clear cookie
    document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  }

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user && !!token,
    userRole,
    permissions,
    hasPermission: (permission: keyof RolePermissions) => hasPermission(userRole, permission),
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
