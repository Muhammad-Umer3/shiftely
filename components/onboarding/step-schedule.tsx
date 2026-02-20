'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export function StepSchedule({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Generate Your First Schedule with AI</h3>
      <p className="text-sm text-muted-foreground">
        AI will create a schedule from your employees&apos; availability. Pick a week and generate—no spreadsheets needed.
      </p>
      <div className="flex flex-wrap gap-2">
        <Link href="/schedules?create=true">
          <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950">
            <Sparkles className="h-4 w-4 mr-1.5" />
            Generate with AI
          </Button>
        </Link>
        <Button variant="outline" onClick={onComplete}>
          I&apos;ll generate later
        </Button>
      </div>
    </div>
  )
}
