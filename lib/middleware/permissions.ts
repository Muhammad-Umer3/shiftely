import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { PermissionService } from '@/server/services/permissions/permission.service'
import { Permission } from '@/lib/permissions/permissions'

/**
 * Middleware to check if user has required permission
 */
export async function requirePermission(
  req: NextRequest,
  permission: Permission
): Promise<{ user: any; error?: NextResponse }> {
  try {
    const user = await requireAuth()
    
    const hasPermission = await PermissionService.hasPermission(
      user.id,
      user.organizationId,
      permission
    )

    if (!hasPermission) {
      return {
        user: null,
        error: NextResponse.json(
          { message: 'Insufficient permissions' },
          { status: 403 }
        ),
      }
    }

    return { user }
  } catch (error) {
    return {
      user: null,
      error: NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      ),
    }
  }
}

/**
 * Middleware to check if user has any of the required permissions
 */
export async function requireAnyPermission(
  req: NextRequest,
  permissions: Permission[]
): Promise<{ user: any; error?: NextResponse }> {
  try {
    const user = await requireAuth()
    
    const hasPermission = await PermissionService.hasAnyPermission(
      user.id,
      user.organizationId,
      permissions
    )

    if (!hasPermission) {
      return {
        user: null,
        error: NextResponse.json(
          { message: 'Insufficient permissions' },
          { status: 403 }
        ),
      }
    }

    return { user }
  } catch (error) {
    return {
      user: null,
      error: NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      ),
    }
  }
}

/**
 * Middleware to check if user has all required permissions
 */
export async function requireAllPermissions(
  req: NextRequest,
  permissions: Permission[]
): Promise<{ user: any; error?: NextResponse }> {
  try {
    const user = await requireAuth()
    
    const hasPermission = await PermissionService.hasAllPermissions(
      user.id,
      user.organizationId,
      permissions
    )

    if (!hasPermission) {
      return {
        user: null,
        error: NextResponse.json(
          { message: 'Insufficient permissions' },
          { status: 403 }
        ),
      }
    }

    return { user }
  } catch (error) {
    return {
      user: null,
      error: NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      ),
    }
  }
}
