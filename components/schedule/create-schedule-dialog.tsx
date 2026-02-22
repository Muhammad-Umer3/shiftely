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
import { format, addDays, startOfWeek, subWeeks } from 'date-fns'
import { toast } from 'sonner'
import { Calendar, Copy } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

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
  const [copyFromPrevious, setCopyFromPrevious] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    setWeekStart(defaultWeekStart)
  }, [defaultWeekStart, open])

  const weekStartDate = new Date(weekStart)
  const previousWeekStart = subWeeks(startOfWeek(weekStartDate, { weekStartsOn: 1 }), 1)
  const sourceWeekStartStr = format(previousWeekStart, 'yyyy-MM-dd')

  const handleCreate = async () => {
    setCreating(true)
    try {
      const createRes = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekStartDate: weekStart,
          autoFill: !copyFromPrevious,
          name: name.trim() || undefined,
        }),
      })
      const createData = await createRes.json()

      if (!createRes.ok) {
        if (createRes.status === 403) {
          toast.error(createData.message || 'Upgrade required to create more schedules')
        } else {
          toast.error(createData.message || 'Failed to create schedule')
        }
        setCreating(false)
        return
      }

      if (copyFromPrevious) {
        const copyRes = await fetch('/api/schedules/copy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetWeekStart: weekStart,
            sourceWeekStart: sourceWeekStartStr,
          }),
        })
        const copyData = await copyRes.json()
        if (copyRes.ok) {
          toast.success(
            copyData.copiedCount > 0
              ? `Schedule created with ${copyData.copiedCount} shifts copied from previous week`
              : 'Schedule created. No shifts to copy from previous week.'
          )
        } else {
          toast.success('Schedule created.')
          if (copyData.message) toast.info(copyData.message)
        }
      } else if (createRes.status === 201 && createData.schedule?.id) {
        toast.success('Schedule created successfully!')
      } else if (createData.existing && createData.schedule?.id) {
        toast.info('Schedule already exists for this week.')
      }

      window.dispatchEvent(new CustomEvent('schedule-created'))
      onOpenChange(false)
      onCreated?.()
      if (createData.schedule?.id) {
        router.push(`/schedules/${createData.schedule.slug ?? createData.schedule.id}`)
      } else {
        router.push('/schedules')
      }
      router.refresh()
    } catch {
      toast.error('An error occurred')
    } finally {
      setCreating(false)
    }
  }

  const weekEndDate = addDays(weekStartDate, 6)
  const weekLabel = `${format(weekStartDate, 'MMM d')} – ${format(weekEndDate, 'MMM d')}, ${format(weekStartDate, 'yyyy')}`
  const sourceWeekLabel = `${format(previousWeekStart, 'MMM d')} – ${format(addDays(previousWeekStart, 6), 'MMM d')}, ${format(previousWeekStart, 'yyyy')}`

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

          <div className="border border-stone-200 rounded-lg p-3 bg-stone-50/50">
            <label
              className={cn(
                'flex items-start gap-3 cursor-pointer',
                copyFromPrevious && 'text-amber-700'
              )}
            >
              <input
                type="checkbox"
                checked={copyFromPrevious}
                onChange={(e) => setCopyFromPrevious(e.target.checked)}
                className="mt-0.5 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
              />
              <div>
                <span className="flex items-center gap-1.5 font-medium text-stone-800">
                  <Copy className="h-4 w-4 text-amber-600" />
                  Copy shifts from previous week
                </span>
                <p className="text-xs text-stone-500 mt-1">
                  {copyFromPrevious
                    ? `Shifts from ${sourceWeekLabel} will be copied into this schedule.`
                    : 'Create an empty schedule (or use auto-fill to add placeholder shifts).'}
                </p>
              </div>
            </label>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2.5 text-sm text-amber-900">
            <p className="font-medium mb-0.5">Note</p>
            <p className="text-xs text-amber-800">
              Display hours and min/max people per shift cannot be changed after the schedule is created. They are set from your organization defaults. Use Settings to change defaults before creating if needed.
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
            {creating ? 'Creating...' : copyFromPrevious ? 'Create & copy' : 'Create schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
