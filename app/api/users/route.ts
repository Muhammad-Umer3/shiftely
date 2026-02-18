import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { PERMISSIONS } from '@/lib/permissions/permissions'
import { PermissionService } from '@/server/services/permissions/permission.service'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()

    // Check permission to view employees
    const canView = await PermissionService.hasPermission(
      user.id,
      user.organizationId,
      PERMISSIONS.EMPLOYEE_VIEW
    )

    if (!canView) {
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      where: { organizationId: user.organizationId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ users }, { status: 200 })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
