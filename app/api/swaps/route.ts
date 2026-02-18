import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { NotificationService } from '@/server/services/notifications/notification.service'

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { shiftId, targetEmployeeId } = body

    // Verify shift belongs to organization
    const shift = await prisma.shift.findFirst({
      where: {
        id: shiftId,
        organizationId: user.organizationId,
      },
      include: {
        employee: {
          include: { user: true },
        },
      },
    })

    if (!shift) {
      return NextResponse.json({ message: 'Shift not found' }, { status: 404 })
    }

    // Create swap request
    const swap = await prisma.shiftSwap.create({
      data: {
        shiftId,
        organizationId: user.organizationId,
        requesterId: user.id,
        targetEmployeeId: targetEmployeeId || null,
        status: 'PENDING',
      },
      include: {
        shift: true,
        requester: true,
        targetEmployee: true,
      },
    })

    // Send notification
    await NotificationService.notifyShiftSwap(swap.id, 'requested')

    return NextResponse.json({ swap }, { status: 201 })
  } catch (error) {
    console.error('Error creating swap request:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()

    const swaps = await prisma.shiftSwap.findMany({
      where: {
        OR: [
          { requesterId: user.id },
          { targetEmployeeId: user.id },
        ],
      },
      include: {
        shift: {
          include: {
            employee: {
              include: { user: true },
            },
          },
        },
        requester: true,
        targetEmployee: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ swaps }, { status: 200 })
  } catch (error) {
    console.error('Error fetching swaps:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
