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

    const group = await prisma.employeeGroup.findFirst({
      where: { id, organizationId: user.organizationId },
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

    if (!group) {
      return NextResponse.json({ message: 'Group not found' }, { status: 404 })
    }

    return NextResponse.json({ group }, { status: 200 })
  } catch (error) {
    console.error('Error fetching group:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const body = await req.json()
    const { name, employeeIds } = body

    const existing = await prisma.employeeGroup.findFirst({
      where: { id, organizationId: user.organizationId },
    })

    if (!existing) {
      return NextResponse.json({ message: 'Group not found' }, { status: 404 })
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

    await prisma.employeeGroupMember.deleteMany({
      where: { groupId: id },
    })

    const group = await prisma.employeeGroup.update({
      where: { id },
      data: {
        ...(name?.trim() && { name: name.trim() }),
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

    return NextResponse.json({ group }, { status: 200 })
  } catch (error) {
    console.error('Error updating group:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    const existing = await prisma.employeeGroup.findFirst({
      where: { id, organizationId: user.organizationId },
    })

    if (!existing) {
      return NextResponse.json({ message: 'Group not found' }, { status: 404 })
    }

    await prisma.employeeGroup.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Group deleted' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting group:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
