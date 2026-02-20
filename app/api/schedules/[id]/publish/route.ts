import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { SchedulerService } from '@/server/services/scheduler/scheduler.service'
import { completeOnboarding } from '@/lib/onboarding'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    const schedule = await SchedulerService.publishSchedule(id, user.organizationId, user.id)

    await completeOnboarding(user.organizationId)

    return NextResponse.json({ schedule }, { status: 200 })
  } catch (error) {
    console.error('Error publishing schedule:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
