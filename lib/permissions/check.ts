import { Permission } from './permissions'

/**
 * Check if a user has a specific permission
 */
export function hasPermission(userPermissions: Permission[], requiredPermission: Permission): boolean {
  return userPermissions.includes(requiredPermission)
}

/**
 * Check if a user has any of the required permissions
 */
export function hasAnyPermission(
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.some((permission) => userPermissions.includes(permission))
}

/**
 * Check if a user has all of the required permissions
 */
export function hasAllPermissions(
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.every((permission) => userPermissions.includes(permission))
}

/**
 * Check if a user has permission for a resource and action
 */
export function canPerform(
  userPermissions: Permission[],
  resource: string,
  action: string
): boolean {
  const permission = `${resource}:${action}` as Permission
  return hasPermission(userPermissions, permission)
}
