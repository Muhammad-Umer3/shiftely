'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format } from 'date-fns'

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

export function ShiftCard({ shift }: { shift: Shift }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: shift.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-blue-500 text-white p-2 rounded text-xs cursor-move hover:bg-blue-600"
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
