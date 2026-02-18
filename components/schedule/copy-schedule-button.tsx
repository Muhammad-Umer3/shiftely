'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'

export function CopyScheduleButton({
  targetWeekStart,
  sourceWeekStart,
  disabled,
}: {
  targetWeekStart: string
  sourceWeekStart: string
  disabled?: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleCopy = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/schedules/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetWeekStart,
          sourceWeekStart,
        }),
      })
      const data = await res.json()

      if (res.ok) {
        toast.success(
          data.copiedCount > 0
            ? `Copied ${data.copiedCount} shifts from previous week`
            : 'No shifts to copy from previous week'
        )
        window.dispatchEvent(new CustomEvent('schedule-created'))
        router.refresh()
      } else {
        toast.error(data.message || 'Failed to copy schedule')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleCopy}
      disabled={loading || disabled}
      className="border-stone-300 text-stone-700 hover:bg-amber-500/10 hover:border-amber-500/30"
    >
      <Copy className="mr-2 h-4 w-4" />
      {loading ? 'Copying...' : 'Copy from previous week'}
    </Button>
  )
}
