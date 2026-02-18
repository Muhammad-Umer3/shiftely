import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { PermissionService } from '@/server/services/permissions/permission.service'
import { PERMISSIONS } from '@/lib/permissions/permissions'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

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
    const { roleId } = body

    if (!roleId) {
      return NextResponse.json({ message: 'Role ID is required' }, { status: 400 })
    }

    const userRole = await PermissionService.assignRoleToUser(
      id,
      roleId,
      user.id,
      user.organizationId
    )

    return NextResponse.json({ userRole }, { status: 201 })
  } catch (error) {
    console.error('Error assigning role:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
