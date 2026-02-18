'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Link from 'next/link'

export function StepSchedule({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Create Your First Schedule</h3>
      <p className="text-sm text-muted-foreground">
        Create a schedule for the current week. You can create more schedules from the Schedule page.
      </p>
      <div className="flex gap-2">
        <Link href="/dashboard/schedules">
          <Button>Create Schedule</Button>
        </Link>
        <Button variant="outline" onClick={onComplete}>
          I'll create a schedule later
        </Button>
      </div>
    </div>
  )
}
