'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Send } from 'lucide-react'

export function StepPublish({
  onComplete,
  onCompleteLater,
}: {
  onComplete: () => void
  onCompleteLater: () => void
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Publish your schedule</h3>
      <p className="text-sm text-muted-foreground">
        Publish the schedule so your team can see their shifts. You can always edit and republish later.
      </p>
      <div className="flex flex-wrap gap-2">
        <Link href="/schedules">
          <Button>
            <Send className="h-4 w-4 mr-1.5" />
            Go to schedules & publish
          </Button>
        </Link>
        <Button variant="outline" onClick={onComplete}>
          I&apos;ve published
        </Button>
        <Button variant="ghost" onClick={onCompleteLater}>
          I&apos;ll publish later
        </Button>
      </div>
    </div>
  )
}
