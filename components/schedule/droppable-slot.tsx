'use client'

import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils/cn'

export function slotDropId(dayStr: string, timeSlot: string) {
  return `slot:${dayStr}|${timeSlot}`
}

export function parseSlotDropId(id: string): { dayStr: string; timeSlot: string } | null {
  if (typeof id !== 'string' || !id.startsWith('slot:')) return null
  const rest = id.slice(5)
  const [dayStr, timeSlot] = rest.split('|')
  return dayStr && timeSlot ? { dayStr, timeSlot } : null
}

export function DroppableSlot({
  id,
  children,
  className,
}: {
  id: string
  children: React.ReactNode
  className?: string
}) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-[60px] border rounded p-1 space-y-1 transition-colors',
        isOver && 'bg-amber-50 border-amber-300 ring-2 ring-amber-200',
        className
      )}
    >
      {children}
    </div>
  )
}
