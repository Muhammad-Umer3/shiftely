import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { startOfDay, endOfDay } from 'date-fns'

/**
 * GET /api/me/day-roster?date=YYYY-MM-DD
 * Returns slots overlapping the given date (default today) for the user's org, with assignments.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    const dateParam = searchParams.get('date')
    const date = dateParam
      ? (() => {
          const d = new Date(dateParam + 'T12:00:00')
          return Number.isNaN(d.getTime()) ? new Date() : d
        })()
      : new Date()

    const dayStart = startOfDay(date)
    const dayEnd = endOfDay(date)

    const slots = await prisma.slot.findMany({
      where: {
        organizationId: user.organizationId,
        startTime: { lt: dayEnd },
        endTime: { gt: dayStart },
      },
      include: {
        assignments: {
          include: {
            employee: {
              include: { user: { select: { id: true, name: true, email: true } } },
            },
          },
        },
      },
      orderBy: { startTime: 'asc' },
    })

    const roster = slots.map((slot) => ({
      id: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      position: slot.position,
      assignees: slot.assignments
        .filter((a) => a.employee?.user)
        .map((a) => ({
          name: a.employee!.user!.name || a.employee!.user!.email,
          email: a.employee!.user!.email,
        })),
    }))

    return NextResponse.json({ date: date.toISOString().slice(0, 10), roster }, { status: 200 })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching day roster:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
