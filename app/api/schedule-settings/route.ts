import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'

export type ScheduleSettings = {
  startHour: number
  endHour: number
  workingDays: number[] // 0=Sun, 1=Mon, ..., 6=Sat
}

const DEFAULT_SETTINGS: ScheduleSettings = {
  startHour: 6,
  endHour: 22,
  workingDays: [1, 2, 3, 4, 5], // Mon-Fri
}

export async function GET() {
  try {
    const user = await requireAuth()
    const org = await prisma.organization.findUnique({
      where: { id: user.organizationId },
    })
    const settings = (org?.settings as Record<string, unknown>) ?? {}
    const scheduleSettings = (settings.scheduleSettings as Partial<ScheduleSettings>) ?? {}
    const merged: ScheduleSettings = {
      startHour: scheduleSettings.startHour ?? DEFAULT_SETTINGS.startHour,
      endHour: scheduleSettings.endHour ?? DEFAULT_SETTINGS.endHour,
      workingDays: Array.isArray(scheduleSettings.workingDays)
        ? scheduleSettings.workingDays
        : DEFAULT_SETTINGS.workingDays,
    }
    return NextResponse.json({ settings: merged }, { status: 200 })
  } catch (error) {
    console.error('Error fetching schedule settings:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { startHour, endHour, workingDays } = body

    const org = await prisma.organization.findUnique({
      where: { id: user.organizationId },
    })
    if (!org) {
      return NextResponse.json({ message: 'Organization not found' }, { status: 404 })
    }

    const settings = (org.settings as Record<string, unknown>) ?? {}
    const current = (settings.scheduleSettings as Partial<ScheduleSettings>) ?? {}

    const scheduleSettings: ScheduleSettings = {
      startHour: typeof startHour === 'number' ? startHour : (current.startHour ?? DEFAULT_SETTINGS.startHour),
      endHour: typeof endHour === 'number' ? endHour : (current.endHour ?? DEFAULT_SETTINGS.endHour),
      workingDays: Array.isArray(workingDays) ? workingDays : (current.workingDays ?? DEFAULT_SETTINGS.workingDays),
    }

    if (scheduleSettings.startHour < 0 || scheduleSettings.startHour > 23) {
      return NextResponse.json({ message: 'Start hour must be 0-23' }, { status: 400 })
    }
    if (scheduleSettings.endHour < 0 || scheduleSettings.endHour > 23) {
      return NextResponse.json({ message: 'End hour must be 0-23' }, { status: 400 })
    }
    if (scheduleSettings.startHour >= scheduleSettings.endHour) {
      return NextResponse.json({ message: 'Start hour must be before end hour' }, { status: 400 })
    }

    await prisma.organization.update({
      where: { id: user.organizationId },
      data: {
        settings: {
          ...settings,
          scheduleSettings,
        },
      },
    })

    return NextResponse.json({ settings: scheduleSettings }, { status: 200 })
  } catch (error) {
    console.error('Error updating schedule settings:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
