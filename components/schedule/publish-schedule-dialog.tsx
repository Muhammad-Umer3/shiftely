'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Send, Plus, Minus, ArrowRight, Loader2, FileCheck } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { cn } from '@/lib/utils/cn'

type DiffItem = {
  shiftId: string
  employeeName: string
  dateStr: string
  timeStr: string
  position: string | null
}

type ChangedItem = {
  shiftId: string
  dateStr: string
  before: { employeeName: string; timeStr: string; position: string | null }
  after: { employeeName: string; timeStr: string; position: string | null }
}

type PublishDiff = {
  isFirstPublish: boolean
  lastVersion: number | null
  added: DiffItem[]
  removed: DiffItem[]
  changed: ChangedItem[]
  summary: { addedCount: number; removedCount: number; changedCount: number }
}

function formatDateStr(s: string) {
  try {
    return format(new Date(s + 'T12:00:00'), 'EEE, MMM d')
  } catch {
    return s
  }
}

export function PublishScheduleDialog({
  scheduleId,
  open,
  onOpenChange,
  onPublished,
}: {
  scheduleId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onPublished?: () => void
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [diff, setDiff] = useState<PublishDiff | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && scheduleId) {
      setLoading(true)
      setError(null)
      fetch(`/api/schedules/${scheduleId}/publish-diff`)
        .then((res) => res.json())
        .then((data) => {
          if (data.message && !data.isFirstPublish && data.added === undefined) {
            setError(data.message)
            setDiff(null)
          } else {
            setDiff(data)
          }
        })
        .catch(() => {
          setError('Failed to load changes')
          setDiff(null)
        })
        .finally(() => setLoading(false))
    }
  }, [open, scheduleId])

  const handlePublish = async () => {
    setPublishing(true)
    try {
      const res = await fetch(`/api/schedules/${scheduleId}/publish`, { method: 'POST' })
      const data = await res.json()

      if (res.ok) {
        toast.success('Schedule published! Employees with changed shifts have been notified.')
        onOpenChange(false)
        onPublished?.()
        router.refresh()
      } else {
        toast.error(data.message || 'Failed to publish schedule')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setPublishing(false)
    }
  }

  const hasChanges =
    diff &&
    (diff.summary.addedCount > 0 || diff.summary.removedCount > 0 || diff.summary.changedCount > 0)
  const isEmpty = diff && !hasChanges && !diff.isFirstPublish

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Review changes before publishing</DialogTitle>
          <DialogDescription>
            Confirm the changes below. Employees with modified shifts will be notified after you publish.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 py-2 -mx-1 px-1">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          )}

          {error && !loading && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 text-sm">
              {error}
            </div>
          )}

          {diff && !loading && !error && (
            <div className="space-y-6">
              {diff.isFirstPublish && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
                  <FileCheck className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900">First publish</p>
                    <p className="text-sm text-amber-800 mt-1">
                      {diff.added.length === 0
                        ? 'This schedule has never been published. Publishing will make it live.'
                        : `This schedule has never been published. All ${diff.added.length} shift(s) will go live.`}
                    </p>
                  </div>
                </div>
              )}

              {isEmpty && (
                <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-stone-600 text-sm">
                  No changes detected. The schedule matches the last published version.
                </div>
              )}

              {hasChanges && (
                <>
                  {diff.added.length > 0 && (
                    <section>
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-700 mb-2">
                        <Plus className="h-4 w-4" />
                        Added ({diff.added.length})
                      </h3>
                      <div className="space-y-1.5">
                        {diff.added.map((item) => (
                          <div
                            key={item.shiftId}
                            className="flex items-center justify-between gap-4 py-2 px-3 rounded-lg bg-emerald-50 border border-emerald-200"
                          >
                            <div>
                              <span className="font-medium text-stone-900">{item.employeeName}</span>
                              <span className="text-stone-600 text-sm ml-2">
                                {item.position || 'Shift'}
                              </span>
                            </div>
                            <div className="text-sm text-stone-600 shrink-0">
                              {formatDateStr(item.dateStr)} · {item.timeStr}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {diff.removed.length > 0 && (
                    <section>
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-rose-700 mb-2">
                        <Minus className="h-4 w-4" />
                        Removed ({diff.removed.length})
                      </h3>
                      <div className="space-y-1.5">
                        {diff.removed.map((item) => (
                          <div
                            key={item.shiftId}
                            className="flex items-center justify-between gap-4 py-2 px-3 rounded-lg bg-rose-50 border border-rose-200"
                          >
                            <div>
                              <span className="font-medium text-stone-900 line-through">
                                {item.employeeName}
                              </span>
                              <span className="text-stone-600 text-sm ml-2 line-through">
                                {item.position || 'Shift'}
                              </span>
                            </div>
                            <div className="text-sm text-stone-500 shrink-0 line-through">
                              {formatDateStr(item.dateStr)} · {item.timeStr}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {diff.changed.length > 0 && (
                    <section>
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-700 mb-2">
                        <ArrowRight className="h-4 w-4" />
                        Changed ({diff.changed.length})
                      </h3>
                      <div className="space-y-2">
                        {diff.changed.map((item) => (
                          <div
                            key={item.shiftId}
                            className="rounded-lg border border-amber-200 bg-amber-50/50 overflow-hidden"
                          >
                            <div className="px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-100">
                              {formatDateStr(item.dateStr)}
                            </div>
                            <div className="grid grid-cols-2 gap-2 p-3">
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-stone-500 uppercase tracking-wide">
                                  Before
                                </div>
                                <div
                                  className={cn(
                                    'text-sm',
                                    item.before.employeeName !== item.after.employeeName &&
                                      'line-through text-rose-600'
                                  )}
                                >
                                  {item.before.employeeName}
                                </div>
                                <div
                                  className={cn(
                                    'text-xs text-stone-600',
                                    (item.before.timeStr !== item.after.timeStr ||
                                      item.before.position !== item.after.position) &&
                                      'line-through text-rose-600'
                                  )}
                                >
                                  {item.before.timeStr}
                                  {item.before.position && ` · ${item.before.position}`}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-amber-800 uppercase tracking-wide">
                                  After
                                </div>
                                <div
                                  className={cn(
                                    'text-sm font-medium',
                                    item.before.employeeName !== item.after.employeeName &&
                                      'text-emerald-700'
                                  )}
                                >
                                  {item.after.employeeName}
                                </div>
                                <div
                                  className={cn(
                                    'text-xs text-stone-600',
                                    (item.before.timeStr !== item.after.timeStr ||
                                      item.before.position !== item.after.position) &&
                                      'text-emerald-700'
                                  )}
                                >
                                  {item.after.timeStr}
                                  {item.after.position && ` · ${item.after.position}`}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 border-t border-stone-200 pt-4 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-stone-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePublish}
            disabled={loading || publishing || !!error}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {publishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Confirm & Publish
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
