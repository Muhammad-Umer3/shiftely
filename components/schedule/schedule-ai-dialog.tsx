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
import { Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

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
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const suggestRes = await fetch(`/api/schedules/${scheduleId}/ai-suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() || undefined }),
      })
      const suggestData = await suggestRes.json()

      if (!suggestRes.ok) {
        toast.error(suggestData.message || 'Failed to generate')
        return
      }

      const suggestions = suggestData.suggestions ?? []
      if (suggestions.length === 0) {
        toast.info('No shifts generated. Try a different prompt.')
        return
      }

      const payload = suggestions.map((s: { employeeId: string; startTime: Date; endTime: Date; position: string | null }) => ({
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
        const applied = applyData.applied ?? suggestions.length
        toast.success(`Added ${applied} shift(s) to draft`)
        onOpenChange(false)
        router.refresh()
      } else {
        toast.error(applyData.message || 'Failed to update draft')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setPrompt('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            AI Schedule Assistant
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-stone-700 block mb-1">
              Instructions (optional)
            </label>
            <textarea
              placeholder="e.g. Add more morning coverage on Tuesday, balance hours across the team, prefer John for closing shifts..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-stone-900 bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
            />
          </div>
          <p className="text-xs text-stone-500">
            AI will generate shifts in a structured format and add them directly to your draft schedule.
          </p>
          {loading && (
            <div className="flex items-center gap-2 text-stone-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating and updating draft...
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
            {loading ? 'Generating...' : 'Generate & update draft'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
