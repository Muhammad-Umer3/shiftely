'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ArrowLeftRight } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

type Shift = {
  slotId: string
  startTime: string
  endTime: string
  position: string | null
  scheduleName: string
}

type Employee = {
  id: string
  user: { id: string; name: string | null; email: string }
}

export function RequestSwapDialog({ currentUserId }: { currentUserId: string }) {
  const [open, setOpen] = useState(false)
  const [shifts, setShifts] = useState<Shift[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedSlotId, setSelectedSlotId] = useState<string>('')
  const [targetUserId, setTargetUserId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (open) {
      setFetching(true)
      Promise.all([
        fetch('/api/me/shifts?days=14').then((r) => r.json()),
        fetch('/api/employees').then((r) => r.json()),
      ])
        .then(([shiftsRes, employeesRes]) => {
          setShifts(shiftsRes.shifts ?? [])
          const emps = (employeesRes.employees ?? []).filter(
            (e: Employee) => e.user?.id && e.user.id !== currentUserId
          )
          setEmployees(emps)
          setSelectedSlotId(shiftsRes.shifts?.[0]?.slotId ?? '')
          setTargetUserId('')
        })
        .catch(() => {
          setShifts([])
          setEmployees([])
        })
        .finally(() => setFetching(false))
    }
  }, [open, currentUserId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSlotId) {
      toast.error('Please select a shift to swap')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/swaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: selectedSlotId,
          targetEmployeeId: targetUserId || null,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Swap request sent')
        setOpen(false)
        window.location.reload()
      } else {
        toast.error(data.message || 'Failed to request swap')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-medium">
          <ArrowLeftRight className="h-4 w-4 mr-2" />
          Request swap
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request a shift swap</DialogTitle>
          <DialogDescription>
            Select a shift you want to swap and optionally choose a coworker to swap with.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fetching ? (
            <div className="py-6 text-center text-stone-500">Loading your shifts...</div>
          ) : shifts.length === 0 ? (
            <div className="py-6 text-center text-stone-500">
              You have no upcoming shifts in the next 14 days.
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Shift to swap</Label>
                <select
                  value={selectedSlotId}
                  onChange={(e) => setSelectedSlotId(e.target.value)}
                  className="w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {shifts.map((s) => (
                    <option key={s.slotId} value={s.slotId}>
                      {format(new Date(s.startTime), 'EEE, MMM d')} –{' '}
                      {format(new Date(s.startTime), 'h:mm a')} to{' '}
                      {format(new Date(s.endTime), 'h:mm a')}
                      {s.position && ` (${s.position})`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Swap with (optional)</Label>
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Anyone available</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.user.id}>
                      {emp.user.name || emp.user.email}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-stone-500">
                  Leave as &quot;Anyone available&quot; to post an open swap request.
                </p>
              </div>
            </>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || shifts.length === 0}
              className="bg-amber-500 hover:bg-amber-600 text-stone-950"
            >
              {loading ? 'Sending...' : 'Request swap'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
