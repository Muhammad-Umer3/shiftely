import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { SchedulerService } from '@/server/services/scheduler/scheduler.service'
import { AIService } from '@/server/services/ai/ai.service'
import { SubscriptionService } from '@/server/services/subscription/subscription.service'
import { setOnboardingStep } from '@/lib/onboarding'
import { startOfWeek } from 'date-fns'

const DEFAULT_DISPLAY = { startHour: 6, endHour: 22, workingDays: [1, 2, 3, 4, 5] }

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { weekStartDate, name } = body

    const weekStart = weekStartDate ? new Date(weekStartDate) : startOfWeek(new Date(), { weekStartsOn: 1 })

    const existing = await SchedulerService.getScheduleForWeek(user.organizationId, weekStart)
    if (existing) {
      return NextResponse.json(
        { message: 'A schedule already exists for this week. Edit it or choose a different week.', existing: true },
        { status: 409 }
      )
    }

    const limitCheck = await SubscriptionService.canAddSchedule(user.organizationId)
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { message: limitCheck.reason, upgradeRequired: limitCheck.upgradeRequired },
        { status: 403 }
      )
    }

    const { suggestions } = await AIService.generateScheduleSuggestions(
      user.organizationId,
      weekStart
    )

    if (suggestions.length === 0) {
      return NextResponse.json(
        { message: 'No suggestions generated. Add employees and set their availability first.' },
        { status: 400 }
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
        name: typeof name === 'string' && name.trim() ? name.trim() : undefined,
        displaySettings,
      }
    )

    const creator = await prisma.user.findFirst({ where: { organizationId: user.organizationId } })
    if (!creator) {
      throw new Error('No users found in organization')
    }

    const scheduleDisplayOpts = schedule.displaySettings as { shiftDefaults?: { minPeople?: number; maxPeople?: number } } | null
    const shiftDef = scheduleDisplayOpts?.shiftDefaults
    const slotMinCount = shiftDef?.minPeople != null ? Math.max(1, shiftDef.minPeople) : undefined
    const slotMaxCount = shiftDef?.maxPeople != null ? Math.max(1, shiftDef.maxPeople) : undefined

    for (const s of suggestions) {
      const slot = await prisma.slot.create({
        data: {
          organizationId: user.organizationId,
          scheduleId: schedule.id,
          startTime: s.startTime,
          endTime: s.endTime,
          position: s.position,
          requiredCount: 1,
          minCount: slotMinCount,
          maxCount: slotMaxCount,
          createdById: creator.id,
        },
      })
      await prisma.slotAssignment.create({
        data: {
          slotId: slot.id,
          employeeId: s.employeeId,
          slotIndex: 1,
        },
      })
    }

    await setOnboardingStep(user.organizationId, 4)

    const scheduleWithSlots = await SchedulerService.getScheduleForWeek(user.organizationId, weekStart)
    return NextResponse.json({ schedule: scheduleWithSlots }, { status: 201 })
  } catch (error) {
    console.error('Error generating AI schedule:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to generate schedule' },
      { status: 500 }
    )
  }
}
