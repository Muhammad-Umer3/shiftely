import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { SchedulerService } from '@/server/services/scheduler/scheduler.service'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    const schedule = await SchedulerService.publishSchedule(params.id, user.organizationId)

    return NextResponse.json({ schedule }, { status: 200 })
  } catch (error) {
    console.error('Error publishing schedule:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
