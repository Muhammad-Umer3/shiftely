'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format, addDays, startOfWeek } from 'date-fns'
import { Calendar, ChevronRight, Users, Clock } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { toast } from 'sonner'

type ScheduleSummary = {
  id: string
  name: string | null
  weekStartDate: string
  status: string
  assignedEmployeeIds: string[]
  scheduleShifts: Array<{
    shift: {
      employeeId: string | null
      startTime: string
      endTime: string
    }
  }>
}

export function ScheduleList({
  currentWeekStart,
  canCreate,
}: {
  currentWeekStart: string
  canCreate: boolean
}) {
  const router = useRouter()
  const [schedules, setSchedules] = useState<ScheduleSummary[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSchedules = async () => {
    try {
      const res = await fetch('/api/schedules?list=true')
      const data = await res.json()
      if (res.ok && data.schedules) {
        setSchedules(data.schedules)
      }
    } catch {
      setSchedules([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedules()
  }, [])

  useEffect(() => {
    const onScheduleCreated = () => fetchSchedules()
    window.addEventListener('schedule-created', onScheduleCreated)
    return () => window.removeEventListener('schedule-created', onScheduleCreated)
  }, [])

  const viewSchedule = (weekStartDate: string) => {
    router.push(`/dashboard/schedule?week=${format(new Date(weekStartDate), 'yyyy-MM-dd')}`)
  }

  const handleCreateSchedule = () => {
    window.dispatchEvent(
      new CustomEvent('open-create-schedule', { detail: { weekStart: currentWeekStart } })
    )
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-stone-200" />
        ))}
      </div>
    )
  }

  if (schedules.length === 0) {
    return (
      <div className="rounded-lg border border-stone-200 bg-white p-6 text-center">
        <Calendar className="mx-auto h-10 w-10 text-stone-400 mb-3" />
        <p className="text-sm text-stone-600 mb-4">No schedules yet</p>
        {canCreate && (
          <Button
            onClick={handleCreateSchedule}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold"
          >
            Create your first schedule
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-stone-600 mb-2">Your schedules</h3>
      <div className="space-y-2 max-h-[240px] overflow-y-auto">
        {schedules.map((s) => {
          const start = new Date(s.weekStartDate)
          const end = addDays(start, 6)
          const weekRange = `${format(start, 'MMM d')} – ${format(end, 'MMM d')}, ${format(start, 'yyyy')}`
          const displayName = s.name?.trim() || weekRange
          const shiftCount = s.scheduleShifts.length
          const employeeIds = new Set(
            s.scheduleShifts.map((ss) => ss.shift.employeeId).filter(Boolean)
          )
          const totalHours = s.scheduleShifts.reduce((sum, ss) => {
            const startT = new Date(ss.shift.startTime).getTime()
            const endT = new Date(ss.shift.endTime).getTime()
            return sum + (endT - startT) / (1000 * 60 * 60)
          }, 0)

          const isCurrentWeek =
            format(start, 'yyyy-MM-dd') ===
            format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')

          return (
            <Card
              key={s.id}
              className={cn(
                'cursor-pointer transition-colors hover:border-amber-500/30 hover:bg-amber-50/30',
                isCurrentWeek && 'border-amber-500/50 bg-amber-50/50'
              )}
              onClick={() => viewSchedule(s.weekStartDate)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-stone-900 truncate" title={s.name ? weekRange : undefined}>
                      {displayName}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-stone-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {shiftCount} shifts
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {employeeIds.size} employees
                      </span>
                      <span>{totalHours.toFixed(1)}h total</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
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
                    <ChevronRight className="h-4 w-4 text-stone-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
