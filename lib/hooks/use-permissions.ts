'use client'

import { useSession } from 'next-auth/react'
import { Permission } from '@/lib/permissions/permissions'
import { hasPermission, hasAnyPermission, hasAllPermissions } from '@/lib/permissions/check'

export function usePermissions() {
  const { data: session } = useSession()
  const permissions = session?.user?.permissions || []

  return {
    permissions,
    hasPermission: (permission: Permission) => hasPermission(permissions, permission),
    hasAnyPermission: (requiredPermissions: Permission[]) =>
      hasAnyPermission(permissions, requiredPermissions),
    hasAllPermissions: (requiredPermissions: Permission[]) =>
      hasAllPermissions(permissions, requiredPermissions),
    canPerform: (resource: string, action: string) => {
      const permission = `${resource}:${action}` as Permission
      return hasPermission(permissions, permission)
    },
  }
}
