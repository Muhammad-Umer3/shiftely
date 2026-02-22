'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format, addDays, subDays } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type RosterEntry = {
  id: string
  startTime: string
  endTime: string
  position: string | null
  assignees: { name: string; email: string }[]
}

export function DayRosterCard() {
  const [date, setDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [roster, setRoster] = useState<RosterEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/me/day-roster?date=${encodeURIComponent(date)}`)
      .then((r) => r.json())
      .then((data) => {
        setRoster(data.roster ?? [])
      })
      .catch(() => setRoster([]))
      .finally(() => setLoading(false))
  }, [date])

  const displayDate = new Date(date + 'T12:00:00')
  const isToday = date === format(new Date(), 'yyyy-MM-dd')

  return (
    <Card className="border-stone-200 bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-stone-900 text-lg">
          {isToday ? "Who's on today" : `Who's on ${format(displayDate, 'EEE, MMM d')}`}
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setDate(format(subDays(displayDate, 1), 'yyyy-MM-dd'))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setDate(format(addDays(displayDate, 1), 'yyyy-MM-dd'))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-stone-500">Loading…</p>
        ) : roster.length === 0 ? (
          <p className="text-sm text-stone-500">No shifts scheduled for this day.</p>
        ) : (
          <ul className="space-y-2">
            {roster.map((slot) => (
              <li
                key={slot.id}
                className="flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded border border-stone-100 bg-stone-50/50 px-3 py-2 text-sm"
              >
                <span className="font-medium text-stone-700">
                  {format(new Date(slot.startTime), 'h:mm a')} – {format(new Date(slot.endTime), 'h:mm a')}
                </span>
                {slot.position && (
                  <span className="text-stone-500">({slot.position})</span>
                )}
                <span className="text-stone-600">
                  {slot.assignees.length > 0
                    ? slot.assignees.map((a) => a.name).join(', ')
                    : 'Unassigned'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
