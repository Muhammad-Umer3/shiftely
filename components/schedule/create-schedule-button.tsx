'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CreateScheduleDialog } from './create-schedule-dialog'

export function CreateScheduleButton({ weekStart }: { weekStart: string }) {
  const [open, setOpen] = useState(false)
  const [dialogWeek, setDialogWeek] = useState(weekStart)

  useEffect(() => {
    setDialogWeek(weekStart)
  }, [weekStart])

  useEffect(() => {
    const handler = (e: CustomEvent<{ weekStart: string }>) => {
      setDialogWeek(e.detail?.weekStart ?? weekStart)
      setOpen(true)
    }
    window.addEventListener('open-create-schedule', handler as EventListener)
    return () => window.removeEventListener('open-create-schedule', handler as EventListener)
  }, [weekStart])

  return (
    <>
      <Button
        onClick={() => {
          setDialogWeek(weekStart)
          setOpen(true)
        }}
        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold"
      >
        <Plus className="mr-2 h-4 w-4" />
        Create Schedule
      </Button>
      <CreateScheduleDialog
        open={open}
        onOpenChange={setOpen}
        defaultWeekStart={dialogWeek}
      />
    </>
  )
}
