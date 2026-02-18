import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { AIService } from '@/server/services/ai/ai.service'

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { shiftStartTime, shiftEndTime, position } = body

    const recommendation = await AIService.recommendEmployeeForShift(
      user.organizationId,
      new Date(shiftStartTime),
      new Date(shiftEndTime),
      position
    )

    return NextResponse.json({ recommendation }, { status: 200 })
  } catch (error) {
    console.error('Error getting AI recommendation:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
