'use client'

import { useEffect, useState, useCallback } from 'react'
import { format, addDays, subDays, isSameDay } from 'date-fns'
import { ChevronLeft, ChevronRight, CalendarPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AddLeaveDialog } from './add-leave-dialog'

type Shift = { id: string; startTime: string; endTime: string; position: string | null }
type Leave = { id: string; startDate: string; endDate: string; type: string; notes: string | null }

export function EmployeeDailyView({ employeeId }: { employeeId: string }) {
  const [viewDate, setViewDate] = useState(new Date())
  const [shifts, setShifts] = useState<Shift[]>([])
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [loading, setLoading] = useState(true)
  const [addLeaveOpen, setAddLeaveOpen] = useState(false)

  const fetchData = useCallback(async () => {
    const d = format(viewDate, 'yyyy-MM-dd')
    setLoading(true)
    try {
      const [shiftsRes, leavesRes] = await Promise.all([
        fetch(`/api/employees/${employeeId}/shifts?startDate=${d}&endDate=${d}`),
        fetch(`/api/employees/${employeeId}/leaves?startDate=${d}&endDate=${d}`),
      ])

      const shiftsData = shiftsRes.ok ? (await shiftsRes.json()).shifts ?? [] : []
      const leavesData = leavesRes.ok ? (await leavesRes.json()).leaves ?? [] : []
      setShifts(shiftsData)
      setLeaves(leavesData)
    } catch {
      setShifts([])
      setLeaves([])
    } finally {
      setLoading(false)
    }
  }, [employeeId, viewDate])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const handler = () => fetchData()
    window.addEventListener('leave-updated', handler)
    return () => window.removeEventListener('leave-updated', handler)
  }, [fetchData])

  const isToday = isSameDay(viewDate, new Date())

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewDate(subDays(viewDate, 1))}
            className="border-stone-300"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className={`text-lg font-semibold min-w-[160px] text-center ${isToday ? 'text-amber-700' : 'text-stone-900'}`}>
            {format(viewDate, 'EEE, MMM d')}
            {isToday && ' (Today)'}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewDate(addDays(viewDate, 1))}
            className="border-stone-300"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAddLeaveOpen(true)}
          className="border-amber-500/50 text-amber-700 hover:bg-amber-50 hover:border-amber-500"
        >
          <CalendarPlus className="mr-2 h-4 w-4" />
          Add Leave
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-lg bg-stone-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {leaves.length > 0 && (
            leaves.map((leave) => (
              <div
                key={leave.id}
                className="p-4 rounded-lg border border-rose-200 bg-rose-50 text-rose-800"
              >
                <span className="font-medium capitalize">{leave.type}</span>
                {leave.notes && <span className="text-rose-600 ml-2">· {leave.notes}</span>}
              </div>
            ))
          )}
          {shifts.length > 0 ? (
            shifts.map((shift) => (
              <div
                key={shift.id}
                className="p-4 rounded-lg border border-amber-200 bg-amber-50 text-stone-900"
              >
                <div className="font-medium">
                  {new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                  {new Date(shift.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                {shift.position && (
                  <div className="text-sm text-stone-600 mt-0.5">{shift.position}</div>
                )}
              </div>
            ))
          ) : leaves.length === 0 && (
            <div className="p-6 rounded-lg border border-stone-200 bg-stone-50 text-center text-stone-500 text-sm">
              No shifts or leave on this day
            </div>
          )}
        </div>
      )}

      <AddLeaveDialog
        employeeId={employeeId}
        open={addLeaveOpen}
        onOpenChange={setAddLeaveOpen}
        onSuccess={fetchData}
        defaultStartDate={format(viewDate, 'yyyy-MM-dd')}
        defaultEndDate={format(viewDate, 'yyyy-MM-dd')}
      />
    </div>
  )
}
