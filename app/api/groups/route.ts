import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const user = await requireAuth()
    const groups = await prisma.employeeGroup.findMany({
      where: { organizationId: user.organizationId },
      include: {
        members: {
          include: {
            employee: {
              include: { user: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ groups }, { status: 200 })
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { name, employeeIds } = body

    if (!name?.trim()) {
      return NextResponse.json({ message: 'Group name is required' }, { status: 400 })
    }

    const memberIds = Array.isArray(employeeIds) ? employeeIds : []

    if (memberIds.length > 0) {
      const validEmployees = await prisma.employee.findMany({
        where: { id: { in: memberIds }, organizationId: user.organizationId },
        select: { id: true },
      })
      const validIds = new Set(validEmployees.map((e) => e.id))
      if (memberIds.some((id: string) => !validIds.has(id))) {
        return NextResponse.json({ message: 'One or more employees not found' }, { status: 400 })
      }
    }

    const group = await prisma.employeeGroup.create({
      data: {
        name: name.trim(),
        organizationId: user.organizationId,
        members: {
          create: memberIds.map((employeeId: string) => ({ employeeId })),
        },
      },
      include: {
        members: {
          include: {
            employee: {
              include: { user: true },
            },
          },
        },
      },
    })

    return NextResponse.json({ group }, { status: 201 })
  } catch (error) {
    console.error('Error creating group:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
