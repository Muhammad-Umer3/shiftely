'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LayoutGrid, Users, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type ViewMode = 'grid' | 'roster' | 'month'

export function ScheduleViewToggle({ view, basePath = '/schedule', showMonthView = true }: { view: ViewMode; basePath?: string; showMonthView?: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const setView = (mode: ViewMode) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', mode)
    router.push(`${basePath}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex rounded-lg border border-stone-200 p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setView('grid')}
        className={cn(
          'gap-1.5',
          view === 'grid'
            ? 'bg-amber-100 text-amber-800 hover:bg-amber-100'
            : 'text-stone-600 hover:bg-stone-100'
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        Grid
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setView('roster')}
        className={cn(
          'gap-1.5',
          view === 'roster'
            ? 'bg-amber-100 text-amber-800 hover:bg-amber-100'
            : 'text-stone-600 hover:bg-stone-100'
        )}
      >
        <Users className="h-4 w-4" />
        Roster
      </Button>
      {showMonthView && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setView('month')}
          className={cn(
            'gap-1.5',
            view === 'month'
              ? 'bg-amber-100 text-amber-800 hover:bg-amber-100'
              : 'text-stone-600 hover:bg-stone-100'
          )}
        >
          <Calendar className="h-4 w-4" />
          Month
        </Button>
      )}
    </div>
  )
}
