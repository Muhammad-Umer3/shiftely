import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { organizationId, employeeIds, startTime, endTime, scheduleId } = body

    if (!organizationId || organizationId !== user.organizationId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const ids = Array.isArray(employeeIds) ? employeeIds : []
    if (ids.length === 0) {
      return NextResponse.json({ message: 'At least one employee is required' }, { status: 400 })
    }

    const schedule = await prisma.schedule.findFirst({
      where: { id: scheduleId, organizationId: user.organizationId },
    })
    if (!schedule) {
      return NextResponse.json({ message: 'Schedule not found' }, { status: 404 })
    }
    const displaySettings = schedule.displaySettings as { shiftDefaults?: { minPeople?: number; maxPeople?: number } } | null
    const shiftDef = displaySettings?.shiftDefaults
    const slotMinCount = shiftDef?.minPeople != null ? Math.max(1, shiftDef.minPeople) : undefined
    const slotMaxCount = shiftDef?.maxPeople != null ? Math.max(1, shiftDef.maxPeople) : undefined

    const validEmployees = await prisma.employee.findMany({
      where: { id: { in: ids }, organizationId: user.organizationId },
      select: { id: true },
    })
    const validIds = new Set(validEmployees.map((e) => e.id))
    const toCreate = ids.filter((id: string) => validIds.has(id))

    if (toCreate.length === 0) {
      return NextResponse.json({ message: 'No valid employees found' }, { status: 400 })
    }

    const start = new Date(startTime)
    const end = new Date(endTime)

    const created: { id: string; employeeId: string }[] = []
    const skipped: string[] = []

    for (const empId of toCreate) {
      const existingOverlap = await prisma.slotAssignment.findFirst({
        where: {
          employeeId: empId,
          slot: {
            scheduleId,
            startTime: { lt: end },
            endTime: { gt: start },
          },
        },
      })
      if (existingOverlap) {
        skipped.push(empId)
        continue
      }

      const slot = await prisma.slot.create({
        data: {
          organizationId,
          scheduleId,
          startTime: start,
          endTime: end,
          requiredCount: 1,
          minCount: slotMinCount,
          maxCount: slotMaxCount,
          createdById: user.id,
        },
      })

      await prisma.slotAssignment.create({
        data: {
          slotId: slot.id,
          employeeId: empId,
          slotIndex: 1,
        },
      })

      created.push({ id: slot.id, employeeId: empId })
    }

    const slots = await prisma.slot.findMany({
      where: { id: { in: created.map((c) => c.id) } },
      include: {
        assignments: {
          include: {
            employee: {
              include: { user: true },
            },
          },
        },
      },
    })

    const shifts = slots.map((slot) => {
      const firstAssignment = slot.assignments[0]
      return {
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        position: slot.position,
        employee: firstAssignment?.employee ?? null,
      }
    })

    return NextResponse.json({
      shifts,
      created: created.length,
      skipped: skipped.length,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating bulk slots:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
