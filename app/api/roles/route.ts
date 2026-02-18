import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { PermissionService } from '@/server/services/permissions/permission.service'
import { PERMISSIONS } from '@/lib/permissions/permissions'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()

    const roles = await PermissionService.getOrganizationRoles(user.organizationId)

    return NextResponse.json({ roles }, { status: 200 })
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()

    // Check permission to manage roles
    const canManage = await PermissionService.hasPermission(
      user.id,
      user.organizationId,
      PERMISSIONS.SETTINGS_MANAGE_ROLES
    )

    if (!canManage) {
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await req.json()
    const { name, description, permissionIds } = body

    if (!name || !permissionIds || !Array.isArray(permissionIds)) {
      return NextResponse.json({ message: 'Invalid request' }, { status: 400 })
    }

    const role = await PermissionService.createRole(
      user.organizationId,
      name,
      description || null,
      permissionIds
    )

    return NextResponse.json({ role }, { status: 201 })
  } catch (error) {
    console.error('Error creating role:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
