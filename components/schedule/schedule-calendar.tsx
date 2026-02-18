'use client'

import { useState } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { format, addDays, startOfWeek, eachDayOfInterval } from 'date-fns'
import { ScheduleDayColumn } from './schedule-day-column'
import { ShiftCard } from './shift-card'
import { Button } from '@/components/ui/button'

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

type Employee = {
  id: string
  availabilityTemplate?: unknown
  user: {
    name: string | null
    email: string
  }
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const TIME_TO_AVAILABILITY: Record<string, string> = {
  '06:00': '6:00 AM',
  '07:00': '7:00 AM',
  '08:00': '8:00 AM',
  '09:00': '9:00 AM',
  '10:00': '10:00 AM',
  '11:00': '11:00 AM',
  '12:00': '12:00 PM',
  '13:00': '1:00 PM',
  '14:00': '2:00 PM',
  '15:00': '3:00 PM',
  '16:00': '4:00 PM',
  '17:00': '5:00 PM',
  '18:00': '6:00 PM',
  '19:00': '7:00 PM',
  '20:00': '8:00 PM',
  '21:00': '9:00 PM',
  '22:00': '10:00 PM',
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
} | null

export function ScheduleCalendar({
  schedule,
  employees,
  weekStart,
  organizationId,
  startHour = 6,
  endHour = 22,
  workingDays = [1, 2, 3, 4, 5],
}: {
  schedule: Schedule
  employees: Employee[]
  weekStart: Date
  organizationId: string
  startHour?: number
  endHour?: number
  workingDays?: number[]
}) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const allWeekDays = eachDayOfInterval({
    start: startOfWeek(weekStart, { weekStartsOn: 1 }),
    end: addDays(startOfWeek(weekStart, { weekStartsOn: 1 }), 6),
  })
  const weekDays = allWeekDays.filter((day) => workingDays.includes(day.getDay()))

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const shiftId = active.id as string
    const targetDate = over.id as string

    // Parse target date and create shift time
    const [dateStr, timeSlot] = targetDate.split('|')
    const targetDay = new Date(dateStr)
    const [hours, minutes] = timeSlot.split(':').map(Number)

    const startTime = new Date(targetDay)
    startTime.setHours(hours, minutes, 0, 0)

    const endTime = new Date(startTime)
    endTime.setHours(hours + 4, minutes, 0, 0) // Default 4-hour shift

    try {
      const response = await fetch('/api/shifts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shiftId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        }),
      })

      if (!response.ok) {
        alert('Failed to update shift')
      } else {
        window.location.reload()
      }
    } catch (error) {
      alert('An error occurred')
    }
  }

  const createNewShift = async (date: Date, timeSlot: string, employeeId: string) => {
    const [hours, minutes] = timeSlot.split(':').map(Number)
    const startTime = new Date(date)
    startTime.setHours(hours, minutes, 0, 0)

    const endTime = new Date(startTime)
    endTime.setHours(hours + 4, minutes, 0, 0)

    try {
      const response = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          employeeId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          scheduleId: schedule?.id,
        }),
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert('Failed to create shift')
      }
    } catch (error) {
      alert('An error occurred')
    }
  }

  const shiftsByDay = schedule?.scheduleShifts.reduce((acc, ss) => {
    const day = format(new Date(ss.shift.startTime), 'yyyy-MM-dd')
    if (!acc[day]) acc[day] = []
    acc[day].push(ss.shift)
    return acc
  }, {} as Record<string, Shift[]>) || {}

  // Compute overtime and availability conflicts per shift
  const employeeHours: Record<string, number> = {}
  schedule?.scheduleShifts.forEach(({ shift }) => {
    const empId = shift.employee?.id ?? 'unassigned'
    if (!employeeHours[empId]) employeeHours[empId] = 0
    employeeHours[empId] +=
      (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) /
      (1000 * 60 * 60)
  })

  const shiftWarnings: Record<string, { overtime: boolean; conflict: boolean }> = {}
  schedule?.scheduleShifts.forEach(({ shift }) => {
    const empId = shift.employee?.id
    const overtime = empId ? (employeeHours[empId] ?? 0) > 40 : false
    let conflict = false
    if (empId) {
      const emp = employees.find((e) => e.id === empId)
      const avail = emp?.availabilityTemplate as Record<string, string[]> | null | undefined
      if (avail && Object.keys(avail).length > 0) {
        const start = new Date(shift.startTime)
        const end = new Date(shift.endTime)
        const dayName = DAY_NAMES[start.getDay() === 0 ? 6 : start.getDay() - 1]
        const daySlots = avail[dayName] ?? []
        for (let h = start.getHours(); h < end.getHours(); h++) {
          const timeKey = `${h.toString().padStart(2, '0')}:00`
          const availTime = TIME_TO_AVAILABILITY[timeKey]
          if (availTime && !daySlots.includes(availTime)) {
            conflict = true
            break
          }
        }
      }
    }
    shiftWarnings[shift.id] = { overtime, conflict }
  })

  const dayIndexToName: Record<number, string> = {
    0: 'Sun',
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat',
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div
        className="grid gap-2 md:gap-4 overflow-x-auto"
        style={{
          gridTemplateColumns: `repeat(${weekDays.length}, minmax(120px, 1fr))`,
        }}
      >
        {weekDays.map((day) => (
          <ScheduleDayColumn
            key={format(day, 'yyyy-MM-dd')}
            day={day}
            dayName={dayIndexToName[day.getDay()]}
            shifts={shiftsByDay[format(day, 'yyyy-MM-dd')] || []}
            employees={employees}
            onCreateShift={createNewShift}
            shiftWarnings={shiftWarnings}
            startHour={startHour}
            endHour={endHour}
          />
        ))}
      </div>
      <DragOverlay>
        {activeId ? (
          <div className="bg-blue-500 text-white p-2 rounded shadow-lg">
            Dragging shift...
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
