'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

export function ScheduleMonthView({
  currentDate,
  onDateSelect,
}: {
  currentDate: Date
  onDateSelect: (date: Date) => void
}) {
  const router = useRouter()
  const [shiftsByDate, setShiftsByDate] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [viewDate, setViewDate] = useState(currentDate)

  useEffect(() => {
    async function fetchMonthShifts() {
      setLoading(true)
      try {
        const monthStr = format(viewDate, 'yyyy-MM')
        const res = await fetch(`/api/schedules?list=true&month=${monthStr}`)
        const data = await res.json()
        const shiftsByDateLocal: Record<string, number> = {}
        if (res.ok && data.schedules) {
          data.schedules.forEach((s: { scheduleShifts: Array<{ shift: { startTime: string } }> }) => {
            s.scheduleShifts.forEach(({ shift }) => {
              const dateStr = format(new Date(shift.startTime), 'yyyy-MM-dd')
              shiftsByDateLocal[dateStr] = (shiftsByDateLocal[dateStr] ?? 0) + 1
            })
          })
        }
        setShiftsByDate(shiftsByDateLocal)
      } catch {
        setShiftsByDate({})
      } finally {
        setLoading(false)
      }
    }
    fetchMonthShifts()
  }, [viewDate])

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

  const handleDayClick = (date: Date) => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 })
    router.push(`/schedule?week=${format(weekStart, 'yyyy-MM-dd')}`)
    onDateSelect(weekStart)
  }

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setViewDate(subMonths(viewDate, 1))}
          className="border-stone-300"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold text-stone-900">
          {format(viewDate, 'MMMM yyyy')}
        </h2>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setViewDate(addMonths(viewDate, 1))}
          className="border-stone-300"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-7 gap-1 animate-pulse">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="aspect-square rounded bg-stone-200" />
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
                const shiftCount = shiftsByDate[dateStr] ?? 0
                const isCurrentMonth = isSameMonth(date, viewDate)
                const isToday = isSameDay(date, new Date())

                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => handleDayClick(date)}
                    className={cn(
                      'aspect-square rounded-lg p-2 text-left transition-colors min-h-[80px]',
                      'hover:bg-amber-50 hover:border-amber-200 border border-transparent',
                      isCurrentMonth ? 'text-stone-900' : 'text-stone-400',
                      isToday && 'ring-2 ring-amber-500 ring-offset-1'
                    )}
                  >
                    <span className="text-sm font-medium">{format(date, 'd')}</span>
                    {shiftCount > 0 && (
                      <div className="mt-1">
                        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded bg-amber-100 text-amber-800 text-xs font-medium">
                          {shiftCount}
                        </span>
                      </div>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </>
      )}
      <p className="text-xs text-stone-500 mt-2">
        Click a day to view that week&apos;s schedule
      </p>
    </div>
  )
}
