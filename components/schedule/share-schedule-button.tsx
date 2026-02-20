'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Check } from 'lucide-react'
import { toast } from 'sonner'

export function ShareScheduleButton({
  scheduleId,
  employeeId,
}: {
  scheduleId: string
  employeeId?: string | null
}) {
  const [copied, setCopied] = useState(false)

  const copyLink = (includeEmployee = false) => {
    const path = includeEmployee && employeeId ? `/p/${scheduleId}?employee=${employeeId}` : `/p/${scheduleId}`
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}${path}`
    navigator.clipboard.writeText(url).then(
      () => {
        setCopied(true)
        toast.success(includeEmployee && employeeId ? 'My schedule link copied' : 'Public link copied')
        setTimeout(() => setCopied(false), 2000)
      },
      () => toast.error('Failed to copy link')
    )
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => copyLink(false)}
        className="border-stone-200 text-stone-700 hover:bg-stone-50"
      >
        {copied ? (
          <Check className="h-4 w-4 mr-1.5 text-emerald-600" />
        ) : (
          <Share2 className="h-4 w-4 mr-1.5" />
        )}
        Copy public link
      </Button>
      {employeeId && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => copyLink(true)}
          className="border-stone-200 text-stone-700 hover:bg-stone-50"
        >
          <Share2 className="h-4 w-4 mr-1.5" />
          Copy my schedule link
        </Button>
      )}
    </div>
  )
}
