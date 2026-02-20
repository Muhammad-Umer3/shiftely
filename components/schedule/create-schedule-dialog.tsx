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
import { Calendar } from 'lucide-react'

export function CreateScheduleDialog({
  open,
  onOpenChange,
  defaultWeekStart,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultWeekStart: string
  onCreated?: () => void
}) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [weekStart, setWeekStart] = useState(defaultWeekStart)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    setWeekStart(defaultWeekStart)
  }, [defaultWeekStart, open])

  const handleCreate = async () => {
    setCreating(true)
    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekStartDate: weekStart,
          autoFill: true,
          name: name.trim() || undefined,
        }),
      })
      const data = await res.json()

      if (res.ok) {
        if (res.status === 201 && data.schedule?.id) {
          toast.success('Schedule created successfully!')
          window.dispatchEvent(new CustomEvent('schedule-created'))
          onOpenChange(false)
          onCreated?.()
          router.push(`/schedules/${data.schedule.id}`)
          router.refresh()
        } else if (data.existing && data.schedule?.id) {
          toast.info('Schedule already exists for this week.')
          onOpenChange(false)
          router.push(`/schedules/${data.schedule.id}`)
          router.refresh()
        }
      } else if (res.status === 403) {
        toast.error(data.message || 'Upgrade required to create more schedules')
      } else {
        toast.error(data.message || 'Failed to create schedule')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setCreating(false)
    }
  }

  const weekStartDate = new Date(weekStart)
  const weekEndDate = addDays(weekStartDate, 6)
  const weekLabel = `${format(weekStartDate, 'MMM d')} – ${format(weekEndDate, 'MMM d')}, ${format(weekStartDate, 'yyyy')}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create schedule</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-stone-700 block mb-1">Name (optional)</label>
            <input
              type="text"
              placeholder="e.g. Front of House, Kitchen Team"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-stone-900 bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

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
          <p className="text-xs text-stone-500">
            After creating, use Edit schedule to choose which groups to display in the calendar.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={creating}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold"
          >
            {creating ? 'Creating...' : 'Create schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
