import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { startDate, endDate, type, notes } = body

    const employee = await prisma.employee.findFirst({
      where: { userId: user.id, organizationId: user.organizationId },
    })
    if (!employee) {
      return NextResponse.json({ message: 'Employee record not found' }, { status: 404 })
    }

    if (!startDate || !endDate || !type) {
      return NextResponse.json(
        { message: 'startDate, endDate, and type are required' },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    if (end < start) {
      return NextResponse.json(
        { message: 'End date must be on or after start date' },
        { status: 400 }
      )
    }

    const validTypes = ['vacation', 'sick', 'personal', 'unpaid', 'other']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ message: 'Invalid type' }, { status: 400 })
    }

    const request = await prisma.timeOffRequest.create({
      data: {
        employeeId: employee.id,
        organizationId: user.organizationId,
        startDate: start,
        endDate: end,
        type,
        notes: notes || null,
        status: 'PENDING',
      },
      include: {
        employee: { include: { user: true } },
      },
    })

    return NextResponse.json({ request }, { status: 201 })
  } catch (error) {
    console.error('Time-off request error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to create request' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    const scope = searchParams.get('scope') // 'mine' | 'pending' | 'all'

    const employee = await prisma.employee.findFirst({
      where: { userId: user.id, organizationId: user.organizationId },
    })

    if (scope === 'mine' && employee) {
      const requests = await prisma.timeOffRequest.findMany({
        where: { employeeId: employee.id },
        include: { approver: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json({ requests }, { status: 200 })
    }

    if (scope === 'pending' || scope === 'all' || !scope) {
      const isManager = user.role === 'MANAGER' || user.role === 'ADMIN'
      const where = isManager
        ? { organizationId: user.organizationId, ...(scope === 'pending' && { status: 'PENDING' }) }
        : employee
          ? { employeeId: employee.id, ...(scope === 'pending' && { status: 'PENDING' }) }
          : { employeeId: 'none' }

      const requests = await prisma.timeOffRequest.findMany({
        where,
        include: {
          employee: { include: { user: true } },
          approver: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json({ requests }, { status: 200 })
    }

    return NextResponse.json({ requests: [] }, { status: 200 })
  } catch (error) {
    console.error('Time-off list error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to fetch requests' },
      { status: 500 }
    )
  }
}
