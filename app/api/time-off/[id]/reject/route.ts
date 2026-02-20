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
      return NextResponse.json({ message: 'Only managers can reject time-off requests' }, { status: 403 })
    }

    const timeOff = await prisma.timeOffRequest.findFirst({
      where: { id, organizationId: user.organizationId },
    })

    if (!timeOff) {
      return NextResponse.json({ message: 'Request not found' }, { status: 404 })
    }

    if (timeOff.status !== 'PENDING') {
      return NextResponse.json({ message: 'Request already processed' }, { status: 400 })
    }

    await prisma.timeOffRequest.update({
      where: { id },
      data: { status: 'REJECTED', approverId: user.id, respondedAt: new Date() },
    })

    return NextResponse.json({ message: 'Rejected' }, { status: 200 })
  } catch (error) {
    console.error('Reject time-off error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to reject' },
      { status: 500 }
    )
  }
}
