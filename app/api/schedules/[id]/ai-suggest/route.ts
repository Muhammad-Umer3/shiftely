import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { AIService } from '@/server/services/ai/ai.service'
import { startOfWeek } from 'date-fns'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id: scheduleId } = await params
    const body = await req.json()
    const { prompt, constraints } = body

    const schedule = await prisma.schedule.findFirst({
      where: { id: scheduleId, organizationId: user.organizationId },
      include: {
        slots: {
          include: {
            assignments: {
              include: {
                employee: { include: { user: true } },
              },
            },
          },
        },
      },
    })

    if (!schedule) {
      return NextResponse.json({ message: 'Schedule not found' }, { status: 404 })
    }

    const weekStart = schedule.weekStartDate
      ? startOfWeek(new Date(schedule.weekStartDate), { weekStartsOn: 1 })
      : schedule.slots[0]
        ? startOfWeek(new Date(schedule.slots[0].startTime), { weekStartsOn: 1 })
        : startOfWeek(new Date(), { weekStartsOn: 1 })

    const { suggestions, summary } = await AIService.generateScheduleSuggestionsFromPrompt(
      user.organizationId,
      weekStart,
      typeof prompt === 'string' ? prompt : '',
      schedule,
      constraints
    )

    return NextResponse.json({ suggestions, summary }, { status: 200 })
  } catch (error) {
    console.error('AI suggest error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to generate suggestions' },
      { status: 500 }
    )
  }
}
