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
import { Users, Search } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DEFAULT_DISPLAY = { startHour: 6, endHour: 22, workingDays: [1, 2, 3, 4, 5] }

type DisplaySettings = {
  startHour: number
  endHour: number
  workingDays: number[]
}

type Employee = {
  id: string
  user: {
    name: string | null
    email: string
    phone: string | null
  }
}

export function EditScheduleDialog({
  open,
  onOpenChange,
  scheduleId,
  initialName,
  initialAssignedIds,
  initialDisplaySettings,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  scheduleId: string
  initialName: string | null
  initialAssignedIds: string[]
  initialDisplaySettings?: DisplaySettings | null
  onSaved?: () => void
}) {
  const router = useRouter()
  const defaults = initialDisplaySettings ?? DEFAULT_DISPLAY
  const [name, setName] = useState(initialName ?? '')
  const [assignSpecific, setAssignSpecific] = useState(initialAssignedIds.length > 0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialAssignedIds))
  const [startHour, setStartHour] = useState(defaults.startHour)
  const [endHour, setEndHour] = useState(defaults.endHour)
  const [workingDays, setWorkingDays] = useState<number[]>(defaults.workingDays)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const filteredEmployees = employees.filter((emp) => {
    const q = employeeSearch.toLowerCase().trim()
    if (!q) return true
    const name = (emp.user.name || '').toLowerCase()
    const email = (emp.user.email || '').toLowerCase()
    const phone = (emp.user.phone || '').replace(/\D/g, '')
    const qDigits = q.replace(/\D/g, '')
    return name.includes(q) || email.includes(q) || (qDigits && phone.includes(qDigits))
  })

  useEffect(() => {
    setName(initialName ?? '')
    setAssignSpecific(initialAssignedIds.length > 0)
    setSelectedIds(new Set(initialAssignedIds))
    const d = initialDisplaySettings ?? DEFAULT_DISPLAY
    setStartHour(d.startHour)
    setEndHour(d.endHour)
    setWorkingDays(Array.isArray(d.workingDays) ? d.workingDays : DEFAULT_DISPLAY.workingDays)
  }, [initialName, initialAssignedIds, initialDisplaySettings, open])

  useEffect(() => {
    if (open) {
      setLoading(true)
      fetch('/api/employees')
        .then((r) => r.json())
        .then((d) => {
          setEmployees(d.employees ?? [])
        })
        .catch(() => setEmployees([]))
        .finally(() => setLoading(false))
    }
  }, [open])

  const handleToggleEmployee = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSelectAll = () => {
    const target = filteredEmployees
    const allSelected = target.length > 0 && target.every((e) => selectedIds.has(e.id))
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        target.forEach((e) => next.delete(e.id))
        return next
      })
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        target.forEach((e) => next.add(e.id))
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
          assignedEmployeeIds: assignSpecific ? Array.from(selectedIds) : [],
          displaySettings: { startHour, endHour, workingDays },
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
                checked={assignSpecific}
                onChange={(e) => setAssignSpecific(e.target.checked)}
                className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
              />
              Assign specific teammates
            </label>
            <p className="text-xs text-stone-500 mt-1">
              {assignSpecific
                ? 'Only selected teammates will appear in this schedule'
                : 'All teammates will appear in this schedule'}
            </p>

            {assignSpecific && (
              <div className="mt-3 border border-stone-200 rounded-lg p-3 space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search by name or phone..."
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm border border-stone-200 rounded-lg text-stone-900 bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div className="max-h-[180px] overflow-y-auto space-y-2">
                {loading ? (
                  <p className="text-sm text-stone-500">Loading...</p>
                ) : employees.length === 0 ? (
                  <p className="text-sm text-stone-500">No employees yet</p>
                ) : filteredEmployees.length === 0 ? (
                  <p className="text-sm text-stone-500">No employees match your search</p>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                    >
                      {filteredEmployees.length > 0 && filteredEmployees.every((e) => selectedIds.has(e.id))
                        ? 'Deselect all'
                        : 'Select all'}
                    </button>
                    <div className="space-y-1.5">
                      {filteredEmployees.map((emp) => (
                        <label
                          key={emp.id}
                          className={cn(
                            'flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer hover:bg-stone-50',
                            selectedIds.has(emp.id) && 'bg-amber-50'
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.has(emp.id)}
                            onChange={() => handleToggleEmployee(emp.id)}
                            className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                          />
                          <Users className="h-3.5 w-3 text-stone-400 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-sm text-stone-900 truncate block">
                              {emp.user.name || emp.user.email}
                            </span>
                            {emp.user.phone && (
                              <span className="text-xs text-stone-500 truncate block">
                                {emp.user.phone}
                              </span>
                            )}
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
            disabled={saving || (assignSpecific && selectedIds.size === 0)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold"
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
