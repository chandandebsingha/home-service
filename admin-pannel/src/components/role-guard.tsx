"use client"

import { ReactNode } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { UserRole } from "@/lib/roles"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: UserRole[]
  fallback?: ReactNode
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { userRole } = useAuth()

  if (!allowedRoles.includes(userRole)) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            You don't have permission to access this page. Required roles: {allowedRoles.join(", ")}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return <>{children}</>
}

// Convenience components for specific roles
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function ProviderOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={[UserRole.SERVICE_PROVIDER]} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function UserOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={[UserRole.USER]} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function AdminOrProvider({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.SERVICE_PROVIDER]} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

