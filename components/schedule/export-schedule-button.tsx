'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function ExportScheduleButton({ scheduleId }: { scheduleId: string }) {
  const handleExport = (format: 'csv' | 'pdf') => {
    window.open(`/api/schedules/${scheduleId}/export?format=${format}`, '_blank')
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('csv')}
        className="border-stone-200 text-stone-700 hover:bg-stone-50"
      >
        <Download className="h-4 w-4 mr-1.5" />
        Export CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('pdf')}
        className="border-stone-200 text-stone-700 hover:bg-stone-50"
      >
        <Download className="h-4 w-4 mr-1.5" />
        Print / PDF
      </Button>
    </div>
  )
}
