'use client'

import { useDraggable } from '@dnd-kit/core'
import { EmployeeAvatar } from './employee-avatar'
import { cn } from '@/lib/utils/cn'
import { getEmployeeColor } from './employee-colors'

const EMPLOYEE_DRAG_PREFIX = 'employee:'

export function employeeDragId(empId: string, groupId?: string) {
  return groupId ? `${EMPLOYEE_DRAG_PREFIX}${groupId}:${empId}` : `${EMPLOYEE_DRAG_PREFIX}${empId}`
}

export function isEmployeeDragId(id: string): boolean {
  return typeof id === 'string' && id.startsWith(EMPLOYEE_DRAG_PREFIX)
}

/** Returns employee id from drag id (handles both "employee:empId" and "employee:groupId:empId") */
export function getEmployeeIdFromDragId(id: string): string | null {
  if (!isEmployeeDragId(id)) return null
  const rest = id.slice(EMPLOYEE_DRAG_PREFIX.length)
  const parts = rest.split(':')
  return parts.length >= 2 ? parts[1]! : parts[0] ?? null
}

type Employee = {
  id: string
  user: { name: string | null; email: string }
}

export function DraggableEmployee({
  employee,
  disabled,
  groupId,
  hoursConsumed,
  hoursAvailable,
}: {
  employee: Employee
  disabled?: boolean
  /** When inside a group, pass groupId so drag id is unique across groups */
  groupId?: string
  hoursConsumed?: number
  hoursAvailable?: number
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: employeeDragId(employee.id, groupId),
    data: { type: 'employee', employeeId: employee.id },
  })

  const color = getEmployeeColor(employee.id)
  const showBar = hoursAvailable != null && hoursAvailable > 0
  const consumed = hoursConsumed ?? 0
  const available = hoursAvailable ?? 40
  const pct = available > 0 ? Math.min(1, consumed / available) : 0

  return (
    <div
      ref={setNodeRef}
      {...(disabled ? {} : { ...attributes, ...listeners })}
      className={cn(
        'flex flex-col gap-0.5 py-1.5 px-2 rounded hover:bg-stone-100 transition-colors',
        isDragging && 'opacity-50',
        disabled && 'cursor-not-allowed opacity-60'
      )}
      title={employee.user.name || employee.user.email}
    >
      <div className={cn('flex items-center gap-2 text-sm text-stone-700 truncate cursor-grab active:cursor-grabbing', !disabled && 'cursor-grab')}>
        <div className={cn('w-1.5 h-6 rounded-full shrink-0', color.bg)} aria-hidden />
        <EmployeeAvatar name={employee.user.name} email={employee.user.email} size="sm" />
        <span className="truncate">{employee.user.name || employee.user.email}</span>
      </div>
      {showBar && (
        <div className="flex items-center gap-1.5 pl-5">
          <div className="flex-1 min-w-0 h-1.5 rounded-full bg-stone-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-500 transition-all"
              style={{ width: `${pct * 100}%` }}
            />
          </div>
          <span className="text-xs text-stone-500 shrink-0 tabular-nums">
            {Math.round(consumed)}/{Math.round(available)}
          </span>
        </div>
      )}
    </div>
  )
}
