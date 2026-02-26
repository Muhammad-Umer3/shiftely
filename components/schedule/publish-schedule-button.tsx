'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'
import { PublishScheduleDialog } from './publish-schedule-dialog'

export function PublishScheduleButton({
  scheduleId,
  disabled,
}: {
  scheduleId: string
  disabled?: boolean
}) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        disabled={disabled}
        size="lg"
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
      >
        <Send className="mr-2 h-4 w-4" />
        Publish
      </Button>
      <PublishScheduleDialog
        scheduleId={scheduleId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}
