import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { organizationId, employeeId, startTime, endTime, position, scheduleId } = body

    if (organizationId !== user.organizationId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const shift = await prisma.shift.create({
      data: {
        organizationId,
        employeeId: employeeId || null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        position: position || null,
        createdById: user.id,
      },
    })

    if (scheduleId) {
      const schedule = await prisma.schedule.findFirst({
        where: { id: scheduleId, organizationId: user.organizationId },
      })
      if (schedule) {
        await prisma.scheduleShift.create({
          data: { scheduleId, shiftId: shift.id },
        })
      }
    }

    return NextResponse.json({ shift }, { status: 201 })
  } catch (error) {
    console.error('Error creating shift:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { shiftId, startTime, endTime, employeeId } = body

    // Verify shift belongs to organization
    const existingShift = await prisma.shift.findFirst({
      where: {
        id: shiftId,
        organizationId: user.organizationId,
      },
    })

    if (!existingShift) {
      return NextResponse.json({ message: 'Shift not found' }, { status: 404 })
    }

    const shift = await prisma.shift.update({
      where: { id: shiftId },
      data: {
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        employeeId: employeeId !== undefined ? employeeId : undefined,
      },
    })

    return NextResponse.json({ shift }, { status: 200 })
  } catch (error) {
    console.error('Error updating shift:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
