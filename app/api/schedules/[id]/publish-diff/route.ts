import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { format } from 'date-fns'

type SlotSnapshot = {
  assignments: { employeeId: string | null }[]
  startTime: string
  endTime: string
  position: string | null
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    const schedule = await prisma.schedule.findFirst({
      where: { id, organizationId: user.organizationId },
      include: {
        slots: {
          include: {
            assignments: {
              include: {
                employee: { include: { user: true } },
              },
            },
          },
        },
      },
    })

    if (!schedule) {
      return NextResponse.json({ message: 'Schedule not found' }, { status: 404 })
    }

    if (schedule.status !== 'DRAFT') {
      return NextResponse.json(
        { message: 'Schedule is not in draft status' },
        { status: 400 }
      )
    }

    const lastVersion = await prisma.scheduleVersion.findFirst({
      where: { scheduleId: id },
      orderBy: { version: 'desc' },
    })

    const previousSnapshot = (lastVersion?.slotSnapshot as Record<string, SlotSnapshot>) ?? {}
    const employeeCache = new Map<string, string>()

    const getEmployeeName = async (employeeId: string | null) => {
      if (!employeeId) return '— Unassigned —'
      if (employeeCache.has(employeeId)) return employeeCache.get(employeeId)!
      const emp = await prisma.employee.findUnique({
        where: { id: employeeId },
        include: { user: true },
      })
      const name = emp?.user?.name || emp?.user?.email || 'Unknown'
      employeeCache.set(employeeId, name)
      return name
    }

    const currentShifts: Array<{
      shiftId: string
      employeeId: string | null
      employeeName: string
      startTime: string
      endTime: string
      position: string | null
      dateStr: string
      timeStr: string
    }> = []

    schedule.slots.forEach((slot) => {
      const firstAssignment = slot.assignments[0]
      currentShifts.push({
        shiftId: slot.id,
        employeeId: firstAssignment?.employeeId ?? null,
        employeeName: firstAssignment?.employee?.user?.name || firstAssignment?.employee?.user?.email || '— Unassigned —',
        startTime: slot.startTime.toISOString(),
        endTime: slot.endTime.toISOString(),
        position: slot.position,
        dateStr: format(slot.startTime, 'yyyy-MM-dd'),
        timeStr: `${format(slot.startTime, 'HH:mm')} – ${format(slot.endTime, 'HH:mm')}`,
      })
    })

    const prevShiftIds = new Set(Object.keys(previousSnapshot))
    const currShiftIds = new Set(currentShifts.map((s) => s.shiftId))

    const added: typeof currentShifts = []
    const removed: Array<{
      shiftId: string
      employeeName: string
      dateStr: string
      timeStr: string
      position: string | null
    }> = []
    const changed: Array<{
      shiftId: string
      dateStr: string
      before: { employeeName: string; timeStr: string; position: string | null }
      after: { employeeName: string; timeStr: string; position: string | null }
    }> = []

    for (const s of currentShifts) {
      if (!prevShiftIds.has(s.shiftId)) {
        added.push(s)
      } else {
        const prev = previousSnapshot[s.shiftId]
        const prevEmployeeId = prev.assignments[0]?.employeeId ?? null
        const prevEmpName = await getEmployeeName(prevEmployeeId)
        const prevStart = new Date(prev.startTime)
        const prevEnd = new Date(prev.endTime)
        const prevTimeStr = `${format(prevStart, 'HH:mm')} – ${format(prevEnd, 'HH:mm')}`

        const empChanged = prevEmployeeId !== s.employeeId
        const timeChanged = prev.startTime !== s.startTime || prev.endTime !== s.endTime
        const posChanged = (prev.position || '') !== (s.position || '')

        if (empChanged || timeChanged || posChanged) {
          changed.push({
            shiftId: s.shiftId,
            dateStr: s.dateStr,
            before: {
              employeeName: prevEmpName,
              timeStr: prevTimeStr,
              position: prev.position,
            },
            after: {
              employeeName: s.employeeName,
              timeStr: s.timeStr,
              position: s.position,
            },
          })
        }
      }
    }

    for (const shiftId of prevShiftIds) {
      if (!currShiftIds.has(shiftId)) {
        const prev = previousSnapshot[shiftId]
        const prevEmployeeId = prev.assignments[0]?.employeeId ?? null
        const empName = await getEmployeeName(prevEmployeeId)
        const start = new Date(prev.startTime)
        const end = new Date(prev.endTime)
        removed.push({
          shiftId,
          employeeName: empName,
          dateStr: format(start, 'yyyy-MM-dd'),
          timeStr: `${format(start, 'HH:mm')} – ${format(end, 'HH:mm')}`,
          position: prev.position,
        })
      }
    }

    const isFirstPublish = !lastVersion

    return NextResponse.json({
      isFirstPublish,
      lastVersion: lastVersion?.version ?? null,
      added,
      removed,
      changed,
      summary: {
        addedCount: added.length,
        removedCount: removed.length,
        changedCount: changed.length,
      },
    })
  } catch (error) {
    console.error('Error computing publish diff:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
