import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { NotificationService } from '@/server/services/notifications/notification.service'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    const swap = await prisma.slotSwap.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
        OR: [
          { targetEmployeeId: user.id },
          { requesterId: user.id },
        ],
      },
    })

    if (!swap) {
      return NextResponse.json({ message: 'Swap not found' }, { status: 404 })
    }

    if (swap.status !== 'PENDING') {
      return NextResponse.json({ message: 'Swap already processed' }, { status: 400 })
    }

    const updatedSwap = await prisma.slotSwap.update({
      where: { id },
      data: { status: 'REJECTED' },
    })

    await NotificationService.notifySlotSwap(swap.id, 'rejected')

    return NextResponse.json({ swap: updatedSwap }, { status: 200 })
  } catch (error) {
    console.error('Error rejecting swap:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
