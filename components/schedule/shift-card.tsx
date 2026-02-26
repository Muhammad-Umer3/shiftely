'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format } from 'date-fns'
import { cn } from '@/lib/utils/cn'
import { EmployeeAvatar } from './employee-avatar'
import { getEmployeeDisplayName, getEmployeeDisplayContact } from '@/lib/employees'
import { X, CalendarOff, Trash2 } from 'lucide-react'
import { getEmployeeColorClasses } from './employee-colors'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { TimeOffByEmployee } from './schedule-calendar'

type Shift = {
  id: string
  startTime: Date
  endTime: Date
  position: string | null
  employee: {
    id: string
    name?: string | null
    phone?: string | null
    user?: {
      name: string | null
      email: string
    } | null
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
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  const warningLabels: string[] = []
  if (hasOvertime) warningLabels.push('Overtime (over 40h)')
  if (hasConflict) warningLabels.push('Outside availability')
  const warningTooltipText = warningLabels.length ? warningLabels.join('; ') : undefined

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setConfirmDeleteOpen(true)
  }

  const handleConfirmDelete = () => {
    onDelete?.(shift.id)
    setConfirmDeleteOpen(false)
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
      title={warningTooltipText}
    >
      {canEdit && onDelete && (
        <button
          type="button"
          onClick={handleDeleteClick}
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
              name={getEmployeeDisplayName(shift.employee) !== 'Unnamed' ? getEmployeeDisplayName(shift.employee) : null}
              email={getEmployeeDisplayContact(shift.employee)}
              size="xs"
              className="bg-white/90 text-stone-800"
            />
            {getEmployeeDisplayName(shift.employee)}
          </>
        ) : (
          'Unassigned'
        )}
      </div>
      <div className="text-xs opacity-90">
        {format(new Date(shift.startTime), 'h:mm a')} - {format(new Date(shift.endTime), 'h:mm a')}
      </div>
      {shift.position && <div className="text-xs opacity-75">{shift.position}</div>}
      {showWarning && (
        <div className="text-[10px] opacity-90 mt-0.5 font-medium">
          {warningLabels.join(' · ')}
        </div>
      )}
    </div>
  )

  const hasTimeOff =
    timeOff && ((timeOff.leaves?.length ?? 0) > 0 || (timeOff.requests?.length ?? 0) > 0)
  const showTooltip = Boolean(warningTooltipText || hasTimeOff)
  const tooltipContent = showTooltip ? (
    <div className="space-y-2">
      {warningTooltipText && (
        <div className="text-xs font-medium text-red-700 border-b border-stone-200 pb-1.5">
          {warningTooltipText}
        </div>
      )}
      {hasTimeOff && (
        <TimeOffTooltipContent timeOff={timeOff!} />
      )}
    </div>
  ) : null

  const deleteDialog = canEdit && onDelete ? (
    <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
      <DialogContent
        className="sm:max-w-md border-stone-200 shadow-xl"
        onPointerDownOutside={(e) => e.stopPropagation()}
      >
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center gap-2 text-stone-900">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <Trash2 className="h-4 w-4" />
            </span>
            Remove this shift?
          </DialogTitle>
          <DialogDescription className="text-stone-600">
            {shift.employee
              ? 'This will unassign the shift from the schedule. You can assign someone else by dragging an employee onto a slot.'
              : 'This will unassign the shift from the schedule.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-stone-300 text-stone-700 hover:bg-stone-50"
            onClick={() => setConfirmDeleteOpen(false)}
          >
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={handleConfirmDelete}>
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : null

  if (shift.employee) {
    return (
      <>
        {showTooltip ? (
          <Tooltip>
            <TooltipTrigger asChild>{card}</TooltipTrigger>
            <TooltipContent side="top" className="max-w-[240px]">
              {tooltipContent}
            </TooltipContent>
          </Tooltip>
        ) : (
          card
        )}
        {deleteDialog}
      </>
    )
  }

  return (
    <>
      {card}
      {deleteDialog}
    </>
  )
}
