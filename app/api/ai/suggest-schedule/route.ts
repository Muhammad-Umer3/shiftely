import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { AIService } from '@/server/services/ai/ai.service'
import { startOfWeek } from 'date-fns'

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { weekStartDate, constraints } = body

    const weekStart = weekStartDate
      ? new Date(weekStartDate)
      : startOfWeek(new Date(), { weekStartsOn: 1 })

    const suggestions = await AIService.generateScheduleSuggestions(
      user.organizationId,
      weekStart,
      constraints
    )

    return NextResponse.json({ suggestions }, { status: 200 })
  } catch (error) {
    console.error('Error generating AI suggestions:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
