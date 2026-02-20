'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { EditScheduleDialog } from './edit-schedule-dialog'

type DisplaySettings = {
  startHour: number
  endHour: number
  workingDays: number[]
  displayGroupIds?: string[]
}

export function EditScheduleButton({
  scheduleId,
  name,
  displayGroupIds,
  displaySettings,
}: {
  scheduleId: string
  name: string | null
  displayGroupIds: string[]
  displaySettings?: DisplaySettings | null
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-stone-600 border-stone-200 hover:bg-stone-50"
      >
        <Pencil className="h-3.5 w-3 mr-1.5" />
        Edit schedule
      </Button>
      <EditScheduleDialog
        open={open}
        onOpenChange={setOpen}
        scheduleId={scheduleId}
        initialName={name}
        initialDisplayGroupIds={displayGroupIds}
        initialDisplaySettings={displaySettings}
      />
    </>
  )
}
