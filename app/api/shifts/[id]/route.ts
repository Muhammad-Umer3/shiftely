import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    // Verify shift belongs to organization
    const shift = await prisma.shift.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
    })

    if (!shift) {
      return NextResponse.json({ message: 'Shift not found' }, { status: 404 })
    }

    await prisma.shift.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Shift deleted' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting shift:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
