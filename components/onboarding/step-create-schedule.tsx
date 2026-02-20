'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Calendar } from 'lucide-react'

export function StepCreateSchedule({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Create a schedule</h3>
      <p className="text-sm text-muted-foreground">
        Create a schedule for a week. You can then use AI to fill roles and publish it.
      </p>
      <div className="flex flex-wrap gap-2">
        <Link href="/schedules?create=true">
          <Button>
            <Calendar className="h-4 w-4 mr-1.5" />
            Create schedule
          </Button>
        </Link>
        <Button variant="outline" onClick={onComplete}>
          I&apos;ve created a schedule
        </Button>
        <Button variant="ghost" onClick={onComplete}>
          I&apos;ll do this later
        </Button>
      </div>
    </div>
  )
}
