'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CalendarDays } from 'lucide-react'

export function StepFillCalendar({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Fill the calendar</h3>
      <p className="text-sm text-muted-foreground">
        Review your schedule and fill any empty slots or adjust shifts as needed.
      </p>
      <div className="flex flex-wrap gap-2">
        <Link href="/schedules">
          <Button>
            <CalendarDays className="h-4 w-4 mr-1.5" />
            Open schedules
          </Button>
        </Link>
        <Button variant="outline" onClick={onComplete}>
          Done
        </Button>
        <Button variant="ghost" onClick={onComplete}>
          I&apos;ll do this later
        </Button>
      </div>
    </div>
  )
}
