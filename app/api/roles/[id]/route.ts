import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { PermissionService } from '@/server/services/permissions/permission.service'
import { PERMISSIONS } from '@/lib/permissions/permissions'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    const role = await PermissionService.getRole(id, user.organizationId)

    if (!role) {
      return NextResponse.json({ message: 'Role not found' }, { status: 404 })
    }

    return NextResponse.json({ role }, { status: 200 })
  } catch (error) {
    console.error('Error fetching role:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
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
    const { name, description, permissionIds } = body

    if (!name || !permissionIds || !Array.isArray(permissionIds)) {
      return NextResponse.json({ message: 'Invalid request' }, { status: 400 })
    }

    const role = await PermissionService.updateRole(
      id,
      user.organizationId,
      name,
      description || null,
      permissionIds
    )

    return NextResponse.json({ role }, { status: 200 })
  } catch (error) {
    console.error('Error updating role:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    await PermissionService.deleteRole(id, user.organizationId)

    return NextResponse.json({ message: 'Role deleted' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting role:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
