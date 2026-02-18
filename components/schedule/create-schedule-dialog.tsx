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
import { Users, Calendar, Search } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type Employee = {
  id: string
  user: {
    name: string | null
    email: string
    phone: string | null
  }
}

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
  const [assignSpecific, setAssignSpecific] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [employees, setEmployees] = useState<Employee[]>([])
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)

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
    setWeekStart(defaultWeekStart)
  }, [defaultWeekStart, open])

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
          assignedEmployeeIds: assignSpecific && selectedIds.size > 0 ? Array.from(selectedIds) : undefined,
        }),
      })
      const data = await res.json()

      if (res.ok) {
        if (res.status === 201 && data.schedule?.id) {
          toast.success('Schedule created successfully!')
          window.dispatchEvent(new CustomEvent('schedule-created'))
          onOpenChange(false)
          onCreated?.()
          router.push(`/dashboard/schedules/${data.schedule.id}`)
          router.refresh()
        } else if (data.existing && data.schedule?.id) {
          toast.info('Schedule already exists for this week.')
          onOpenChange(false)
          router.push(`/dashboard/schedules/${data.schedule.id}`)
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={creating || (assignSpecific && selectedIds.size === 0)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold"
          >
            {creating ? 'Creating...' : 'Create schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
