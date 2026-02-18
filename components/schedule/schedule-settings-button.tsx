'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Settings2 } from 'lucide-react'
import { ScheduleSettingsDialog } from './schedule-settings-dialog'

export function ScheduleSettingsButton() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="border-stone-300 text-stone-700 hover:bg-amber-500/10 hover:border-amber-500/30"
      >
        <Settings2 className="mr-2 h-4 w-4" />
        Display
      </Button>
      <ScheduleSettingsDialog
        open={open}
        onOpenChange={setOpen}
        onSaved={() => router.refresh()}
      />
    </>
  )
}
