import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { SchedulerService } from '@/server/services/scheduler/scheduler.service'
import { SubscriptionService } from '@/server/services/subscription/subscription.service'
import { startOfWeek } from 'date-fns'

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { weekStartDate, autoFill } = body

    const weekStart = weekStartDate ? new Date(weekStartDate) : startOfWeek(new Date(), { weekStartsOn: 1 })

    // Check if schedule already exists
    const existing = await SchedulerService.getScheduleForWeek(user.organizationId, weekStart)
    if (existing) {
      return NextResponse.json({ schedule: existing }, { status: 200 })
    }

    // Check subscription limits for new schedules
    const limitCheck = await SubscriptionService.canAddSchedule(user.organizationId)
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          message: limitCheck.reason,
          upgradeRequired: limitCheck.upgradeRequired,
        },
        { status: 403 }
      )
    }

    const schedule = await SchedulerService.createSchedule(
      user.organizationId,
      weekStart,
      user.id
    )

    if (autoFill) {
      await SchedulerService.autoFillShifts(schedule.id, user.organizationId, weekStart)
    }

    return NextResponse.json({ schedule }, { status: 201 })
  } catch (error) {
    console.error('Error creating schedule:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    const weekStartDate = searchParams.get('weekStartDate')

    const weekStart = weekStartDate
      ? new Date(weekStartDate)
      : startOfWeek(new Date(), { weekStartsOn: 1 })

    const schedule = await SchedulerService.getScheduleForWeek(user.organizationId, weekStart)

    return NextResponse.json({ schedule }, { status: 200 })
  } catch (error) {
    console.error('Error fetching schedule:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
