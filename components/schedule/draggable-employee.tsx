'use client'

import { useDraggable } from '@dnd-kit/core'
import { EmployeeAvatar } from './employee-avatar'
import { cn } from '@/lib/utils/cn'
import { getEmployeeColor } from './employee-colors'

const EMPLOYEE_DRAG_PREFIX = 'employee:'

export function employeeDragId(empId: string) {
  return `${EMPLOYEE_DRAG_PREFIX}${empId}`
}

export function isEmployeeDragId(id: string): boolean {
  return typeof id === 'string' && id.startsWith(EMPLOYEE_DRAG_PREFIX)
}

export function getEmployeeIdFromDragId(id: string): string | null {
  if (!isEmployeeDragId(id)) return null
  return id.slice(EMPLOYEE_DRAG_PREFIX.length)
}

type Employee = {
  id: string
  user: { name: string | null; email: string }
}

export function DraggableEmployee({
  employee,
  disabled,
}: {
  employee: Employee
  disabled?: boolean
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: employeeDragId(employee.id),
    data: { type: 'employee', employeeId: employee.id },
  })

  const color = getEmployeeColor(employee.id)

  return (
    <div
      ref={setNodeRef}
      {...(disabled ? {} : { ...attributes, ...listeners })}
      className={cn(
        'flex items-center gap-2 text-sm text-stone-700 py-1.5 px-2 truncate cursor-grab active:cursor-grabbing rounded hover:bg-stone-100 transition-colors',
        isDragging && 'opacity-50',
        disabled && 'cursor-not-allowed opacity-60'
      )}
      title={employee.user.name || employee.user.email}
    >
      <div className={cn('w-1.5 h-6 rounded-full shrink-0', color.bg)} aria-hidden />
      <EmployeeAvatar name={employee.user.name} email={employee.user.email} size="sm" />
      <span className="truncate">{employee.user.name || employee.user.email}</span>
    </div>
  )
}
