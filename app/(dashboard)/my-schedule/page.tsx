import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { SchedulerService } from '@/server/services/scheduler/scheduler.service'
import { startOfWeek, addDays, format } from 'date-fns'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DayRosterCard } from '@/components/schedule/day-roster-card'
import { Calendar, ChevronRight } from 'lucide-react'

export default async function MySchedulePage() {
  const user = await requireAuth()

  const employee = await prisma.employee.findFirst({
    where: { userId: user.id, organizationId: user.organizationId },
  })

  const now = new Date()
  const endDate = addDays(now, 60)
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const currentWeekSchedule = await SchedulerService.getScheduleForWeek(user.organizationId, weekStart)

  let shifts: Array<{
    slotId: string
    startTime: Date
    endTime: Date
    position: string | null
    scheduleName: string
  }> = []

  if (employee) {
    const assignments = await prisma.slotAssignment.findMany({
      where: {
        employeeId: employee.id,
        slot: {
          startTime: { gte: now },
          endTime: { lte: endDate },
        },
      },
      include: {
        slot: {
          include: {
            schedule: { select: { id: true, name: true, weekStartDate: true } },
          },
        },
      },
      orderBy: { slot: { startTime: 'asc' } },
    })
    shifts = assignments.map((a) => ({
      slotId: a.slotId,
      startTime: a.slot.startTime,
      endTime: a.slot.endTime,
      position: a.slot.position,
      scheduleName:
        a.slot.schedule.name ||
        (a.slot.schedule.weekStartDate
          ? `Week of ${format(new Date(a.slot.schedule.weekStartDate), 'MMM d, yyyy')}`
          : 'Schedule'),
    }))
  }

  return (
    <div className="space-y-6 text-stone-900">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">My Schedule</h1>
        <p className="text-stone-600 mt-1">
          View your upcoming shifts and who is on for the day
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-stone-200 bg-white">
          <CardHeader>
            <CardTitle className="text-stone-900 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming shifts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!employee ? (
              <p className="text-sm text-stone-500">You don&apos;t have an employee record. Contact your manager.</p>
            ) : shifts.length === 0 ? (
              <p className="text-sm text-stone-500">No upcoming shifts in the next 60 days.</p>
            ) : (
              <ul className="space-y-2">
                {shifts.map((s) => (
                  <li
                    key={s.slotId}
                    className="flex flex-wrap items-baseline justify-between gap-2 rounded border border-stone-100 bg-stone-50/50 px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-stone-800">
                      {format(new Date(s.startTime), 'EEE, MMM d')} – {format(new Date(s.startTime), 'h:mm a')} to{' '}
                      {format(new Date(s.endTime), 'h:mm a')}
                      {s.position && ` (${s.position})`}
                    </span>
                    <span className="text-stone-500 text-xs">{s.scheduleName}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <DayRosterCard />
      </div>

      {currentWeekSchedule && (
        <Card className="border-stone-200 bg-white">
          <CardHeader>
            <CardTitle className="text-stone-900">This week&apos;s schedule</CardTitle>
            <p className="text-sm text-stone-600">
              Open the full weekly schedule to see the roster and chat with your team.
            </p>
          </CardHeader>
          <CardContent>
            <Link
              href={`/schedules/${currentWeekSchedule.slug ?? currentWeekSchedule.id}?view=roster`}
              className="inline-flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-500/20"
            >
              Open week of {format(new Date(currentWeekSchedule.weekStartDate!), 'MMMM d, yyyy')}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      )}

      {!currentWeekSchedule && (
        <Card className="border-stone-200 bg-white">
          <CardContent className="pt-6">
            <p className="text-sm text-stone-500">
              No schedule has been created for this week yet. Check the{' '}
              <Link href="/schedules" className="text-amber-600 hover:underline">
                Schedules
              </Link>{' '}
              page for other weeks.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
