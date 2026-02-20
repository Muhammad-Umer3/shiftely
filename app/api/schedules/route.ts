import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { SchedulerService } from '@/server/services/scheduler/scheduler.service'
import { SubscriptionService } from '@/server/services/subscription/subscription.service'
import { setOnboardingStep } from '@/lib/onboarding'
import { startOfWeek } from 'date-fns'

const DEFAULT_DISPLAY = { startHour: 6, endHour: 22, workingDays: [1, 2, 3, 4, 5] }

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { weekStartDate, autoFill, name } = body

    const weekStart = weekStartDate ? new Date(weekStartDate) : startOfWeek(new Date(), { weekStartsOn: 1 })

    // Check if schedule already exists
    const existing = await SchedulerService.getScheduleForWeek(user.organizationId, weekStart)
    if (existing) {
      return NextResponse.json({ schedule: existing, existing: true }, { status: 200 })
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

    const org = await prisma.organization.findUnique({ where: { id: user.organizationId } })
    const orgSettings = (org?.settings as Record<string, unknown>) ?? {}
    const scheduleSettings = (orgSettings.scheduleSettings as { startHour?: number; endHour?: number; workingDays?: number[] }) ?? {}
    const displaySettings = {
      startHour: scheduleSettings.startHour ?? DEFAULT_DISPLAY.startHour,
      endHour: scheduleSettings.endHour ?? DEFAULT_DISPLAY.endHour,
      workingDays: Array.isArray(scheduleSettings.workingDays) ? scheduleSettings.workingDays : DEFAULT_DISPLAY.workingDays,
    }

    const schedule = await SchedulerService.createSchedule(
      user.organizationId,
      weekStart,
      user.id,
      {
        name: typeof name === 'string' ? name : undefined,
        displaySettings,
      }
    )

    if (autoFill) {
      await SchedulerService.autoFillShifts(
        schedule.id,
        user.organizationId,
        weekStart,
        undefined
      )
    }

    await setOnboardingStep(user.organizationId, 3)

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
    const list = searchParams.get('list') === 'true'
    const month = searchParams.get('month')

    if (list) {
      let schedules = await SchedulerService.listSchedules(user.organizationId)
      if (month) {
        const [y, m] = month.split('-').map(Number)
        const monthStart = new Date(y, m - 1, 1)
        const monthEnd = new Date(y, m, 0)
        schedules = schedules.filter((s) => {
          const ws = s.weekStartDate
          if (!ws) return false
          const weekStart = new Date(ws)
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekEnd.getDate() + 6)
          return weekStart <= monthEnd && weekEnd >= monthStart
        })
      }
      const withShifts = schedules.map((s) => ({
        ...s,
        scheduleShifts: s.slots.map((slot) => ({
          shift: {
            employeeId: slot.assignments[0]?.employeeId ?? null,
            startTime: slot.startTime,
            endTime: slot.endTime,
          },
        })),
      }))
      return NextResponse.json({ schedules: withShifts }, { status: 200 })
    }

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
