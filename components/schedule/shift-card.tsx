'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format } from 'date-fns'
import { cn } from '@/lib/utils/cn'

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

export function ShiftCard({
  shift,
  hasOvertime,
  hasConflict,
}: {
  shift: Shift
  hasOvertime?: boolean
  hasConflict?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: shift.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const showWarning = hasOvertime || hasConflict

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'p-2 rounded text-xs cursor-move hover:opacity-90',
        showWarning
          ? 'bg-amber-600 text-white ring-2 ring-red-400 ring-offset-1'
          : 'bg-blue-500 text-white hover:bg-blue-600'
      )}
      title={showWarning ? (hasOvertime && hasConflict ? 'Overtime & availability conflict' : hasOvertime ? 'Employee over 40h this week' : 'Outside availability') : undefined}
    >
      <div className="font-medium">
        {shift.employee?.user.name || shift.employee?.user.email || 'Unassigned'}
      </div>
      <div className="text-xs opacity-90">
        {format(new Date(shift.startTime), 'h:mm a')} - {format(new Date(shift.endTime), 'h:mm a')}
      </div>
      {shift.position && <div className="text-xs opacity-75">{shift.position}</div>}
    </div>
  )
}
