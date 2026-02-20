import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { SchedulerService } from '@/server/services/scheduler/scheduler.service'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const body = await req.json()
    const { name, displaySettings } = body

    const updateData: { name?: string; displaySettings?: { startHour: number; endHour: number; workingDays: number[]; displayGroupIds?: string[] } | null } = {}
    if (typeof name === 'string') updateData.name = name
    if (displaySettings !== undefined) {
      if (displaySettings === null) {
        updateData.displaySettings = null
      } else if (
        typeof displaySettings?.startHour === 'number' &&
        typeof displaySettings?.endHour === 'number' &&
        Array.isArray(displaySettings?.workingDays)
      ) {
        updateData.displaySettings = {
          startHour: displaySettings.startHour,
          endHour: displaySettings.endHour,
          workingDays: displaySettings.workingDays,
          displayGroupIds: Array.isArray(displaySettings?.displayGroupIds) ? displaySettings.displayGroupIds : [],
        }
      }
    }

    const schedule = await SchedulerService.updateSchedule(id, user.organizationId, updateData)

    return NextResponse.json({ schedule }, { status: 200 })
  } catch (error) {
    console.error('Error updating schedule:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
