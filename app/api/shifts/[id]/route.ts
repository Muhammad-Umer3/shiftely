import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { SubscriptionService } from '@/server/services/subscription/subscription.service'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    const slot = await prisma.slot.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
      include: { schedule: { select: { weekStartDate: true } } },
    })

    if (!slot) {
      return NextResponse.json({ message: 'Slot not found' }, { status: 404 })
    }
    if (slot.schedule?.weekStartDate) {
      const canEdit = await SubscriptionService.canEditScheduleForWeek(
        user.organizationId,
        new Date(slot.schedule.weekStartDate)
      )
      if (!canEdit) {
        return NextResponse.json(
          { message: 'Free plan: you can only edit schedules for the current week.' },
          { status: 403 }
        )
      }
    }

    await prisma.slot.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Slot deleted' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting slot:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
