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

    const slot = await prisma.slot.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
    })

    if (!slot) {
      return NextResponse.json({ message: 'Slot not found' }, { status: 404 })
    }

    await prisma.slot.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Slot deleted' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting slot:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
