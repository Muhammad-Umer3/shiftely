'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export function StepAIFill({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Ask AI to fill the roles</h3>
      <p className="text-sm text-muted-foreground">
        Open your schedule and use &quot;Generate with AI&quot; or the AI assistant to fill shifts based on your team&apos;s availability.
      </p>
      <div className="flex flex-wrap gap-2">
        <Link href="/schedules">
          <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950">
            <Sparkles className="h-4 w-4 mr-1.5" />
            Go to schedules
          </Button>
        </Link>
        <Button variant="outline" onClick={onComplete}>
          I&apos;ve filled the roles
        </Button>
        <Button variant="ghost" onClick={onComplete}>
          I&apos;ll do this later
        </Button>
      </div>
    </div>
  )
}
