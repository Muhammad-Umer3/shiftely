'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { format } from 'date-fns'
import { ShiftCard } from './shift-card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const timeSlots = [
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
]

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
}: {
  day: Date
  dayName: string
  shifts: Shift[]
  employees: Employee[]
  onCreateShift: (date: Date, timeSlot: string, employeeId: string) => void
}) {
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
        <p className="text-xs text-center text-muted-foreground">{format(day, 'MMM d')}</p>
      </div>

      <div className="space-y-2">
        {timeSlots.map((timeSlot) => {
          const slotShifts = shiftsByTime[timeSlot] || []
          const dropId = `${dayStr}|${timeSlot}`

          return (
            <div key={timeSlot} className="space-y-1">
              <div className="text-xs text-muted-foreground px-1">{timeSlot}</div>
              <div className="min-h-[60px] border rounded p-1 space-y-1">
                <SortableContext items={slotShifts.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  {slotShifts.map((shift) => (
                    <ShiftCard key={shift.id} shift={shift} />
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

      {selectedTimeSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg space-y-4 min-w-[300px]">
            <h3 className="font-semibold">Create Shift</h3>
            <div>
              <label className="text-sm font-medium">Time: {selectedTimeSlot}</label>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Select Employee:</label>
              <select
                className="w-full border rounded p-2"
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
            <div className="flex gap-2">
              <Button onClick={handleCreateShift} disabled={!selectedEmployee}>
                Create
              </Button>
              <Button variant="outline" onClick={() => setSelectedTimeSlot(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
