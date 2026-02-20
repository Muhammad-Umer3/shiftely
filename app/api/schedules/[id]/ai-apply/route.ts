import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { setOnboardingStep } from '@/lib/onboarding'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id: scheduleId } = await params
    const body = await req.json()
    const { suggestions } = body

    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      return NextResponse.json({ message: 'No suggestions to apply' }, { status: 400 })
    }

    const schedule = await prisma.schedule.findFirst({
      where: { id: scheduleId, organizationId: user.organizationId },
    })

    if (!schedule) {
      return NextResponse.json({ message: 'Schedule not found' }, { status: 404 })
    }

    const creator = await prisma.user.findFirst({
      where: { organizationId: user.organizationId },
    })
    if (!creator) {
      return NextResponse.json({ message: 'No creator found' }, { status: 500 })
    }

    let applied = 0
    for (const s of suggestions) {
      const employeeId = s.employeeId
      const startTime = s.startTime ? new Date(s.startTime) : null
      const endTime = s.endTime ? new Date(s.endTime) : null
      if (!employeeId || !startTime || !endTime) continue

      const slot = await prisma.slot.create({
        data: {
          organizationId: user.organizationId,
          scheduleId,
          startTime,
          endTime,
          position: s.position || null,
          requiredCount: 1,
          createdById: creator.id,
        },
      })
      await prisma.slotAssignment.create({
        data: {
          slotId: slot.id,
          employeeId,
          slotIndex: 1,
        },
      })
      applied++
    }

    await setOnboardingStep(user.organizationId, 4)

    return NextResponse.json({ applied }, { status: 200 })
  } catch (error) {
    console.error('AI apply error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to apply suggestions' },
      { status: 500 }
    )
  }
}
