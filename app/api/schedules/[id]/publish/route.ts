import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { SchedulerService } from '@/server/services/scheduler/scheduler.service'
import { SubscriptionService } from '@/server/services/subscription/subscription.service'
import { completeOnboarding } from '@/lib/onboarding'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    const existing = await prisma.schedule.findFirst({
      where: { id, organizationId: user.organizationId },
      select: { weekStartDate: true },
    })
    if (!existing?.weekStartDate) {
      return NextResponse.json({ message: 'Schedule not found' }, { status: 404 })
    }
    const canEdit = await SubscriptionService.canEditScheduleForWeek(
      user.organizationId,
      new Date(existing.weekStartDate)
    )
    if (!canEdit) {
      return NextResponse.json(
        { message: 'Free plan: you can only publish schedules for the current week.' },
        { status: 403 }
      )
    }

    const schedule = await SchedulerService.publishSchedule(id, user.organizationId, user.id)

    await completeOnboarding(user.organizationId)

    return NextResponse.json({ schedule }, { status: 200 })
  } catch (error) {
    console.error('Error publishing schedule:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
