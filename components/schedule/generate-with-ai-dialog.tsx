'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { format, addDays, startOfWeek } from 'date-fns'
import { toast } from 'sonner'
import { Sparkles, Calendar, Loader2 } from 'lucide-react'

export function GenerateWithAIDialog({
  open,
  onOpenChange,
  defaultWeekStart,
  onGenerated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultWeekStart: string
  onGenerated?: () => void
}) {
  const router = useRouter()
  const [weekStart, setWeekStart] = useState(defaultWeekStart)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    setWeekStart(defaultWeekStart)
  }, [defaultWeekStart, open])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/schedules/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekStartDate: weekStart }),
      })
      const data = await res.json()

      if (res.ok) {
        toast.success('Schedule generated with AI!')
        onOpenChange(false)
        onGenerated?.()
        if (data.schedule?.id) {
          router.push(`/schedules/${data.schedule.slug ?? data.schedule.id}`)
        }
        router.refresh()
      } else if (res.status === 409) {
        toast.error(data.message || 'A schedule already exists for this week.')
      } else if (res.status === 403) {
        toast.error(data.message || 'Upgrade required to create more schedules')
      } else {
        toast.error(data.message || 'Failed to generate schedule')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setGenerating(false)
    }
  }

  const weekStartDate = new Date(weekStart)
  const weekEndDate = addDays(weekStartDate, 6)
  const weekLabel = `${format(weekStartDate, 'MMM d')} – ${format(weekEndDate, 'MMM d')}, ${format(weekStartDate, 'yyyy')}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Generate schedule with AI
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-stone-600">
            AI will create a schedule based on your employees&apos; availability. Pick a week and click Generate.
          </p>
          <div>
            <label className="text-sm font-medium text-stone-700 block mb-1">Week starting (Monday)</label>
            <input
              type="date"
              value={weekStart}
              onChange={(e) => {
                const d = new Date(e.target.value)
                const monday = startOfWeek(d, { weekStartsOn: 1 })
                setWeekStart(format(monday, 'yyyy-MM-dd'))
              }}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-stone-900 bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {weekLabel}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate with AI
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
