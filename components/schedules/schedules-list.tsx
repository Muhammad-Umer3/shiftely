'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format, addDays, startOfWeek } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, ChevronRight } from 'lucide-react'
import { CreateScheduleDialog } from '@/components/schedule/create-schedule-dialog'
import { EmptyState } from '@/components/ui/empty-state'

type ScheduleSeriesItem = {
  id: string
  name: string
  displaySettings: unknown
  latestSchedule: { id: string; slug: string | null; weekStartDate: Date | null } | null
  scheduleCount: number
}

export function SchedulesList({
  series,
  canCreate,
  canEdit,
  openCreateOnMount,
  createWeekStart,
  createSeriesId,
  isFreeUser,
  currentWeekStart,
}: {
  series: ScheduleSeriesItem[]
  canCreate: boolean
  canEdit: boolean
  openCreateOnMount?: boolean
  createWeekStart?: string
  createSeriesId?: string
  isFreeUser?: boolean
  currentWeekStart?: string
}) {
  const [createOpen, setCreateOpen] = useState(openCreateOnMount ?? false)
  const defaultWeekForCreate =
    createWeekStart ?? currentWeekStart ?? format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')

  useEffect(() => {
    const handler = () => setCreateOpen(true)
    window.addEventListener('open-create-schedule', handler)
    return () => window.removeEventListener('open-create-schedule', handler)
  }, [])

  return (
    <>
      {series.length === 0 ? (
        <Card className="border-stone-200 bg-white">
          <CardContent className="py-12">
            <EmptyState
              icon={<Calendar className="h-12 w-12 text-amber-500/60" />}
              title="No schedules yet"
              description={isFreeUser ? "Create your first schedule and assign shifts manually. Upgrade to Growth for AI-powered scheduling." : "Create your first schedule. Add employees and set their availability, then use the AI Assistant on the calendar to generate shifts."}
              action={
                canCreate
                  ? {
                      label: 'Create schedule',
                      onClick: () => setCreateOpen(true),
                    }
                  : undefined
              }
              className="text-stone-900"
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-stone-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base text-stone-900">All schedules</CardTitle>
            {canCreate && (
              <Button
                variant="outline"
                onClick={() => setCreateOpen(true)}
                className="border-stone-200 text-stone-700 hover:bg-stone-50"
              >
                Create schedule
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-stone-700">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-stone-700">Weeks</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-stone-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {series.map((s) => {
                    const latest = s.latestSchedule
                    const weekRange = latest?.weekStartDate
                      ? (() => {
                          const start = new Date(latest.weekStartDate!)
                          const end = addDays(start, 6)
                          return `${format(start, 'MMM d')} – ${format(end, 'MMM d')}, ${format(start, 'yyyy')}`
                        })()
                      : 'No weeks yet'
                    const calendarHref = latest
                      ? `/schedules/${latest.slug ?? latest.id}`
                      : `/schedules?create=true&seriesId=${encodeURIComponent(s.id)}&weekStart=${currentWeekStart ?? format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')}`

                    return (
                      <tr
                        key={s.id}
                        className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="font-medium text-stone-900 truncate block max-w-[240px]">
                            {s.name?.trim() || 'Untitled'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-stone-600">
                          {s.scheduleCount} week{s.scheduleCount !== 1 ? 's' : ''}
                          {latest && (
                            <span className="block text-stone-500 text-xs mt-0.5">Latest: {weekRange}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link href={calendarHref}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            >
                              View calendar
                              <ChevronRight className="h-4 w-4 ml-0.5" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {canCreate && (
        <CreateScheduleDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          defaultWeekStart={defaultWeekForCreate}
          defaultSeriesId={createSeriesId}
          isFreeUser={isFreeUser}
          currentWeekStart={currentWeekStart}
        />
      )}
    </>
  )
}
