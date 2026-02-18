'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type ScheduleSettings = {
  startHour: number
  endHour: number
  workingDays: number[]
}

export function ScheduleSettingsDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: (settings: ScheduleSettings) => void
}) {
  const [startHour, setStartHour] = useState(6)
  const [endHour, setEndHour] = useState(22)
  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setLoading(true)
      fetch('/api/schedule-settings')
        .then((r) => r.json())
        .then((d) => {
          if (d.settings) {
            setStartHour(d.settings.startHour ?? 6)
            setEndHour(d.settings.endHour ?? 22)
            setWorkingDays(Array.isArray(d.settings.workingDays) ? d.settings.workingDays : [1, 2, 3, 4, 5])
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [open])

  const toggleDay = (day: number) => {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => a - b)
    )
  }

  const handleSave = async () => {
    if (startHour >= endHour) {
      toast.error('Start hour must be before end hour')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/schedule-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startHour,
          endHour,
          workingDays,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Schedule settings saved')
        onSaved?.(data.settings)
        onOpenChange(false)
      } else {
        toast.error(data.message || 'Failed to save')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const hourOptions = Array.from({ length: 24 }, (_, i) => i)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule display settings</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="py-8 text-center text-stone-500">Loading...</div>
        ) : (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium text-stone-900">Business hours (display range)</Label>
              <p className="text-xs text-stone-500 mb-2">
                Only show this time range in the schedule grid
              </p>
              <div className="flex items-center gap-2">
                <div>
                  <Label className="text-xs text-stone-600">Start</Label>
                  <select
                    className="w-full mt-1 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 bg-white"
                    value={startHour}
                    onChange={(e) => setStartHour(parseInt(e.target.value, 10))}
                  >
                    {hourOptions.map((h) => (
                      <option key={h} value={h}>
                        {h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="pt-6">to</span>
                <div>
                  <Label className="text-xs text-stone-600">End</Label>
                  <select
                    className="w-full mt-1 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 bg-white"
                    value={endHour}
                    onChange={(e) => setEndHour(parseInt(e.target.value, 10))}
                  >
                    {hourOptions.map((h) => (
                      <option key={h} value={h}>
                        {h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-stone-900">Working days</Label>
              <p className="text-xs text-stone-500 mb-2">
                Toggle which days to show in the schedule (days off are hidden)
              </p>
              <div className="flex flex-wrap gap-2">
                {DAY_LABELS.map((label, i) => {
                  const day = i
                  const isOn = workingDays.includes(day)
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isOn
                          ? 'bg-amber-500 text-stone-950'
                          : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
