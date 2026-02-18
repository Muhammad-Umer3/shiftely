import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { PermissionService } from '@/server/services/permissions/permission.service'
import { PERMISSIONS } from '@/lib/permissions/permissions'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; roleId: string } }
) {
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

    await PermissionService.removeRoleFromUser(params.id, params.roleId, user.organizationId)

    return NextResponse.json({ message: 'Role removed' }, { status: 200 })
  } catch (error) {
    console.error('Error removing role:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
