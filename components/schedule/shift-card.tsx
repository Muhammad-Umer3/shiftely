'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format } from 'date-fns'
import { cn } from '@/lib/utils/cn'
import { EmployeeAvatar } from './employee-avatar'
import { X, CalendarOff } from 'lucide-react'
import { getEmployeeColorClasses } from './employee-colors'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { TimeOffByEmployee } from './schedule-calendar'

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

const LEAVE_TYPE_LABELS: Record<string, string> = {
  vacation: 'Vacation',
  sick: 'Sick',
  personal: 'Personal',
  unpaid: 'Unpaid',
  other: 'Other',
}

function TimeOffTooltipContent({
  timeOff,
}: {
  timeOff: NonNullable<TimeOffByEmployee[string]>
}) {
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

export function ShiftCard({
  shift,
  hasOvertime,
  hasConflict,
  onDelete,
  canEdit,
  timeOff,
}: {
  shift: Shift
  hasOvertime?: boolean
  hasConflict?: boolean
  onDelete?: (shiftId: string) => void
  canEdit?: boolean
  timeOff?: TimeOffByEmployee[string]
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

  const card = (
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

  if (shift.employee) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{card}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-[240px]">
          <TimeOffTooltipContent
            timeOff={timeOff ?? { leaves: [], requests: [] }}
          />
        </TooltipContent>
      </Tooltip>
    )
  }

  return card
}
