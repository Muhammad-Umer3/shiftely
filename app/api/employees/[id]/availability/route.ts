import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { availability } = body

    // Verify employee belongs to organization
    const employee = await prisma.employee.findFirst({
      where: {
        id: params.id,
        organizationId: user.organizationId,
      },
    })

    if (!employee) {
      return NextResponse.json({ message: 'Employee not found' }, { status: 404 })
    }

    // Update availability template
    await prisma.employee.update({
      where: { id: params.id },
      data: {
        availabilityTemplate: availability,
      },
    })

    return NextResponse.json({ message: 'Availability updated' }, { status: 200 })
  } catch (error) {
    console.error('Error updating availability:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
