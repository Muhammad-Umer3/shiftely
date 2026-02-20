import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { addDays, format } from 'date-fns'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '14', 10)

    const employee = await prisma.employee.findFirst({
      where: { userId: user.id, organizationId: user.organizationId },
    })
    if (!employee) {
      return NextResponse.json({ shifts: [] }, { status: 200 })
    }

    const now = new Date()
    const endDate = addDays(now, Math.min(days, 60))

    const assignments = await prisma.slotAssignment.findMany({
      where: {
        employeeId: employee.id,
        slot: {
          startTime: { gte: now },
          endTime: { lte: endDate },
        },
      },
      include: {
        slot: {
          include: {
            schedule: { select: { id: true, name: true, weekStartDate: true } },
          },
        },
      },
      orderBy: { slot: { startTime: 'asc' } },
    })

    const shifts = assignments.map((a) => ({
      slotId: a.slotId,
      startTime: a.slot.startTime,
      endTime: a.slot.endTime,
      position: a.slot.position,
      scheduleName:
        a.slot.schedule.name ||
        (a.slot.schedule.weekStartDate
          ? `Week of ${format(new Date(a.slot.schedule.weekStartDate), 'MMM d, yyyy')}`
          : 'Schedule'),
    }))

    return NextResponse.json({ shifts }, { status: 200 })
  } catch (error) {
    console.error('Error fetching my shifts:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
