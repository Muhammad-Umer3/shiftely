'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { Download, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function ExportScheduleButton({ scheduleId }: { scheduleId: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleExport = (format: 'csv' | 'pdf') => {
    setOpen(false)
    window.open(`/api/schedules/${scheduleId}/export?format=${format}`, '_blank')
  }

  return (
    <TooltipProvider>
      <div className="relative" ref={ref}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen((o) => !o)}
          className="border-stone-200 text-stone-700 hover:bg-stone-50 gap-1.5"
        >
          <Download className="h-4 w-4" />
          Export
          <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
        </Button>
        {open && (
          <div className="absolute right-0 top-full mt-1 z-50 min-w-[180px] rounded-md border border-stone-200 bg-white py-1 shadow-lg">
            <button
              type="button"
              onClick={() => handleExport('csv')}
              className="w-full px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2"
            >
              <Download className="h-4 w-4 shrink-0" />
              Download CSV
            </button>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => handleExport('pdf')}
                  className="w-full px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                >
                  <Download className="h-4 w-4 shrink-0" />
                  Print or save as PDF
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-[220px]">
                Opens a print-friendly view; use your browser’s Save as PDF when printing.
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
