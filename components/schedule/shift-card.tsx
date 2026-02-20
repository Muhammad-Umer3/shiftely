'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format } from 'date-fns'
import { cn } from '@/lib/utils/cn'
import { EmployeeAvatar } from './employee-avatar'
import { X } from 'lucide-react'
import { getEmployeeColorClasses } from './employee-colors'

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
  onDelete,
  canEdit,
}: {
  shift: Shift
  hasOvertime?: boolean
  hasConflict?: boolean
  onDelete?: (shiftId: string) => void
  canEdit?: boolean
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
  const colorClasses = getEmployeeColorClasses(shift.employee?.id ?? null)

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onDelete?.(shift.id)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'p-2 rounded text-xs cursor-move hover:opacity-90 relative text-white',
        colorClasses,
        showWarning && 'ring-2 ring-red-400 ring-offset-1'
      )}
      title={showWarning ? (hasOvertime && hasConflict ? 'Overtime & availability conflict' : hasOvertime ? 'Employee over 40h this week' : 'Outside availability') : undefined}
    >
      {canEdit && onDelete && (
        <button
          type="button"
          onClick={handleDelete}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute top-1 right-1 p-0.5 rounded opacity-70 hover:opacity-100 hover:bg-white/20 transition-opacity"
          aria-label="Remove shift"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      <div className="flex items-center gap-1.5 font-medium pr-5">
        {shift.employee ? (
          <>
            <EmployeeAvatar
              name={shift.employee.user.name}
              email={shift.employee.user.email}
              size="xs"
              className="bg-white/90 text-stone-800"
            />
            {shift.employee.user.name || shift.employee.user.email}
          </>
        ) : (
          'Unassigned'
        )}
      </div>
      <div className="text-xs opacity-90">
        {format(new Date(shift.startTime), 'h:mm a')} - {format(new Date(shift.endTime), 'h:mm a')}
      </div>
      {shift.position && <div className="text-xs opacity-75">{shift.position}</div>}
    </div>
  )
}
