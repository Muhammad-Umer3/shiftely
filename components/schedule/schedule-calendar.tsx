'use client'

import { useState, useMemo, useEffect } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { format, addDays, startOfWeek, eachDayOfInterval } from 'date-fns'
import { ScheduleDayColumn } from './schedule-day-column'
import { ShiftCard } from './shift-card'
import { DraggableGroup, isGroupDragId, getGroupIdFromDragId } from './draggable-group'
import Link from 'next/link'
import { parseSlotDropId } from './droppable-slot'
import { Button } from '@/components/ui/button'
import { ScheduleAIDialog } from './schedule-ai-dialog'
import { Sparkles, Users, UsersRound } from 'lucide-react'
import { toast } from 'sonner'
import { getEmployeeColorClasses } from './employee-colors'
import { cn } from '@/lib/utils/cn'

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

type Employee = {
  id: string
  availabilityTemplate?: unknown
  user: {
    name: string | null
    email: string
  }
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const TIME_TO_AVAILABILITY: Record<string, string> = {
  '06:00': '6:00 AM',
  '07:00': '7:00 AM',
  '08:00': '8:00 AM',
  '09:00': '9:00 AM',
  '10:00': '10:00 AM',
  '11:00': '11:00 AM',
  '12:00': '12:00 PM',
  '13:00': '1:00 PM',
  '14:00': '2:00 PM',
  '15:00': '3:00 PM',
  '16:00': '4:00 PM',
  '17:00': '5:00 PM',
  '18:00': '6:00 PM',
  '19:00': '7:00 PM',
  '20:00': '8:00 PM',
  '21:00': '9:00 PM',
  '22:00': '10:00 PM',
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

type Schedule = {
  id: string
  scheduleShifts: {
    shift: Shift
  }[]
} | null

type Group = {
  id: string
  name: string
  members: { employee: Employee }[]
}

export function ScheduleCalendar({
  schedule,
  employees,
  displayGroupIds = [],
  weekStart,
  organizationId,
  scheduleId,
  startHour = 6,
  endHour = 22,
  workingDays = [1, 2, 3, 4, 5],
  canEdit = true,
}: {
  schedule: Schedule
  employees: Employee[]
  displayGroupIds?: string[]
  weekStart: Date
  organizationId: string
  scheduleId?: string
  startHour?: number
  endHour?: number
  workingDays?: number[]
  canEdit?: boolean
}) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeGroup, setActiveGroup] = useState<Group | null>(null)
  const [aiOpen, setAiOpen] = useState(false)
  const [allGroups, setAllGroups] = useState<Group[]>([])

  useEffect(() => {
    fetch('/api/groups')
      .then((r) => r.json())
      .then((d) => setAllGroups(d.groups ?? []))
      .catch(() => setAllGroups([]))
  }, [])

  const groupsList =
    displayGroupIds.length > 0
      ? allGroups.filter((g) => displayGroupIds.includes(g.id))
      : allGroups


  // Local shifts for optimistic updates (merge schedule + temp/pending shifts)
  const baseShifts = useMemo(
    () => schedule?.scheduleShifts.map((ss) => ss.shift) ?? [],
    [schedule?.scheduleShifts]
  )
  const [optimisticShifts, setOptimisticShifts] = useState<Shift[]>([])
  const [removedShiftIds, setRemovedShiftIds] = useState<Set<string>>(new Set())

  const allShifts = useMemo(() => {
    const base = baseShifts.filter((s) => !removedShiftIds.has(s.id))
    const extra = optimisticShifts.filter((s) => !removedShiftIds.has(s.id))
    return [...base, ...extra]
  }, [baseShifts, optimisticShifts, removedShiftIds])

  const allWeekDays = eachDayOfInterval({
    start: startOfWeek(weekStart, { weekStartsOn: 1 }),
    end: addDays(startOfWeek(weekStart, { weekStartsOn: 1 }), 6),
  })
  const weekDays = allWeekDays.filter((day) => workingDays.includes(day.getDay()))

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string
    setActiveId(id)
    if (isGroupDragId(id)) {
      const gid = getGroupIdFromDragId(id)
      setActiveGroup(groupsList.find((g) => g.id === gid) ?? null)
    } else {
      setActiveGroup(null)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setActiveGroup(null)

    if (!over) return

    const overId = String(over.id)
    let slotInfo = parseSlotDropId(overId)

    // When dropping on a shift card (sortable), derive slot from that shift
    if (!slotInfo) {
      const shift = allShifts.find((s) => s.id === overId)
      if (shift) {
        const start = new Date(shift.startTime)
        slotInfo = {
          dayStr: format(start, 'yyyy-MM-dd'),
          timeSlot: format(start, 'HH:mm'),
        }
      }
    }

    if (!slotInfo) return

    const { dayStr, timeSlot } = slotInfo
    const [y, m, d] = dayStr.split('-').map(Number)
    const targetDay = new Date(y, m - 1, d)
    const [hours, minutes] = timeSlot.split(':').map(Number)

    const startTime = new Date(targetDay)
    startTime.setHours(hours, minutes, 0, 0)

    const endTime = new Date(startTime)
    endTime.setHours(hours + 1, minutes, 0, 0)

    // Dragging group -> create shifts for all members
    if (isGroupDragId(String(active.id))) {
      const groupId = getGroupIdFromDragId(String(active.id))
      const group = groupsList.find((g) => g.id === groupId)
      if (!group || group.members.length === 0 || !canEdit) return

      const employeeIds = group.members.map((m) => m.employee.id)
      const slotShifts = allShifts.filter((s) => {
        const sDay = format(new Date(s.startTime), 'yyyy-MM-dd')
        const sTime = format(new Date(s.startTime), 'HH:mm')
        return sDay === dayStr && sTime === timeSlot
      })
      const alreadyInSlot = new Set(slotShifts.map((s) => s.employee?.id).filter(Boolean) as string[])
      const toAssign = employeeIds.filter((id) => !alreadyInSlot.has(id))

      if (toAssign.length === 0) {
        toast.error('All group members are already assigned to this slot')
        return
      }

      const tempIds = toAssign.map((_, i) => `temp-${Date.now()}-${i}`)
      const optimisticShiftsToAdd: Shift[] = toAssign.map((empId, i) => {
        const emp = employees.find((e) => e.id === empId)
        return {
          id: tempIds[i],
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          position: null,
          employee: emp ? { id: emp.id, user: { name: emp.user.name, email: emp.user.email } } : null,
        }
      })
      setOptimisticShifts((prev) => [...prev, ...optimisticShiftsToAdd])

      try {
        const response = await fetch('/api/shifts/bulk', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            organizationId,
            employeeIds: toAssign,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            scheduleId: schedule?.id ?? undefined,
          }),
        })

        const data = await response.json().catch(() => ({}))
        if (response.ok && data.shifts) {
          setOptimisticShifts((prev) =>
            prev.filter((s) => !tempIds.includes(s.id)).concat(data.shifts)
          )
          toast.success(`Added ${data.created} shift(s)`)
        } else {
          setOptimisticShifts((prev) => prev.filter((s) => !tempIds.includes(s.id)))
          toast.error(data?.message ?? 'Failed to assign group')
        }
      } catch (error) {
        console.error('Bulk shift error:', error)
        setOptimisticShifts((prev) => prev.filter((s) => !tempIds.includes(s.id)))
        toast.error('An error occurred')
      }
      return
    }

    // Dragging shift -> move shift
    const shiftId = active.id as string
    try {
      const response = await fetch('/api/shifts', {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shiftId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (response.ok) {
        window.location.reload()
      } else {
        toast.error(data?.message ?? 'Failed to update shift')
      }
    } catch (error) {
      console.error('Update shift error:', error)
      toast.error('An error occurred')
    }
  }

  const handleDeleteShift = async (shiftId: string) => {
    const isTemp = shiftId.startsWith('temp-')
    if (isTemp) {
      setOptimisticShifts((prev) => prev.filter((s) => s.id !== shiftId))
      return
    }

    setRemovedShiftIds((prev) => new Set(prev).add(shiftId))
    try {
      const response = await fetch(`/api/shifts/${shiftId}`, { method: 'DELETE' })
      if (!response.ok) {
        setRemovedShiftIds((prev) => {
          const next = new Set(prev)
          next.delete(shiftId)
          return next
        })
        toast.error('Failed to remove shift')
      } else {
        toast.success('Shift removed')
      }
    } catch (error) {
      setRemovedShiftIds((prev) => {
        const next = new Set(prev)
        next.delete(shiftId)
        return next
      })
      toast.error('An error occurred')
    }
  }

  const shiftsByDay = allShifts.reduce((acc, shift) => {
    const day = format(new Date(shift.startTime), 'yyyy-MM-dd')
    if (!acc[day]) acc[day] = []
    acc[day].push(shift)
    return acc
  }, {} as Record<string, Shift[]>)

  // Compute overtime and availability conflicts per shift
  const employeeHours: Record<string, number> = {}
  allShifts.forEach((shift) => {
    const empId = shift.employee?.id ?? 'unassigned'
    if (!employeeHours[empId]) employeeHours[empId] = 0
    employeeHours[empId] +=
      (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) /
      (1000 * 60 * 60)
  })

  const shiftWarnings: Record<string, { overtime: boolean; conflict: boolean }> = {}
  allShifts.forEach((shift) => {
    const empId = shift.employee?.id
    const overtime = empId ? (employeeHours[empId] ?? 0) > 40 : false
    let conflict = false
    if (empId) {
      const emp = employees.find((e) => e.id === empId)
      const avail = emp?.availabilityTemplate as Record<string, string[]> | null | undefined
      if (avail && Object.keys(avail).length > 0) {
        const start = new Date(shift.startTime)
        const end = new Date(shift.endTime)
        const dayName = DAY_NAMES[start.getDay() === 0 ? 6 : start.getDay() - 1]
        const daySlots = avail[dayName] ?? []
        for (let h = start.getHours(); h < end.getHours(); h++) {
          const timeKey = `${h.toString().padStart(2, '0')}:00`
          const availTime = TIME_TO_AVAILABILITY[timeKey]
          if (availTime && !daySlots.includes(availTime)) {
            conflict = true
            break
          }
        }
      }
    }
    shiftWarnings[shift.id] = { overtime, conflict }
  })

  const dayIndexToName: Record<number, string> = {
    0: 'Sun',
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat',
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4">
        {/* Groups & Employees sidebar - groups first, employees nested under each */}
        <div className="w-48 shrink-0 flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm font-medium text-stone-600 mb-1">
            <span className="flex items-center gap-1.5">
              <UsersRound className="h-4 w-4" />
              Groups
            </span>
            {canEdit && (
              <Link
                href="/employees"
                className="text-xs text-amber-600 hover:text-amber-700 hover:underline"
              >
                Manage
              </Link>
            )}
          </div>

          {groupsList.length > 0 ? (
            <div className="border border-stone-200 rounded-lg p-2 max-h-[320px] overflow-y-auto bg-stone-50/50">
              {groupsList.map((group) => (
                <DraggableGroup
                  key={group.id}
                  group={group}
                  disabled={!canEdit}
                />
              ))}
            </div>
          ) : canEdit ? (
            <Link href="/employees">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-amber-200 text-amber-700 hover:bg-amber-50"
              >
                <UsersRound className="h-4 w-4 mr-1.5" />
                Create group
              </Button>
            </Link>
          ) : null}
          {canEdit && scheduleId && (
            <Button
              onClick={() => setAiOpen(true)}
              variant="outline"
              size="sm"
              className="mt-2 border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400"
            >
              <Sparkles className="h-4 w-4 mr-1.5" />
              AI Assistant
            </Button>
          )}
        </div>

        {/* Calendar grid */}
        <div
          className="grid gap-2 md:gap-4 overflow-x-auto flex-1 min-w-0"
          style={{
            gridTemplateColumns: `repeat(${weekDays.length}, minmax(120px, 1fr))`,
          }}
        >
        {weekDays.map((day) => (
          <ScheduleDayColumn
            key={format(day, 'yyyy-MM-dd')}
            day={day}
            dayName={dayIndexToName[day.getDay()]}
            shifts={shiftsByDay[format(day, 'yyyy-MM-dd')] || []}
            onDeleteShift={handleDeleteShift}
            shiftWarnings={shiftWarnings}
            startHour={startHour}
            endHour={endHour}
            canEdit={canEdit}
          />
        ))}
        </div>
      </div>

      {scheduleId && (
        <ScheduleAIDialog
          open={aiOpen}
          onOpenChange={setAiOpen}
          scheduleId={scheduleId}
        />
      )}

      <DragOverlay>
        {activeGroup ? (
          <div className="flex items-center gap-2 text-sm text-stone-700 py-1.5 px-3 rounded-lg bg-amber-100 border border-amber-200 shadow-lg">
            <Users className="h-4 w-4 text-amber-700" />
            <span className="font-medium">{activeGroup.name}</span>
            <span className="text-xs text-stone-500">({activeGroup.members.length})</span>
          </div>
        ) : activeId ? (
          (() => {
            const draggingShift = allShifts.find((s) => s.id === activeId)
            const shiftColor = getEmployeeColorClasses(draggingShift?.employee?.id ?? null)
            return (
              <div className={cn('text-white p-2 rounded shadow-lg', shiftColor)}>
                Dragging shift...
              </div>
            )
          })()
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
