'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

type Suggestion = {
  employeeId: string
  employeeName?: string
  startTime: string | Date
  endTime: string | Date
  position: string | null
  reason: string
}

type Draft = {
  suggestions: Suggestion[]
  summary: string
}

const STRATEGIES = [
  { id: 'balance_hours', label: 'Balance hours' },
  { id: 'custom', label: 'Custom' },
] as const

export function ScheduleAIDialog({
  open,
  onOpenChange,
  scheduleId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  scheduleId: string
}) {
  const router = useRouter()
  const [strategy, setStrategy] = useState<string>('balance_hours')
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [applying, setApplying] = useState(false)
  const [draft, setDraft] = useState<Draft | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    setDraft(null)
    try {
      const suggestRes = await fetch(`/api/schedules/${scheduleId}/ai-suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy: strategy || 'balance_hours',
          prompt: prompt.trim() || undefined,
        }),
      })
      const suggestData = await suggestRes.json()

      if (!suggestRes.ok) {
        toast.error(suggestData.message || 'Failed to generate')
        return
      }

      const suggestions: Suggestion[] = suggestData.suggestions ?? []
      if (suggestions.length === 0) {
        toast.info('No shifts generated. Try a different strategy or instructions.')
        return
      }

      setDraft({
        suggestions,
        summary: suggestData.summary || 'AI-generated schedule suggestions',
      })
    } catch {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToSchedule = async () => {
    if (!draft || draft.suggestions.length === 0) return
    setApplying(true)
    try {
      const payload = draft.suggestions.map((s) => ({
        employeeId: s.employeeId,
        startTime: typeof s.startTime === 'string' ? s.startTime : new Date(s.startTime).toISOString(),
        endTime: typeof s.endTime === 'string' ? s.endTime : new Date(s.endTime).toISOString(),
        position: s.position,
      }))
      const applyRes = await fetch(`/api/schedules/${scheduleId}/ai-apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestions: payload }),
      })
      const applyData = await applyRes.json()

      if (applyRes.ok) {
        const applied = applyData.applied ?? draft.suggestions.length
        toast.success(`Added ${applied} shift(s) to schedule`)
        setDraft(null)
        onOpenChange(false)
        router.refresh()
      } else {
        toast.error(applyData.message || 'Failed to add to schedule')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setApplying(false)
    }
  }

  const handleDiscard = () => {
    setDraft(null)
    onOpenChange(false)
  }

  const handleTryAgain = () => {
    setDraft(null)
  }

  const handleClose = () => {
    setPrompt('')
    setStrategy('balance_hours')
    setDraft(null)
    onOpenChange(false)
  }

  const showDraft = draft !== null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            AI Schedule Assistant
          </DialogTitle>
        </DialogHeader>

        {!showDraft ? (
          <>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-stone-700 block mb-1">
                  Strategy
                </label>
                <div className="flex gap-2">
                  {STRATEGIES.map((s) => (
                    <Button
                      key={s.id}
                      type="button"
                      variant={strategy === s.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStrategy(s.id)}
                      className={
                        strategy === s.id
                          ? 'bg-amber-500 hover:bg-amber-600 text-stone-950'
                          : ''
                      }
                    >
                      {s.label}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  {strategy === 'balance_hours'
                    ? 'Spread shifts fairly across the team.'
                    : 'Describe what you want in your own words below.'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-stone-700 block mb-1">
                  Instructions (optional)
                </label>
                <textarea
                  placeholder="e.g. Add more morning coverage on Tuesday, prefer John for closing shifts..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-stone-900 bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                />
              </div>
              {loading && (
                <div className="flex items-center gap-2 text-stone-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating draft...
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950"
              >
                {loading ? 'Generating...' : 'Generate draft'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <p className="text-sm text-stone-700">{draft.summary}</p>
              <div className="border border-stone-200 rounded-lg overflow-hidden">
                <div className="max-h-[240px] overflow-y-auto">
                  <ul className="divide-y divide-stone-100">
                    {draft.suggestions.map((s, i) => (
                      <li key={i} className="px-3 py-2 text-sm bg-white">
                        <span className="font-medium text-stone-900">
                          {s.employeeName ?? 'Unknown'}
                        </span>
                        <span className="text-stone-500 mx-1">·</span>
                        <span className="text-stone-600">
                          {format(new Date(s.startTime), 'EEE MMM d, HH:mm')} –{' '}
                          {format(new Date(s.endTime), 'HH:mm')}
                        </span>
                        {s.position && (
                          <span className="text-stone-500 ml-1">({s.position})</span>
                        )}
                        <p className="text-xs text-stone-500 mt-0.5">{s.reason}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleTryAgain}
                disabled={applying}
                className="text-stone-500"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Try again
              </Button>
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" onClick={handleDiscard} disabled={applying}>
                  Discard
                </Button>
                <Button
                  onClick={handleAddToSchedule}
                  disabled={applying}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950"
                >
                  {applying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add to schedule'
                  )}
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
