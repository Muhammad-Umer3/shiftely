import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { SchedulerService } from '@/server/services/scheduler/scheduler.service'
import { startOfWeek } from 'date-fns'

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { targetWeekStart, sourceWeekStart } = body

    const targetStart = targetWeekStart
      ? startOfWeek(new Date(targetWeekStart), { weekStartsOn: 1 })
      : startOfWeek(new Date(), { weekStartsOn: 1 })
    const sourceStart = sourceWeekStart
      ? startOfWeek(new Date(sourceWeekStart), { weekStartsOn: 1 })
      : startOfWeek(new Date(targetStart.getTime() - 7 * 24 * 60 * 60 * 1000), {
          weekStartsOn: 1,
        })

    const result = await SchedulerService.copyFromPreviousWeek(
      user.organizationId,
      sourceStart,
      targetStart,
      user.id
    )

    if (result.copiedCount === 0) {
      return NextResponse.json(
        { message: 'No shifts to copy from previous week', schedule: result.schedule },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { schedule: result.schedule, copiedCount: result.copiedCount },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error copying schedule:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
