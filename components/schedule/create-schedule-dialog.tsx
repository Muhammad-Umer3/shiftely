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
import { Label } from '@/components/ui/label'
import { format, addDays, startOfWeek } from 'date-fns'
import { toast } from 'sonner'
import { Calendar } from 'lucide-react'

export function CreateScheduleDialog({
  open,
  onOpenChange,
  defaultWeekStart,
  defaultSeriesId,
  onCreated,
  isFreeUser,
  currentWeekStart,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultWeekStart: string
  defaultSeriesId?: string
  onCreated?: () => void
  isFreeUser?: boolean
  currentWeekStart?: string
}) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [weekStart, setWeekStart] = useState(defaultWeekStart)
  const [slotDurationHours, setSlotDurationHours] = useState<number>(1)
  const [minPeople, setMinPeople] = useState<number | ''>('')
  const [maxPeople, setMaxPeople] = useState<number | ''>('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    setWeekStart(isFreeUser && currentWeekStart ? currentWeekStart : defaultWeekStart)
  }, [defaultWeekStart, currentWeekStart, isFreeUser, open])

  const weekStartForDisplay = isFreeUser && currentWeekStart ? currentWeekStart : weekStart
  const weekStartDate = new Date(weekStartForDisplay)

  const handleCreate = async () => {
    setCreating(true)
    try {
      const displaySettings: { slotDurationHours?: number; shiftDefaults?: { minPeople?: number; maxPeople?: number } } = {}
      if ([1, 2, 4].includes(slotDurationHours)) displaySettings.slotDurationHours = slotDurationHours
      const min = minPeople === '' ? undefined : Number(minPeople)
      const max = maxPeople === '' ? undefined : Number(maxPeople)
      if (min !== undefined || max !== undefined) {
        displaySettings.shiftDefaults = {}
        if (min !== undefined) displaySettings.shiftDefaults.minPeople = min
        if (max !== undefined) displaySettings.shiftDefaults.maxPeople = max
      }
      const createRes = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekStartDate: isFreeUser && currentWeekStart ? currentWeekStart : weekStart,
          autoFill: true,
          name: name.trim() || undefined,
          ...(defaultSeriesId && { scheduleSeriesId: defaultSeriesId }),
          ...(Object.keys(displaySettings).length > 0 && { displaySettings }),
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

      if (createRes.status === 201 && createData.schedule?.id) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create schedule</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto min-h-0 pr-1">
          {!defaultSeriesId && (
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
          )}
          {defaultSeriesId && (
            <p className="text-sm text-stone-600">Adding a new week to this schedule.</p>
          )}

          <div>
            <label className="text-sm font-medium text-stone-700 block mb-1">Week starting (Monday)</label>
            <input
              type="date"
              value={weekStartForDisplay}
              onChange={(e) => {
                if (isFreeUser) return
                const d = new Date(e.target.value)
                const monday = startOfWeek(d, { weekStartsOn: 1 })
                setWeekStart(format(monday, 'yyyy-MM-dd'))
              }}
              disabled={isFreeUser}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-stone-900 bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-stone-100 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {weekLabel}
            </p>
            {isFreeUser && (
              <p className="text-xs text-amber-700 mt-1">Free plan: current week only.</p>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium text-stone-700 block mb-1">Slot duration</Label>
            <select
              value={slotDurationHours}
              onChange={(e) => setSlotDurationHours(Number(e.target.value))}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-stone-900 bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value={1}>1 hour</option>
              <option value={2}>2 hours</option>
              <option value={4}>4 hours</option>
            </select>
            <p className="text-xs text-stone-500 mt-1">Length of each shift when adding to the calendar. Cannot be changed later.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium text-stone-700 block mb-1">Min people per shift (optional)</Label>
              <input
                type="number"
                min={1}
                placeholder="—"
                value={minPeople === '' ? '' : minPeople}
                onChange={(e) => setMinPeople(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-stone-900 bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-stone-700 block mb-1">Max people per shift (optional)</Label>
              <input
                type="number"
                min={1}
                placeholder="—"
                value={maxPeople === '' ? '' : maxPeople}
                onChange={(e) => setMaxPeople(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-stone-900 bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>
          <p className="text-xs text-stone-500">Min/max cannot be changed after creation.</p>

          <p className="text-xs text-stone-500">
            After creating, use Edit schedule to choose which groups to display in the calendar.
          </p>
        </div>
        <DialogFooter className="shrink-0">
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
