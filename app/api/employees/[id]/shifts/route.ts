import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const employee = await prisma.employee.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
    })

    if (!employee) {
      return NextResponse.json({ message: 'Employee not found' }, { status: 404 })
    }

    const where: { employeeId: string; slot?: { startTime: { lt: Date }; endTime: { gt: Date } } } = {
      employeeId: id,
    }
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      where.slot = { startTime: { lt: end }, endTime: { gt: start } }
    }

    const assignments = await prisma.slotAssignment.findMany({
      where,
      include: { slot: true },
      orderBy: { slot: { startTime: 'asc' } },
    })

    const shifts = assignments.map((a) => ({
      id: a.slotId,
      startTime: a.slot.startTime,
      endTime: a.slot.endTime,
      position: a.slot.position,
      employeeId: a.employeeId,
    }))

    return NextResponse.json({ shifts }, { status: 200 })
  } catch (error) {
    console.error('Error fetching employee shifts:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
