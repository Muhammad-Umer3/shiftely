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
} | null

export function ScheduleCalendar({
  schedule,
  employees,
  weekStart,
  organizationId,
}: {
  schedule: Schedule
  employees: Employee[]
  weekStart: Date
  organizationId: string
}) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const weekDays = eachDayOfInterval({
    start: startOfWeek(weekStart, { weekStartsOn: 1 }),
    end: addDays(startOfWeek(weekStart, { weekStartsOn: 1 }), 6),
  })

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

  return (
    <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2 md:gap-4 overflow-x-auto">
        {weekDays.map((day, index) => (
          <ScheduleDayColumn
            key={format(day, 'yyyy-MM-dd')}
            day={day}
            dayName={daysOfWeek[index]}
            shifts={shiftsByDay[format(day, 'yyyy-MM-dd')] || []}
            employees={employees}
            onCreateShift={createNewShift}
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
