import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/middleware/error-handler'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()

    // Fetch all user data
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        organization: {
          include: {
            employees: {
              include: {
                user: true,
              },
            },
          },
        },
        employee: true,
        notifications: true,
        userRoles: {
          include: {
            role: true,
          },
        },
        createdShifts: true,
        createdSchedules: true,
        swapRequests: {
          include: {
            shift: true,
          },
        },
        swapTargets: {
          include: {
            shift: true,
          },
        },
      },
    })

    if (!userData) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Format data for export (remove sensitive information)
    const exportData = {
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        role: userData.role,
        emailVerified: userData.emailVerified,
        emailVerifiedAt: userData.emailVerifiedAt,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      },
      organization: {
        id: userData.organization.id,
        name: userData.organization.name,
        subscriptionTier: userData.organization.subscriptionTier,
        createdAt: userData.organization.createdAt,
      },
      employee: userData.employee,
      notifications: userData.notifications,
      roles: userData.userRoles.map((ur) => ({
        role: ur.role.name,
        assignedAt: ur.assignedAt,
      })),
      shifts: userData.createdShifts,
      schedules: userData.createdSchedules,
      swapRequests: userData.swapRequests,
      swapTargets: userData.swapTargets,
      exportedAt: new Date().toISOString(),
    }

    // Return as JSON download
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="shiftely-data-export-${user.id}-${Date.now()}.json"`,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
