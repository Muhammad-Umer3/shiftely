'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isWithinInterval,
} from 'date-fns'
import { ChevronLeft, ChevronRight, CalendarPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import { AddLeaveDialog } from './add-leave-dialog'

type Shift = { id: string; startTime: string; endTime: string; position: string | null }
type Leave = { id: string; startDate: string; endDate: string; type: string; notes: string | null }

export function EmployeeCalendar({ employeeId }: { employeeId: string }) {
  const [viewDate, setViewDate] = useState(new Date())
  const [shifts, setShifts] = useState<Shift[]>([])
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [loading, setLoading] = useState(true)
  const [addLeaveOpen, setAddLeaveOpen] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const monthStart = startOfMonth(viewDate)
    const monthEnd = endOfMonth(viewDate)
    const startStr = format(monthStart, 'yyyy-MM-dd')
    const endStr = format(monthEnd, 'yyyy-MM-dd')

    try {
      const [shiftsRes, leavesRes] = await Promise.all([
        fetch(`/api/employees/${employeeId}/shifts?startDate=${startStr}&endDate=${endStr}`),
        fetch(`/api/employees/${employeeId}/leaves?startDate=${startStr}&endDate=${endStr}`),
      ])

      const shiftsData = shiftsRes.ok ? (await shiftsRes.json()).shifts ?? [] : []
      const leavesData = leavesRes.ok ? (await leavesRes.json()).leaves ?? [] : []
      setShifts(shiftsData)
      setLeaves(leavesData)
    } catch {
      setShifts([])
      setLeaves([])
    } finally {
      setLoading(false)
    }
  }, [employeeId, viewDate])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const handler = () => fetchData()
    window.addEventListener('leave-updated', handler)
    return () => window.removeEventListener('leave-updated', handler)
  }, [fetchData])

  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days: Date[] = []
  let day = calendarStart
  while (day <= calendarEnd) {
    days.push(day)
    day = addDays(day, 1)
  }

  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  const getShiftsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return shifts.filter((s) => {
      const start = new Date(s.startTime)
      return format(start, 'yyyy-MM-dd') === dateStr
    })
  }

  const getLeaveForDate = (date: Date) => {
    return leaves.find((l) => {
      const start = new Date(l.startDate)
      const end = new Date(l.endDate)
      return isWithinInterval(date, { start, end })
    })
  }

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewDate(subMonths(viewDate, 1))}
            className="border-stone-300"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold text-stone-900 min-w-[180px] text-center">
            {format(viewDate, 'MMMM yyyy')}
          </h3>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewDate(addMonths(viewDate, 1))}
            className="border-stone-300"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAddLeaveOpen(true)}
          className="border-amber-500/50 text-amber-700 hover:bg-amber-50 hover:border-amber-500"
        >
          <CalendarPlus className="mr-2 h-4 w-4" />
          Add Leave
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-7 gap-1 animate-pulse">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-stone-200 min-h-[70px]" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((name) => (
              <div
                key={name}
                className="text-center text-xs font-medium text-stone-500 py-1"
              >
                {name}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {weeks.flatMap((week) =>
              week.map((date) => {
                const dateStr = format(date, 'yyyy-MM-dd')
                const dayShifts = getShiftsForDate(date)
                const dayLeave = getLeaveForDate(date)
                const isCurrentMonth = isSameMonth(date, viewDate)
                const isToday = isSameDay(date, new Date())

                return (
                  <div
                    key={dateStr}
                    className={cn(
                      'aspect-square rounded-lg p-2 min-h-[70px] border transition-colors',
                      isCurrentMonth ? 'text-stone-900 border-stone-100' : 'text-stone-400 border-stone-50',
                      isToday && 'ring-2 ring-amber-500 ring-offset-1',
                      dayLeave && 'bg-rose-50 border-rose-200'
                    )}
                  >
                    <span className="text-sm font-medium">{format(date, 'd')}</span>
                    <div className="mt-1 space-y-0.5">
                      {dayShifts.map((shift) => (
                        <div
                          key={shift.id}
                          className="text-xs truncate px-1.5 py-0.5 rounded bg-amber-100 text-amber-800"
                          title={`${new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(shift.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ${shift.position || ''}`}
                        >
                          {new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {shift.position || 'Shift'}
                        </div>
                      ))}
                      {dayLeave && (
                        <div
                          className="text-xs truncate px-1.5 py-0.5 rounded bg-rose-100 text-rose-800"
                          title={dayLeave.type}
                        >
                          {dayLeave.type}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </>
      )}

      <div className="flex gap-4 text-xs text-stone-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-100" /> Shifts
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-rose-100" /> Leave
        </span>
      </div>

      <AddLeaveDialog
        employeeId={employeeId}
        open={addLeaveOpen}
        onOpenChange={setAddLeaveOpen}
        onSuccess={fetchData}
        defaultStartDate={format(monthStart, 'yyyy-MM-dd')}
        defaultEndDate={format(monthStart, 'yyyy-MM-dd')}
      />
    </div>
  )
}
