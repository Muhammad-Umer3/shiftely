import { auth } from '@/server/auth'
import { Permission } from '@/lib/permissions/permissions'
import { hasPermission, hasAnyPermission, hasAllPermissions } from '@/lib/permissions/check'

export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden')
  }
  return user
}

/**
 * Check if current user has a specific permission
 */
export async function checkPermission(permission: Permission): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user || !user.permissions) {
    return false
  }
  return hasPermission(user.permissions, permission)
}

/**
 * Check if current user has any of the required permissions
 */
export async function checkAnyPermission(permissions: Permission[]): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user || !user.permissions) {
    return false
  }
  return hasAnyPermission(user.permissions, permissions)
}

/**
 * Check if current user has all required permissions
 */
export async function checkAllPermissions(permissions: Permission[]): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user || !user.permissions) {
    return false
  }
  return hasAllPermissions(user.permissions, permissions)
}

/**
 * Require a specific permission (throws if not authorized)
 */
export async function requirePermission(permission: Permission) {
  const user = await requireAuth()
  if (!user.permissions || !hasPermission(user.permissions, permission)) {
    throw new Error('Forbidden: Insufficient permissions')
  }
  return user
}

/**
 * Require any of the specified permissions (throws if not authorized)
 */
export async function requireAnyPermission(permissions: Permission[]) {
  const user = await requireAuth()
  if (!user.permissions || !hasAnyPermission(user.permissions, permissions)) {
    throw new Error('Forbidden: Insufficient permissions')
  }
  return user
}

/**
 * Require all specified permissions (throws if not authorized)
 */
export async function requireAllPermission(permissions: Permission[]) {
  const user = await requireAuth()
  if (!user.permissions || !hasAllPermissions(user.permissions, permissions)) {
    throw new Error('Forbidden: Insufficient permissions')
  }
  return user
}
