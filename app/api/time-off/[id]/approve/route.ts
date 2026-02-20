import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    if (user.role !== 'MANAGER' && user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Only managers can approve time-off requests' }, { status: 403 })
    }

    const timeOff = await prisma.timeOffRequest.findFirst({
      where: { id, organizationId: user.organizationId },
      include: { employee: true },
    })

    if (!timeOff) {
      return NextResponse.json({ message: 'Request not found' }, { status: 404 })
    }

    if (timeOff.status !== 'PENDING') {
      return NextResponse.json({ message: 'Request already processed' }, { status: 400 })
    }

    await prisma.$transaction([
      prisma.timeOffRequest.update({
        where: { id },
        data: { status: 'APPROVED', approverId: user.id, respondedAt: new Date() },
      }),
      prisma.employeeLeave.create({
        data: {
          employeeId: timeOff.employeeId,
          organizationId: timeOff.organizationId,
          startDate: timeOff.startDate,
          endDate: timeOff.endDate,
          type: timeOff.type,
          notes: timeOff.notes,
        },
      }),
    ])

    return NextResponse.json({ message: 'Approved' }, { status: 200 })
  } catch (error) {
    console.error('Approve time-off error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to approve' },
      { status: 500 }
    )
  }
}
