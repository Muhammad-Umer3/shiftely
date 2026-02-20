import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScheduleRosterView } from '@/components/schedule/schedule-roster-view'

type PageProps = {
  params: Promise<{ scheduleId: string }>
  searchParams: Promise<{ employee?: string }> | { employee?: string }
}

export default async function PublicSchedulePage({ params, searchParams }: PageProps) {
  const { scheduleId } = await params
  const resolvedSearchParams =
    typeof (searchParams as Promise<unknown>).then === 'function'
      ? await (searchParams as Promise<{ employee?: string }>)
      : (searchParams as { employee?: string })
  const employee = resolvedSearchParams.employee

  const base =
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  const url = new URL(`/api/public/schedules/${scheduleId}`, base)
  if (employee) url.searchParams.set('employee', employee)

  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) {
    if (res.status === 404) notFound()
    notFound()
  }

  const data = await res.json()

  const schedule = {
    id: data.schedule.id,
    scheduleShifts: data.schedule.scheduleShifts.map(
      (item: {
        shift: {
          id: string
          startTime: string
          endTime: string
          position: string | null
          employee: { id: string; user: { name: string | null; email: string } } | null
        }
      }) => ({
        shift: {
          ...item.shift,
          startTime: new Date(item.shift.startTime),
          endTime: new Date(item.shift.endTime),
        },
      })
    ),
  }
  const weekStart = new Date(data.weekStart)

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stone-900">
            {data.schedule.name?.trim() || `Week of ${format(weekStart, 'MMMM d, yyyy')}`}
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            Week of {format(weekStart, 'MMMM d, yyyy')}
          </p>
        </div>
        <Card className="border-stone-200 bg-white">
          <CardHeader>
            <CardTitle className="text-stone-900">Schedule</CardTitle>
            <CardDescription className="text-stone-600">
              {data.employees.length === 1
                ? 'Your shifts this week'
                : 'Employees and shifts for this week'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScheduleRosterView
              schedule={schedule}
              employees={data.employees}
              weekStart={weekStart}
              organizationId={data.organizationId}
              canEdit={false}
              workingDays={data.workingDays}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
