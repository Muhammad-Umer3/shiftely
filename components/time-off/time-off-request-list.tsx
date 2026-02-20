'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { cn } from '@/lib/utils/cn'

type Request = {
  id: string
  startDate: string
  endDate: string
  type: string
  notes: string | null
  status: string
  employee?: { user: { name: string | null; email: string } }
  approver?: { name: string | null; email: string } | null
}

const TYPE_LABELS: Record<string, string> = {
  vacation: 'Vacation',
  sick: 'Sick',
  personal: 'Personal',
  unpaid: 'Unpaid',
  other: 'Other',
}

export function TimeOffRequestList({
  canApprove,
  currentUserId,
}: {
  canApprove: boolean
  currentUserId: string
}) {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/time-off?scope=all')
      .then((r) => r.json())
      .then((d) => setRequests(d.requests ?? []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false))
  }, [])

  const handleApprove = async (id: string) => {
    setProcessing(id)
    try {
      const res = await fetch(`/api/time-off/${id}/approve`, { method: 'POST' })
      if (res.ok) window.location.reload()
      else alert((await res.json()).message || 'Failed')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (id: string) => {
    setProcessing(id)
    try {
      const res = await fetch(`/api/time-off/${id}/reject`, { method: 'POST' })
      if (res.ok) window.location.reload()
      else alert((await res.json()).message || 'Failed')
    } finally {
      setProcessing(null)
    }
  }

  if (loading) return <div className="text-stone-500">Loading...</div>
  if (requests.length === 0) return <p className="text-stone-600">No time-off requests</p>

  return (
    <div className="space-y-3">
      {requests.map((r) => (
        <div
          key={r.id}
          className={cn(
            'rounded-lg border p-4',
            r.status === 'PENDING'
              ? 'border-amber-200 bg-amber-50/30'
              : 'border-stone-200 bg-white'
          )}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              {r.employee && (
                <p className="font-medium text-stone-900">
                  {r.employee.user.name || r.employee.user.email}
                </p>
              )}
              <p className="text-sm text-stone-600">
                {format(new Date(r.startDate), 'MMM d')} – {format(new Date(r.endDate), 'MMM d')} ·{' '}
                {TYPE_LABELS[r.type] || r.type}
              </p>
              {r.notes && (
                <p className="text-xs text-stone-500 mt-1">{r.notes}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium',
                  r.status === 'APPROVED' && 'bg-green-100 text-green-800',
                  r.status === 'REJECTED' && 'bg-red-100 text-red-800',
                  r.status === 'PENDING' && 'bg-amber-100 text-amber-800'
                )}
              >
                {r.status}
              </span>
              {canApprove && r.status === 'PENDING' && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(r.id)}
                    disabled={processing === r.id}
                    className="bg-amber-500 hover:bg-amber-600 text-stone-950"
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(r.id)}
                    disabled={processing === r.id}
                    className="border-stone-300"
                  >
                    Reject
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
