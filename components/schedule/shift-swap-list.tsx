'use client'

import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { useState } from 'react'

type SlotSwap = {
  id: string
  slot: {
    id: string
    startTime: Date
    endTime: Date
    assignments: {
      employee: {
        name?: string | null
        phone?: string | null
        user?: {
          name: string | null
          email: string
        } | null
      } | null
    }[]
  }
  requester: {
    id: string
    name: string | null
    email: string
  }
  targetEmployee: {
    name: string | null
    email: string
  } | null
  status: string
  createdAt: Date
}

export function ShiftSwapList({
  swaps,
  currentUserId,
}: {
  swaps: SlotSwap[]
  currentUserId: string
}) {
  const [processing, setProcessing] = useState<string | null>(null)

  const handleApprove = async (swapId: string) => {
    setProcessing(swapId)
    try {
      const response = await fetch(`/api/swaps/${swapId}/approve`, {
        method: 'POST',
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert('Failed to approve swap')
      }
    } catch (error) {
      alert('An error occurred')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (swapId: string) => {
    setProcessing(swapId)
    try {
      const response = await fetch(`/api/swaps/${swapId}/reject`, {
        method: 'POST',
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert('Failed to reject swap')
      }
    } catch (error) {
      alert('An error occurred')
    } finally {
      setProcessing(null)
    }
  }

  if (swaps.length === 0) {
    return <p className="text-stone-600">No shift swap requests</p>
  }

  return (
    <div className="space-y-4">
      {swaps.map((swap) => {
        const isRequester = swap.requester.id === currentUserId
        const canApprove = !isRequester && swap.status === 'PENDING'

        return (
          <div key={swap.id} className="border border-stone-200 rounded-lg p-4 space-y-2 bg-white hover:border-amber-500/30 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-stone-900">
                  {format(new Date(swap.slot.startTime), 'MMM d, yyyy')} -{' '}
                  {format(new Date(swap.slot.startTime), 'h:mm a')} to{' '}
                  {format(new Date(swap.slot.endTime), 'h:mm a')}
                </p>
                <p className="text-sm text-stone-600">
                  {isRequester ? 'You requested' : `${swap.requester.name || swap.requester.email} requested`} to swap
                  {swap.targetEmployee
                    ? ` with ${swap.targetEmployee.name || swap.targetEmployee.email}`
                    : ' this shift'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    swap.status === 'APPROVED'
                      ? 'bg-green-100 text-green-800'
                      : swap.status === 'REJECTED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {swap.status}
                </span>
                {canApprove && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(swap.id)}
                      disabled={processing === swap.id}
                      className="bg-amber-500 hover:bg-amber-600 text-stone-950"
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(swap.id)}
                      disabled={processing === swap.id}
                      className="border-stone-300 text-stone-700 hover:bg-red-50 hover:border-red-300"
                    >
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
