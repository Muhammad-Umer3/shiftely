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
import { toast } from 'sonner'
import { UsersRound, Search } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DEFAULT_DISPLAY = { startHour: 6, endHour: 22, workingDays: [1, 2, 3, 4, 5] }

type DisplaySettings = {
  startHour: number
  endHour: number
  workingDays: number[]
  displayGroupIds?: string[]
}

type Group = {
  id: string
  name: string
  members: { employee: { id: string } }[]
}

export function EditScheduleDialog({
  open,
  onOpenChange,
  scheduleId,
  initialName,
  initialDisplayGroupIds,
  initialDisplaySettings,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  scheduleId: string
  initialName: string | null
  initialDisplayGroupIds: string[]
  initialDisplaySettings?: DisplaySettings | null
  onSaved?: () => void
}) {
  const router = useRouter()
  const defaults = initialDisplaySettings ?? DEFAULT_DISPLAY
  const [name, setName] = useState(initialName ?? '')
  const [includeSpecific, setIncludeSpecific] = useState(initialDisplayGroupIds.length > 0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialDisplayGroupIds))
  const [startHour, setStartHour] = useState(defaults.startHour)
  const [endHour, setEndHour] = useState(defaults.endHour)
  const [workingDays, setWorkingDays] = useState<number[]>(defaults.workingDays)
  const [groups, setGroups] = useState<Group[]>([])
  const [groupSearch, setGroupSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const filteredGroups = groups.filter((g) => {
    const q = groupSearch.toLowerCase().trim()
    if (!q) return true
    return g.name.toLowerCase().includes(q)
  })

  useEffect(() => {
    setName(initialName ?? '')
    setIncludeSpecific(initialDisplayGroupIds.length > 0)
    setSelectedIds(new Set(initialDisplayGroupIds))
    const d = initialDisplaySettings ?? DEFAULT_DISPLAY
    setStartHour(d.startHour)
    setEndHour(d.endHour)
    setWorkingDays(Array.isArray(d.workingDays) ? d.workingDays : DEFAULT_DISPLAY.workingDays)
  }, [initialName, initialDisplayGroupIds, initialDisplaySettings, open])

  useEffect(() => {
    if (open) {
      setLoading(true)
      fetch('/api/groups')
        .then((r) => r.json())
        .then((d) => {
          setGroups(d.groups ?? [])
        })
        .catch(() => setGroups([]))
        .finally(() => setLoading(false))
    }
  }, [open])

  const handleToggleGroup = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSelectAll = () => {
    const target = filteredGroups
    const allSelected = target.length > 0 && target.every((g) => selectedIds.has(g.id))
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        target.forEach((g) => next.delete(g.id))
        return next
      })
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        target.forEach((g) => next.add(g.id))
        return next
      })
    }
  }

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
      const res = await fetch(`/api/schedules/${scheduleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || null,
          displaySettings: {
            startHour,
            endHour,
            workingDays,
            displayGroupIds: includeSpecific ? Array.from(selectedIds) : [],
          },
        }),
      })

      if (res.ok) {
        toast.success('Schedule updated')
        window.dispatchEvent(new CustomEvent('schedule-created'))
        onOpenChange(false)
        onSaved?.()
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.message || 'Failed to update schedule')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit schedule</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-stone-700 block mb-1">Name</label>
            <input
              type="text"
              placeholder="e.g. Front of House, Kitchen Team"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-stone-900 bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSpecific}
                onChange={(e) => setIncludeSpecific(e.target.checked)}
                className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
              />
              Include specific groups for display
            </label>
            <p className="text-xs text-stone-500 mt-1">
              {includeSpecific
                ? 'Only selected groups will appear in the calendar sidebar. Drag groups onto slots to assign shifts.'
                : 'All groups will appear in the calendar sidebar.'}
            </p>

            {includeSpecific && (
              <div className="mt-3 border border-stone-200 rounded-lg p-3 space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search groups..."
                    value={groupSearch}
                    onChange={(e) => setGroupSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm border border-stone-200 rounded-lg text-stone-900 bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div className="max-h-[180px] overflow-y-auto space-y-2">
                {loading ? (
                  <p className="text-sm text-stone-500">Loading...</p>
                ) : groups.length === 0 ? (
                  <p className="text-sm text-stone-500">No groups yet. Create groups in Team.</p>
                ) : filteredGroups.length === 0 ? (
                  <p className="text-sm text-stone-500">No groups match your search</p>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                    >
                      {filteredGroups.length > 0 && filteredGroups.every((g) => selectedIds.has(g.id))
                        ? 'Deselect all'
                        : 'Select all'}
                    </button>
                    <div className="space-y-1.5">
                      {filteredGroups.map((group) => (
                        <label
                          key={group.id}
                          className={cn(
                            'flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer hover:bg-stone-50',
                            selectedIds.has(group.id) && 'bg-amber-50'
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.has(group.id)}
                            onChange={() => handleToggleGroup(group.id)}
                            className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                          />
                          <UsersRound className="h-3.5 w-3 text-stone-400 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-sm text-stone-900 truncate block">
                              {group.name}
                            </span>
                            <span className="text-xs text-stone-500 truncate block">
                              {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </>
                )}
                </div>
              </div>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium text-stone-700 block mb-2">Display settings</Label>
            <p className="text-xs text-stone-500 mb-2">Hours and days shown in the schedule grid</p>
            <div className="flex items-center gap-2 mb-3">
              <div>
                <Label className="text-xs text-stone-600">Start</Label>
                <select
                  className="w-full mt-1 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 bg-white"
                  value={startHour}
                  onChange={(e) => setStartHour(parseInt(e.target.value, 10))}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                    </option>
                  ))}
                </select>
              </div>
              <span className="pt-5">to</span>
              <div>
                <Label className="text-xs text-stone-600">End</Label>
                <select
                  className="w-full mt-1 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 bg-white"
                  value={endHour}
                  onChange={(e) => setEndHour(parseInt(e.target.value, 10))}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
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
                      isOn ? 'bg-amber-500 text-stone-950' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || (includeSpecific && selectedIds.size === 0)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold"
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
