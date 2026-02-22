import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'

/**
 * GET /api/me/availability
 * Returns the current user's employee availability template.
 */
export async function GET() {
  try {
    const user = await requireAuth()
    const employee = await prisma.employee.findFirst({
      where: { userId: user.id, organizationId: user.organizationId },
      select: { availabilityTemplate: true },
    })
    if (!employee) {
      return NextResponse.json({ message: 'Employee record not found' }, { status: 404 })
    }
    return NextResponse.json({
      availability: (employee.availabilityTemplate as Record<string, string[]>) ?? {},
    })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching my availability:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/me/availability
 * Updates the current user's employee availability template (self-service only).
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { availability } = body

    const employee = await prisma.employee.findFirst({
      where: { userId: user.id, organizationId: user.organizationId },
    })
    if (!employee) {
      return NextResponse.json({ message: 'Employee record not found' }, { status: 404 })
    }

    if (typeof availability !== 'object' || availability === null || Array.isArray(availability)) {
      return NextResponse.json(
        { message: 'availability must be an object (e.g. { "Monday": ["9:00 AM"] })' },
        { status: 400 }
      )
    }

    await prisma.employee.update({
      where: { id: employee.id },
      data: { availabilityTemplate: availability },
    })

    return NextResponse.json({ message: 'Availability updated' }, { status: 200 })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error updating my availability:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
