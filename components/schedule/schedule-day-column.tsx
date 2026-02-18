'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { format } from 'date-fns'
import { ShiftCard } from './shift-card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useState } from 'react'

function buildTimeSlots(startHour: number, endHour: number): string[] {
  const slots: string[] = []
  for (let h = startHour; h < endHour; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00`)
  }
  return slots
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

type Employee = {
  id: string
  user: {
    name: string | null
    email: string
  }
}

export function ScheduleDayColumn({
  day,
  dayName,
  shifts,
  employees,
  onCreateShift,
  shiftWarnings = {},
  startHour = 6,
  endHour = 22,
}: {
  day: Date
  dayName: string
  shifts: Shift[]
  employees: Employee[]
  onCreateShift: (date: Date, timeSlot: string, employeeId: string) => void
  shiftWarnings?: Record<string, { overtime?: boolean; conflict?: boolean }>
  startHour?: number
  endHour?: number
}) {
  const timeSlots = buildTimeSlots(startHour, endHour)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)

  const dayStr = format(day, 'yyyy-MM-dd')
  const { setNodeRef, isOver } = useDroppable({
    id: dayStr,
  })

  const shiftsByTime = shifts.reduce((acc, shift) => {
    const time = format(new Date(shift.startTime), 'HH:mm')
    if (!acc[time]) acc[time] = []
    acc[time].push(shift)
    return acc
  }, {} as Record<string, Shift[]>)

  const handleCreateShift = () => {
    if (selectedTimeSlot && selectedEmployee) {
      onCreateShift(day, selectedTimeSlot, selectedEmployee)
      setSelectedTimeSlot(null)
      setSelectedEmployee(null)
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={`border rounded-lg p-2 min-h-[400px] md:min-h-[600px] ${
        isOver ? 'bg-blue-50 border-blue-300' : 'bg-white'
      }`}
    >
      <div className="sticky top-0 bg-white z-10 pb-2 border-b mb-2">
        <h3 className="font-semibold text-center">{dayName}</h3>
        <p className="text-xs text-center text-stone-500">{format(day, 'MMM d')}</p>
      </div>

      <div className="space-y-2">
        {timeSlots.map((timeSlot) => {
          const slotShifts = shiftsByTime[timeSlot] || []
          const dropId = `${dayStr}|${timeSlot}`

          return (
            <div key={timeSlot} className="space-y-1">
              <div className="text-xs text-stone-500 px-1">{timeSlot}</div>
              <div className="min-h-[60px] border rounded p-1 space-y-1">
                <SortableContext items={slotShifts.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  {slotShifts.map((shift) => (
                    <ShiftCard
                      key={shift.id}
                      shift={shift}
                      hasOvertime={shiftWarnings[shift.id]?.overtime}
                      hasConflict={shiftWarnings[shift.id]?.conflict}
                    />
                  ))}
                </SortableContext>
                {slotShifts.length === 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs h-8"
                    onClick={() => setSelectedTimeSlot(timeSlot)}
                  >
                    + Add
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <Dialog open={!!selectedTimeSlot} onOpenChange={(open) => !open && setSelectedTimeSlot(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Create shift</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-stone-700 block mb-1">Time</label>
              <p className="text-stone-600">{selectedTimeSlot}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 block mb-2">Employee</label>
              <select
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-stone-900 bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                value={selectedEmployee || ''}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">Choose employee...</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.user.name || emp.user.email}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTimeSlot(null)}>
              Cancel
            </Button>
            <Button onClick={handleCreateShift} disabled={!selectedEmployee}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
