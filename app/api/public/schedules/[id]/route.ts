import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: scheduleId } = await params
    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get('employee') ?? undefined

    const schedule = await prisma.schedule.findFirst({
      where: {
        id: scheduleId,
        status: 'PUBLISHED',
      },
      include: {
        slots: {
          include: {
            assignments: {
              include: {
                employee: {
                  include: { user: true },
                },
              },
            },
          },
        },
      },
    })

    if (!schedule) {
      return NextResponse.json({ message: 'Schedule not found' }, { status: 404 })
    }

    const organizationId = schedule.organizationId

    let slots = schedule.slots
    let employees: { id: string; user: { name: string | null; email: string } }[]

    if (employeeId) {
      const employee = await prisma.employee.findFirst({
        where: { id: employeeId, organizationId },
        include: { user: true },
      })
      if (!employee) {
        return NextResponse.json(
          { message: 'Employee not found' },
          { status: 404 }
        )
      }
      slots = schedule.slots.filter((slot) =>
        slot.assignments.some((a) => a.employeeId === employeeId)
      )
      employees = [
        {
          id: employee.id,
          user: {
            name: employee.user.name,
            email: employee.user.email,
          },
        },
      ]
    } else {
      const allEmployees = await prisma.employee.findMany({
        where: { organizationId },
        include: { user: true },
      })
      employees = allEmployees.map((e) => ({
        id: e.id,
        user: { name: e.user.name, email: e.user.email },
      }))
    }

    const scheduleWithShifts = {
      id: schedule.id,
      name: schedule.name,
      weekStartDate: schedule.weekStartDate,
      scheduleShifts: slots.map((slot) => ({
        shift: {
          id: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          position: slot.position,
          employee: slot.assignments[0]?.employee
            ? {
                id: slot.assignments[0].employee.id,
                user: {
                  name: slot.assignments[0].employee.user.name,
                  email: slot.assignments[0].employee.user.email,
                },
              }
            : null,
        },
      })),
    }

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    })
    const orgSettings = (org?.settings as Record<string, unknown>) ?? {}
    const orgScheduleSettings = (orgSettings.scheduleSettings as
      | { workingDays?: number[] }
      | undefined) ?? {}
    const scheduleDisplay = (schedule.displaySettings as
      | { workingDays?: number[] }
      | null) ?? null
    const workingDays = Array.isArray(scheduleDisplay?.workingDays)
      ? scheduleDisplay.workingDays
      : Array.isArray(orgScheduleSettings.workingDays)
        ? orgScheduleSettings.workingDays
        : [1, 2, 3, 4, 5]

    const weekStart = schedule.weekStartDate
      ? new Date(schedule.weekStartDate)
      : null
    if (!weekStart) {
      return NextResponse.json(
        { message: 'Schedule has no week start' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      schedule: scheduleWithShifts,
      employees,
      weekStart: weekStart.toISOString(),
      workingDays,
      organizationId,
    })
  } catch (error) {
    console.error('Error fetching public schedule:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
