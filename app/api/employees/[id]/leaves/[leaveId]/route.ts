import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; leaveId: string }> }
) {
  try {
    const user = await requireAuth()
    const { id, leaveId } = await params

    const leave = await prisma.employeeLeave.findFirst({
      where: {
        id: leaveId,
        employeeId: id,
        organizationId: user.organizationId,
      },
    })

    if (!leave) {
      return NextResponse.json({ message: 'Leave not found' }, { status: 404 })
    }

    await prisma.employeeLeave.delete({
      where: { id: leaveId },
    })

    return NextResponse.json({ message: 'Leave deleted' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting leave:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
