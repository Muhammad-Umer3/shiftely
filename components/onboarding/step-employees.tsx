'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function StepEmployees({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Add Your Team</h3>
      <p className="text-sm text-muted-foreground">
        Add employees and set when they can work. AI will use this availability to generate schedules.
      </p>
      <div className="flex flex-wrap gap-2">
        <Link href="/employees/invite">
          <Button>Add Employee</Button>
        </Link>
        <Link href="/employees">
          <Button variant="outline">Set Availability</Button>
        </Link>
        <Button variant="outline" onClick={onComplete}>
          I&apos;ve added employees
        </Button>
        <Button variant="ghost" onClick={onComplete}>
          I&apos;ll add employees later
        </Button>
      </div>
    </div>
  )
}
