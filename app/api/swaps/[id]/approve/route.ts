import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { NotificationService } from '@/server/services/notifications/notification.service'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    const swap = await prisma.shiftSwap.findFirst({
      where: {
        id: params.id,
        OR: [
          { targetEmployeeId: user.id },
          { requesterId: user.id },
        ],
      },
      include: {
        shift: true,
        requester: true,
        targetEmployee: true,
      },
    })

    if (!swap) {
      return NextResponse.json({ message: 'Swap not found' }, { status: 404 })
    }

    if (swap.status !== 'PENDING') {
      return NextResponse.json({ message: 'Swap already processed' }, { status: 400 })
    }

    // Update swap status
    const updatedSwap = await prisma.shiftSwap.update({
      where: { id: params.id },
      data: { status: 'APPROVED' },
    })

    // Update shift employee if target employee is specified
    if (swap.targetEmployeeId) {
      await prisma.shift.update({
        where: { id: swap.shiftId },
        data: {
          employeeId: swap.targetEmployeeId,
        },
      })
    }

    // Send notifications
    await NotificationService.notifyShiftSwap(swap.id, 'approved')

    return NextResponse.json({ swap: updatedSwap }, { status: 200 })
  } catch (error) {
    console.error('Error approving swap:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
