'use client'

import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { format } from 'date-fns'
import { ShiftCard } from './shift-card'
import { DroppableSlot, slotDropId } from './droppable-slot'
import type { TimeOffByEmployee } from './schedule-calendar'

function buildTimeSlots(startHour: number, endHour: number, slotDurationHours: number = 1): string[] {
  const slots: string[] = []
  for (let h = startHour; h < endHour; h += slotDurationHours) {
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

const MIN_HEIGHT_PER_HOUR = 60

export function ScheduleDayColumn({
  day,
  dayName,
  shifts,
  onDeleteShift,
  shiftWarnings = {},
  startHour = 6,
  endHour = 22,
  slotDurationHours = 1,
  canEdit = true,
  timeOffByEmployee = {},
}: {
  day: Date
  dayName: string
  shifts: Shift[]
  onDeleteShift?: (shiftId: string) => void
  shiftWarnings?: Record<string, { overtime?: boolean; conflict?: boolean }>
  startHour?: number
  endHour?: number
  slotDurationHours?: number
  canEdit?: boolean
  timeOffByEmployee?: TimeOffByEmployee
}) {
  const timeSlots = buildTimeSlots(startHour, endHour, slotDurationHours)
  const dayStr = format(day, 'yyyy-MM-dd')
  const slotMinHeight = slotDurationHours * MIN_HEIGHT_PER_HOUR

  const shiftsByTime = shifts.reduce((acc, shift) => {
    const shiftStart = new Date(shift.startTime)
    const shiftHour = shiftStart.getHours() + shiftStart.getMinutes() / 60
    const slotStartHour = Math.floor((shiftHour - startHour) / slotDurationHours) * slotDurationHours + startHour
    const time = `${slotStartHour.toString().padStart(2, '0')}:00`
    if (!timeSlots.includes(time)) return acc
    if (!acc[time]) acc[time] = []
    acc[time].push(shift)
    return acc
  }, {} as Record<string, Shift[]>)

  return (
    <div className="border rounded-lg p-2 min-h-[400px] md:min-h-[600px] bg-white">
      <div className="sticky top-0 bg-white z-10 pb-2 border-b mb-2">
        <h3 className="font-semibold text-center">{dayName}</h3>
        <p className="text-xs text-center text-stone-500">{format(day, 'MMM d')}</p>
      </div>

      <div className="space-y-2">
        {timeSlots.map((timeSlot) => {
          const slotShifts = shiftsByTime[timeSlot] || []
          const dropId = `${dayStr}|${timeSlot}`

          return (
            <div key={timeSlot} className="space-y-1" style={{ minHeight: slotMinHeight }}>
              <div className="text-xs text-stone-500 px-1">{timeSlot}</div>
              <DroppableSlot id={slotDropId(dayStr, timeSlot)}>
                <SortableContext items={slotShifts.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  {slotShifts.map((shift) => (
                    <ShiftCard
                      key={shift.id}
                      shift={shift}
                      hasOvertime={shiftWarnings[shift.id]?.overtime}
                      hasConflict={shiftWarnings[shift.id]?.conflict}
                      onDelete={onDeleteShift}
                      canEdit={canEdit}
                      timeOff={shift.employee ? timeOffByEmployee[shift.employee.id] : undefined}
                    />
                  ))}
                </SortableContext>
                {slotShifts.length === 0 && (
                  <div className="min-h-[2rem] rounded border border-dashed border-stone-200 bg-stone-50/30" />
                )}
              </DroppableSlot>
            </div>
          )
        })}
      </div>
    </div>
  )
}
