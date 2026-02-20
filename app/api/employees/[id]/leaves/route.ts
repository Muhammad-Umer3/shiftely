import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'

const LEAVE_TYPES = ['vacation', 'sick', 'personal', 'unpaid', 'other'] as const

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

    const where: Record<string, unknown> = { employeeId: id }
    if (startDate && endDate) {
      Object.assign(where, {
        startDate: { lte: new Date(endDate) },
        endDate: { gte: new Date(startDate) },
      })
    }

    const leaves = await prisma.employeeLeave.findMany({
      where,
      orderBy: { startDate: 'asc' },
    })

    return NextResponse.json({ leaves }, { status: 200 })
  } catch (error) {
    console.error('Error fetching leaves:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const body = await req.json()
    const { startDate, endDate, type, notes } = body

    if (!startDate || !endDate || !type) {
      return NextResponse.json(
        { message: 'startDate, endDate, and type are required' },
        { status: 400 }
      )
    }

    if (!LEAVE_TYPES.includes(type)) {
      return NextResponse.json(
        { message: `type must be one of: ${LEAVE_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    if (end < start) {
      return NextResponse.json(
        { message: 'endDate must be after startDate' },
        { status: 400 }
      )
    }

    const employee = await prisma.employee.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
    })

    if (!employee) {
      return NextResponse.json({ message: 'Employee not found' }, { status: 404 })
    }

    const leave = await prisma.employeeLeave.create({
      data: {
        employeeId: id,
        organizationId: user.organizationId,
        startDate: start,
        endDate: end,
        type,
        notes: notes || null,
      },
    })

    return NextResponse.json({ leave }, { status: 201 })
  } catch (error) {
    console.error('Error creating leave:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
