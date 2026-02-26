'use client'

import { useRouter } from 'next/navigation'
import { format, addWeeks, subWeeks, startOfWeek } from 'date-fns'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

function toWeekStart(d: Date): string {
  const start = startOfWeek(d, { weekStartsOn: 1 })
  return format(start, 'yyyy-MM-dd')
}

export function ScheduleWeekNav({
  weekStartDate,
  scheduleSeriesId,
}: {
  weekStartDate: string
  scheduleSeriesId?: string | null
}) {
  const router = useRouter()
  const [loading, setLoading] = useState<'prev' | 'next' | null>(null)
  const current = new Date(weekStartDate)
  const prevWeekStart = toWeekStart(subWeeks(current, 1))
  const nextWeekStart = toWeekStart(addWeeks(current, 1))

  const goToWeek = async (weekStart: string) => {
    const which = weekStart === prevWeekStart ? 'prev' : 'next'
    setLoading(which)
    try {
      const url = new URL('/api/schedules', window.location.origin)
      url.searchParams.set('weekStartDate', weekStart)
      if (scheduleSeriesId) url.searchParams.set('scheduleSeriesId', scheduleSeriesId)
      const res = await fetch(url.toString())
      const data = await res.json()
      if (res.ok && data.schedule) {
        const target = data.schedule.slug || data.schedule.id
        router.push(`/schedules/${target}`)
        return
      }
      const label = which === 'next' ? 'next week' : 'previous week'
      toast.info(`No schedule for ${label} yet. You can create one below.`)
      const createParams = new URLSearchParams({ create: 'true', weekStart })
      if (scheduleSeriesId) createParams.set('seriesId', scheduleSeriesId)
      router.push(`/schedules?${createParams.toString()}`)
    } catch {
      toast.error('Could not load schedule')
      router.push('/schedules')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => goToWeek(prevWeekStart)}
        disabled={!!loading}
        className="border-stone-200 text-stone-600 hover:bg-stone-50 h-8 w-8 p-0"
        aria-label="Previous week"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => goToWeek(nextWeekStart)}
        disabled={!!loading}
        className="border-stone-200 text-stone-600 hover:bg-stone-50 h-8 w-8 p-0"
        aria-label="Next week"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
