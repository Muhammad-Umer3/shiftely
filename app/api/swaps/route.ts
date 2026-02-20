import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { NotificationService } from '@/server/services/notifications/notification.service'

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { slotId, targetEmployeeId } = body

    // Verify slot belongs to organization
    const slot = await prisma.slot.findFirst({
      where: {
        id: slotId,
        organizationId: user.organizationId,
      },
      include: {
        assignments: {
          include: {
            employee: {
              include: { user: true },
            },
          },
        },
      },
    })

    if (!slot) {
      return NextResponse.json({ message: 'Slot not found' }, { status: 404 })
    }

    // Requester must have an assignment on this slot (or be the one giving it away)
    const userEmployee = await prisma.employee.findFirst({
      where: { userId: user.id, organizationId: user.organizationId },
    })
    if (!userEmployee) {
      return NextResponse.json({ message: 'Employee record not found' }, { status: 404 })
    }

    const requesterAssignment = slot.assignments.find((a) => a.employeeId === userEmployee.id)
    if (!requesterAssignment) {
      return NextResponse.json({ message: 'You are not assigned to this slot' }, { status: 403 })
    }

    // Create swap request
    const swap = await prisma.slotSwap.create({
      data: {
        slotId,
        slotAssignmentId: requesterAssignment.id,
        organizationId: user.organizationId,
        requesterId: user.id,
        targetEmployeeId: targetEmployeeId || null,
        status: 'PENDING',
      },
      include: {
        slot: true,
        requester: true,
        targetEmployee: true,
      },
    })

    // Send notification
    await NotificationService.notifySlotSwap(swap.id, 'requested')

    return NextResponse.json({ swap }, { status: 201 })
  } catch (error) {
    console.error('Error creating swap request:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()

    const swaps = await prisma.slotSwap.findMany({
      where: {
        OR: [
          { requesterId: user.id },
          { targetEmployeeId: user.id },
        ],
      },
      include: {
        slot: {
          include: {
            assignments: {
              include: {
                employee: {
                  include: { user: true },
                },
              },
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
