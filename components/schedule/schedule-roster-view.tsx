'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, addDays, startOfWeek, eachDayOfInterval } from 'date-fns'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { EmployeeAvatar } from './employee-avatar'
import { toast } from 'sonner'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { CalendarOff } from 'lucide-react'
import type { TimeOffByEmployee } from './schedule-calendar'

const TIME_SLOTS = [
  { label: '6am - 10am', start: 6, end: 10 },
  { label: '9am - 1pm', start: 9, end: 13 },
  { label: '1pm - 5pm', start: 13, end: 17 },
  { label: '9am - 5pm', start: 9, end: 17 },
  { label: '5pm - 9pm', start: 17, end: 21 },
]

type Employee = {
  id: string
  user: {
    name: string | null
    email: string
  }
}

type Shift = {
  id: string
  startTime: Date
  endTime: Date
  position: string | null
  employee: {
    id: string
    user: {
      name: string | null
      email: string
    }
  } | null
}

type Schedule = {
  id: string
  scheduleShifts: {
    shift: Shift
  }[]
}


const POSITION_COLORS: Record<string, string> = {
  default: 'bg-blue-500',
  barista: 'bg-amber-600',
  manager: 'bg-emerald-600',
  cashier: 'bg-violet-600',
  server: 'bg-rose-500',
}

function getPositionColor(position: string | null): string {
  if (!position) return POSITION_COLORS.default
  const key = position.toLowerCase().replace(/\s+/g, '')
  return POSITION_COLORS[key] ?? POSITION_COLORS.default
}

const DAY_INDEX_TO_NAME: Record<number, string> = {
  0: 'Sun',
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
}

const LEAVE_TYPE_LABELS: Record<string, string> = {
  vacation: 'Vacation',
  sick: 'Sick',
  personal: 'Personal',
  unpaid: 'Unpaid',
  other: 'Other',
}

function RosterTimeOffContent({ timeOff }: { timeOff: NonNullable<TimeOffByEmployee[string]> }) {
  const leaves = timeOff.leaves ?? []
  const requests = timeOff.requests ?? []
  const all = [
    ...leaves.map((l) => ({ ...l, kind: 'Leave' as const })),
    ...requests.map((r) => ({ ...r, kind: 'Time off' as const })),
  ].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  if (all.length === 0) {
    return (
      <div className="text-xs text-stone-500 flex items-center gap-1.5">
        <CalendarOff className="h-3.5 w-3.5 shrink-0" />
        No time off this week
      </div>
    )
  }
  return (
    <div className="space-y-2 max-w-[220px]">
      <div className="font-medium text-stone-900 text-xs border-b border-stone-200 pb-1">
        Time off this week
      </div>
      <ul className="space-y-1.5 text-xs text-stone-700">
        {all.map((entry) => (
          <li key={entry.id} className="flex flex-col gap-0.5">
            <span className="font-medium capitalize">
              {LEAVE_TYPE_LABELS[entry.type] ?? entry.type}
            </span>
            <span className="text-stone-500">
              {format(new Date(entry.startDate), 'MMM d')} – {format(new Date(entry.endDate), 'MMM d')}
            </span>
            {entry.notes && (
              <span className="text-stone-500 italic truncate block">{entry.notes}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ScheduleRosterView({
  schedule,
  employees,
  weekStart,
  organizationId,
  canEdit,
  workingDays = [1, 2, 3, 4, 5],
  timeOffByEmployee = {},
}: {
  schedule: Schedule
  employees: Employee[]
  weekStart: Date
  organizationId: string
  canEdit?: boolean
  workingDays?: number[]
  timeOffByEmployee?: TimeOffByEmployee
}) {
  const router = useRouter()
  const [addModal, setAddModal] = useState<{
    date: Date
    employeeId: string
    employeeName: string
  } | null>(null)
  const [creating, setCreating] = useState(false)
  const allWeekDays = eachDayOfInterval({
    start: startOfWeek(weekStart, { weekStartsOn: 1 }),
    end: addDays(startOfWeek(weekStart, { weekStartsOn: 1 }), 6),
  })
  const weekDays = allWeekDays.filter((day) => workingDays.includes(day.getDay()))

  // Build shifts by employee and day
  const shiftsByEmployeeDay: Record<
    string,
    Record<string, Shift[]>
  > = {}

  employees.forEach((emp) => {
    shiftsByEmployeeDay[emp.id] = {}
    weekDays.forEach((day) => {
      shiftsByEmployeeDay[emp.id][format(day, 'yyyy-MM-dd')] = []
    })
  })

  schedule.scheduleShifts.forEach(({ shift }) => {
    const empId = shift.employee?.id
    if (!empId || !shiftsByEmployeeDay[empId]) return
    const dayStr = format(new Date(shift.startTime), 'yyyy-MM-dd')
    if (!shiftsByEmployeeDay[empId][dayStr]) {
      shiftsByEmployeeDay[empId][dayStr] = []
    }
    shiftsByEmployeeDay[empId][dayStr].push(shift)
  })

  const handleCreateShift = async (slot: { start: number; end: number }) => {
    if (!addModal) return
    setCreating(true)
    try {
      const startTime = new Date(addModal.date)
      startTime.setHours(slot.start, 0, 0, 0)
      const endTime = new Date(addModal.date)
      endTime.setHours(slot.end, 0, 0, 0)

      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          employeeId: addModal.employeeId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          scheduleId: schedule.id,
        }),
      })

      if (res.ok) {
        toast.success('Shift added')
        setAddModal(null)
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.message || 'Failed to add shift')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setCreating(false)
    }
  }

  // Calculate hours per employee
  const hoursByEmployee: Record<string, number> = {}
  employees.forEach((emp) => {
    let total = 0
    Object.values(shiftsByEmployeeDay[emp.id] ?? {}).forEach((shifts) => {
      shifts.forEach((s) => {
        total +=
          (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) /
          (1000 * 60 * 60)
      })
    })
    hoursByEmployee[emp.id] = total
  })

  return (
    <TooltipProvider delayDuration={400}>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 z-20 bg-stone-100 border-b border-r border-stone-200 px-4 py-3 text-left text-sm font-semibold text-stone-900">
              Employee
            </th>
            {weekDays.map((day, i) => (
              <th
                key={format(day, 'yyyy-MM-dd')}
                className="border-b border-stone-200 px-2 py-3 text-center text-sm font-semibold text-stone-700 min-w-[100px]"
              >
                <div>{DAY_INDEX_TO_NAME[day.getDay()]}</div>
                <div className="text-xs font-normal text-stone-500 mt-0.5">
                  {format(day, 'MMM d')}
                </div>
              </th>
            ))}
            <th className="border-b border-stone-200 px-3 py-3 text-right text-sm font-semibold text-stone-700">
              Hours
            </th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => {
            const hours = hoursByEmployee[emp.id] ?? 0
            const hasOvertime = hours > 40
            return (
              <tr
                key={emp.id}
                className="border-b border-stone-100 hover:bg-stone-50/50"
              >
                <td className="sticky left-0 z-10 bg-white border-r border-stone-200 px-4 py-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 cursor-help">
                        <EmployeeAvatar name={emp.user.name} email={emp.user.email} size="md" />
                        <div>
                          <p className="font-medium text-stone-900 text-sm truncate max-w-[140px]">
                            {emp.user.name || emp.user.email}
                          </p>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[240px]">
                      <RosterTimeOffContent
                        timeOff={timeOffByEmployee[emp.id] ?? { leaves: [], requests: [] }}
                      />
                    </TooltipContent>
                  </Tooltip>
                </td>
                {weekDays.map((day) => {
                  const dayStr = format(day, 'yyyy-MM-dd')
                  const shifts = shiftsByEmployeeDay[emp.id]?.[dayStr] ?? []
                  return (
                    <td
                      key={dayStr}
                      className="border-r border-stone-100 px-2 py-2 align-top min-w-[100px]"
                    >
                      <div className="space-y-1 min-h-[44px]">
                        {shifts.map((shift) => (
                          <div
                            key={shift.id}
                            className={cn(
                              'text-xs text-white px-2 py-1 rounded truncate',
                              getPositionColor(shift.position)
                            )}
                            title={`${format(new Date(shift.startTime), 'h:mm a')} - ${format(new Date(shift.endTime), 'h:mm a')}${shift.position ? ` (${shift.position})` : ''}`}
                          >
                            {format(new Date(shift.startTime), 'ha')}-
                            {format(new Date(shift.endTime), 'ha')}
                            {shift.position && (
                              <span className="opacity-90"> {shift.position}</span>
                            )}
                          </div>
                        ))}
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() =>
                              setAddModal({
                                date: day,
                                employeeId: emp.id,
                                employeeName: emp.user.name || emp.user.email,
                              })
                            }
                            className="w-full flex items-center justify-center gap-1 text-xs text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded py-1 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                            Add
                          </button>
                        )}
                      </div>
                    </td>
                  )
                })}
                <td
                  className={cn(
                    'px-3 py-2 text-right text-sm font-medium',
                    hasOvertime && 'text-red-600'
                  )}
                >
                  {hours.toFixed(1)}h
                  {hasOvertime && (
                    <span className="ml-1 text-xs text-red-500" title="Over 40h">
                      •
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <Dialog open={!!addModal} onOpenChange={(open) => !open && setAddModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add shift</DialogTitle>
          </DialogHeader>
          {addModal && (
            <div className="space-y-4">
              <p className="text-sm text-stone-600">
                {addModal.employeeName} – {format(addModal.date, 'EEE, MMM d')}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <Button
                    key={slot.label}
                    variant="outline"
                    size="sm"
                    onClick={() => handleCreateShift(slot)}
                    disabled={creating}
                    className="justify-start"
                  >
                    {slot.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModal(null)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  )
}
