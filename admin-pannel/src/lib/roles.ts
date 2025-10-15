// Role-based access control system

export enum UserRole {
  ADMIN = 'admin',
  SERVICE_PROVIDER = 'service_provider', 
  USER = 'user'
}

export interface RolePermissions {
  canManageCategories: boolean
  canManageTypes: boolean
  canManageAllServices: boolean
  canManageOwnServices: boolean
  canApproveProviders: boolean
  canManageUsers: boolean
  canViewAllBookings: boolean
  canViewAnalytics: boolean
  canBrowseServices: boolean
  canBookServices: boolean
  canViewOwnBookings: boolean
  canLeaveReviews: boolean
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  [UserRole.ADMIN]: {
    canManageCategories: true,
    canManageTypes: true,
    canManageAllServices: true,
    canManageOwnServices: true,
    canApproveProviders: true,
    canManageUsers: true,
    canViewAllBookings: true,
    canViewAnalytics: true,
    canBrowseServices: true,
    canBookServices: true,
    canViewOwnBookings: true,
    canLeaveReviews: true,
  },
  [UserRole.SERVICE_PROVIDER]: {
    canManageCategories: false,
    canManageTypes: false,
    canManageAllServices: false,
    canManageOwnServices: true,
    canApproveProviders: false,
    canManageUsers: false,
    canViewAllBookings: false,
    canViewAnalytics: false,
    canBrowseServices: true,
    canBookServices: false,
    canViewOwnBookings: true,
    canLeaveReviews: false,
  },
  [UserRole.USER]: {
    canManageCategories: false,
    canManageTypes: false,
    canManageAllServices: false,
    canManageOwnServices: false,
    canApproveProviders: false,
    canManageUsers: false,
    canViewAllBookings: false,
    canViewAnalytics: false,
    canBrowseServices: true,
    canBookServices: true,
    canViewOwnBookings: true,
    canLeaveReviews: true,
  },
}

export function hasPermission(userRole: UserRole, permission: keyof RolePermissions): boolean {
  return ROLE_PERMISSIONS[userRole][permission]
}

export function getUserRoleFromString(role: string): UserRole {
  switch (role?.toLowerCase()) {
    case 'admin':
      return UserRole.ADMIN
    case 'service_provider':
    case 'provider':
      return UserRole.SERVICE_PROVIDER
    case 'user':
    default:
      return UserRole.USER
  }
}

export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return 'Administrator'
    case UserRole.SERVICE_PROVIDER:
      return 'Service Provider'
    case UserRole.USER:
      return 'User'
  }
}

