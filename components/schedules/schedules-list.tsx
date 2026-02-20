'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format, addDays, startOfWeek } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, ChevronRight, Users, Settings2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { EditScheduleDialog } from '@/components/schedule/edit-schedule-dialog'
import { CreateScheduleDialog } from '@/components/schedule/create-schedule-dialog'
import { EmptyState } from '@/components/ui/empty-state'

type Employee = {
  id: string
  user: { name: string | null; email: string }
}

type DisplaySettings = {
  startHour: number
  endHour: number
  workingDays: number[]
  displayGroupIds?: string[]
}

type ScheduleWithShifts = {
  id: string
  name: string | null
  weekStartDate: Date
  status: string
  assignedEmployeeIds: string[]
  displaySettings: DisplaySettings | null
  scheduleShifts: Array<{
    shift: {
      employeeId: string | null
      employee: { id: string; user: { name: string | null; email: string } } | null
    }
  }>
}

export function SchedulesList({
  schedules,
  employees,
  defaultDisplaySettings,
  canCreate,
  canEdit,
  openCreateOnMount,
}: {
  schedules: ScheduleWithShifts[]
  employees: Employee[]
  defaultDisplaySettings: { startHour: number; endHour: number; workingDaysLabel: string; workingDays: number[] }
  canCreate: boolean
  canEdit: boolean
  openCreateOnMount?: boolean
}) {
  const [editSchedule, setEditSchedule] = useState<ScheduleWithShifts | null>(null)
  const [createOpen, setCreateOpen] = useState(openCreateOnMount ?? false)

  useEffect(() => {
    const handler = () => setCreateOpen(true)
    window.addEventListener('open-create-schedule', handler)
    return () => window.removeEventListener('open-create-schedule', handler)
  }, [])

  return (
    <>
      {schedules.length === 0 ? (
        <Card className="border-stone-200 bg-white">
          <CardContent className="py-12">
            <EmptyState
              icon={<Calendar className="h-12 w-12 text-amber-500/60" />}
              title="No schedules yet"
              description="Create your first schedule. Add employees and set their availability, then use the AI Assistant on the calendar to generate shifts."
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
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-stone-700">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-stone-700">Week</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-stone-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-stone-700">Display</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-stone-700">Employees</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-stone-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((s) => {
                    const start = new Date(s.weekStartDate)
                    const end = addDays(start, 6)
                    const weekRange = `${format(start, 'MMM d')} – ${format(end, 'MMM d')}, ${format(start, 'yyyy')}`
                    const displayName = s.name?.trim() || weekRange
                    const ds = s.displaySettings as { displayGroupIds?: string[] } | null
                    const displayGroupIds = ds?.displayGroupIds ?? []
                    const groupsLabel = displayGroupIds.length > 0 ? `${displayGroupIds.length} group${displayGroupIds.length !== 1 ? 's' : ''}` : 'All groups'

                    return (
                      <tr
                        key={s.id}
                        className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <Link
                            href={`/schedules/${s.id}`}
                            className="font-medium text-stone-900 hover:text-amber-600 truncate block max-w-[180px]"
                          >
                            {displayName}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-sm text-stone-600">{weekRange}</td>
                        <td className="py-3 px-4">
                          <span
                            className={cn(
                              'text-xs font-medium px-2 py-0.5 rounded-full',
                              s.status === 'PUBLISHED'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-amber-100 text-amber-700'
                            )}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-stone-600">
                          <span className="flex items-center gap-1" title="Hours & days">
                            <Settings2 className="h-3.5 w-3" />
                            {(() => {
                              const ds = s.displaySettings as { startHour?: number; endHour?: number; workingDays?: number[] } | null
                              const start = ds?.startHour ?? defaultDisplaySettings.startHour
                              const end = ds?.endHour ?? defaultDisplaySettings.endHour
                              const days = ds?.workingDays ?? defaultDisplaySettings.workingDays
                              const daysLabel = days.sort((a, b) => a - b).map((d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).filter(Boolean).join(', ') || 'Mon–Fri'
                              return `${start}–${end}h, ${daysLabel}`
                            })()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-sm text-stone-600">
                            <Users className="h-3.5 w-3 shrink-0" />
                            <span>{groupsLabel}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {canEdit && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditSchedule(s)}
                                className="text-stone-600 border-stone-200"
                              >
                                Edit schedule
                              </Button>
                            )}
                            <Link href={`/schedules/${s.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                              >
                                View calendar
                                <ChevronRight className="h-4 w-4 ml-0.5" />
                              </Button>
                            </Link>
                          </div>
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

      {editSchedule && (
        <EditScheduleDialog
          open={!!editSchedule}
          onOpenChange={(open) => !open && setEditSchedule(null)}
          scheduleId={editSchedule.id}
          initialName={editSchedule.name}
          initialDisplayGroupIds={(editSchedule.displaySettings as DisplaySettings | null)?.displayGroupIds ?? []}
          initialDisplaySettings={editSchedule.displaySettings as DisplaySettings | null}
          onSaved={() => setEditSchedule(null)}
        />
      )}

      {canCreate && (
        <CreateScheduleDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            defaultWeekStart={format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')}
          />
      )}
    </>
  )
}
