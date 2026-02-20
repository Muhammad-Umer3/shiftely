'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { format, addWeeks, subWeeks, startOfWeek, addDays } from 'date-fns'

type WeekPickerProps = {
  weekStart: Date
  className?: string
}

export function WeekPicker({ weekStart, className = '' }: WeekPickerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const weekEndDate = addDays(weekStart, 6)
  const weekStartStr = format(weekStart, 'MMM d')
  const weekEndStr = format(weekEndDate, 'MMM d')
  const year = format(weekStart, 'yyyy')

  const goToWeek = (date: Date) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('week', format(date, 'yyyy-MM-dd'))
    router.push(`/schedule?${params.toString()}`)
  }

  const goPrev = () => {
    goToWeek(subWeeks(weekStart, 1))
  }

  const goNext = () => {
    goToWeek(addWeeks(weekStart, 1))
  }

  const goToCurrent = () => {
    goToWeek(startOfWeek(new Date(), { weekStartsOn: 1 }))
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="icon"
        onClick={goPrev}
        className="border-stone-300 text-stone-700 hover:bg-amber-500/10 hover:border-amber-500/30"
        aria-label="Previous week"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        onClick={goToCurrent}
        className="border-stone-300 text-stone-700 hover:bg-amber-500/10 hover:border-amber-500/30 min-w-[180px]"
      >
        <Calendar className="mr-2 h-4 w-4" />
        {weekStartStr} – {weekEndStr}, {year}
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={goNext}
        className="border-stone-300 text-stone-700 hover:bg-amber-500/10 hover:border-amber-500/30"
        aria-label="Next week"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
