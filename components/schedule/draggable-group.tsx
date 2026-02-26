'use client'

import { useDraggable } from '@dnd-kit/core'
import { cn } from '@/lib/utils/cn'
import { Users } from 'lucide-react'
import { DraggableEmployee } from './draggable-employee'

const GROUP_DRAG_PREFIX = 'group:'

export function groupDragId(groupId: string) {
  return `${GROUP_DRAG_PREFIX}${groupId}`
}

export function isGroupDragId(id: string): boolean {
  return typeof id === 'string' && id.startsWith(GROUP_DRAG_PREFIX)
}

export function getGroupIdFromDragId(id: string): string | null {
  if (!isGroupDragId(id)) return null
  return id.slice(GROUP_DRAG_PREFIX.length)
}

export type GroupEmployee = {
  id: string
  name?: string | null
  phone?: string | null
  user?: { name: string | null; email: string } | null
}

export type Group = {
  id: string
  name: string
  members: { employee: GroupEmployee }[]
}

export function DraggableGroup({
  group,
  disabled,
  employeeAvailability,
}: {
  group: Group
  disabled?: boolean
  employeeAvailability?: Record<string, { consumed: number; available: number }>
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: groupDragId(group.id),
    data: { type: 'group', groupId: group.id, employeeIds: group.members.map((m) => m.employee.id) },
  })

  return (
    <div className="rounded border border-amber-200/80 bg-amber-50/50 overflow-hidden">
      <div
        ref={setNodeRef}
        {...(disabled ? {} : { ...attributes, ...listeners })}
        className={cn(
          'flex items-center gap-2 text-sm text-stone-700 py-1.5 px-2 truncate cursor-grab active:cursor-grabbing rounded-t hover:bg-amber-100/50 transition-colors',
          isDragging && 'opacity-50',
          disabled && 'cursor-not-allowed opacity-60'
        )}
        title={`${group.name} (${group.members.length} members) – drag to assign all`}
      >
        <div className="w-6 h-6 rounded bg-amber-100 flex items-center justify-center shrink-0">
          <Users className="h-3.5 w-3.5 text-amber-700" />
        </div>
        <span className="truncate font-medium">{group.name}</span>
        <span className="text-xs text-stone-500 shrink-0">({group.members.length})</span>
      </div>
      <div className="border-t border-amber-200/60 bg-white/50 pl-2 pr-1 py-1 space-y-0.5">
        {group.members.map(({ employee }) => {
          const avail = employeeAvailability?.[employee.id]
          return (
            <DraggableEmployee
              key={employee.id}
              employee={employee}
              disabled={disabled}
              groupId={group.id}
              hoursConsumed={avail?.consumed}
              hoursAvailable={avail?.available}
            />
          )
        })}
      </div>
    </div>
  )
}
