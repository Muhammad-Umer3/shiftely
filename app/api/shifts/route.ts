import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { organizationId, employeeId, startTime, endTime, position, scheduleId, requiredCount = 1 } = body

    if (!organizationId || organizationId !== user.organizationId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    if (!scheduleId) {
      return NextResponse.json({ message: 'scheduleId is required' }, { status: 400 })
    }

    const schedule = await prisma.schedule.findFirst({
      where: { id: scheduleId, organizationId: user.organizationId },
    })
    if (!schedule) {
      return NextResponse.json({ message: 'Schedule not found' }, { status: 404 })
    }
    const displaySettings = schedule.displaySettings as { shiftDefaults?: { minPeople?: number; maxPeople?: number } } | null
    const shiftDef = displaySettings?.shiftDefaults
    const maxCount = shiftDef?.maxPeople != null ? Math.max(1, shiftDef.maxPeople) : Math.max(1, requiredCount)
    const minCount = shiftDef?.minPeople != null ? Math.max(1, Math.min(shiftDef.minPeople, maxCount)) : undefined
    const slotMaxCount = shiftDef?.maxPeople != null ? maxCount : undefined
    const slotMinCount = shiftDef?.minPeople != null ? minCount : undefined

    if (employeeId) {
      const emp = await prisma.employee.findFirst({
        where: { id: employeeId, organizationId: user.organizationId },
      })
      if (!emp) {
        return NextResponse.json({ message: 'Employee not found' }, { status: 404 })
      }
    }

    // Check for overlapping assignment
    if (employeeId) {
      const start = new Date(startTime)
      const end = new Date(endTime)
      const existingOverlap = await prisma.slotAssignment.findFirst({
        where: {
          employeeId,
          slot: {
            scheduleId,
            startTime: { lt: end },
            endTime: { gt: start },
          },
        },
      })
      if (existingOverlap) {
        return NextResponse.json(
          { message: 'This employee is already assigned to an overlapping slot' },
          { status: 409 }
        )
      }
    }

    const slot = await prisma.slot.create({
      data: {
        organizationId,
        scheduleId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        position: position || null,
        requiredCount: Math.max(1, requiredCount),
        minCount: slotMinCount,
        maxCount: slotMaxCount,
        createdById: user.id,
      },
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

    if (employeeId) {
      await prisma.slotAssignment.create({
        data: {
          slotId: slot.id,
          employeeId,
          slotIndex: 1,
        },
      })
    }

    const slotWithAssignments = await prisma.slot.findUnique({
      where: { id: slot.id },
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

    // Return shift-like shape for backward compatibility
    const firstAssignment = slotWithAssignments?.assignments[0]
    const shift = {
      id: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      position: slot.position,
      employee: firstAssignment?.employee ?? null,
    }

    return NextResponse.json({ shift }, { status: 201 })
  } catch (error) {
    console.error('Error creating slot:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { shiftId, startTime, endTime, employeeId } = body

    const existingSlot = await prisma.slot.findFirst({
      where: {
        id: shiftId,
        organizationId: user.organizationId,
      },
      include: {
        assignments: true,
      },
    })

    if (!existingSlot) {
      return NextResponse.json({ message: 'Slot not found' }, { status: 404 })
    }

    const newStart = startTime ? new Date(startTime) : existingSlot.startTime
    const newEnd = endTime ? new Date(endTime) : existingSlot.endTime

    let employeeIdToCheck = employeeId
    if (employeeIdToCheck === undefined) {
      const firstAssignment = existingSlot.assignments.find((a) => a.employeeId)
      employeeIdToCheck = firstAssignment?.employeeId ?? undefined
    }

    if (employeeIdToCheck) {
      const existingOverlap = await prisma.slotAssignment.findFirst({
        where: {
          employeeId: employeeIdToCheck,
          slotId: { not: shiftId },
          slot: {
            scheduleId: existingSlot.scheduleId,
            startTime: { lt: newEnd },
            endTime: { gt: newStart },
          },
        },
      })
      if (existingOverlap) {
        return NextResponse.json(
          { message: 'This employee is already assigned to an overlapping slot' },
          { status: 409 }
        )
      }
    }

    await prisma.slot.update({
      where: { id: shiftId },
      data: {
        startTime: newStart,
        endTime: newEnd,
      },
    })

    if (employeeId !== undefined) {
      const firstAssignment = existingSlot.assignments[0]
      if (firstAssignment) {
        await prisma.slotAssignment.update({
          where: { id: firstAssignment.id },
          data: { employeeId: employeeId || null },
        })
      } else if (employeeId) {
        await prisma.slotAssignment.create({
          data: {
            slotId: shiftId,
            employeeId,
            slotIndex: 1,
          },
        })
      }
    }

    const updatedSlot = await prisma.slot.findUnique({
      where: { id: shiftId },
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

    const firstAssignment = updatedSlot?.assignments[0]
    const shift = {
      id: updatedSlot!.id,
      startTime: updatedSlot!.startTime,
      endTime: updatedSlot!.endTime,
      position: updatedSlot!.position,
      employee: firstAssignment?.employee ?? null,
    }

    return NextResponse.json({ shift }, { status: 200 })
  } catch (error) {
    console.error('Error updating slot:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
