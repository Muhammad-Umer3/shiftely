'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

type Leave = { id: string; startDate: string; endDate: string; type: string; notes: string | null }

const LEAVE_TYPE_LABELS: Record<string, string> = {
  vacation: 'Vacation',
  sick: 'Sick',
  personal: 'Personal',
  unpaid: 'Unpaid',
  other: 'Other',
}

export function EmployeeLeavesList({ employeeId, onDelete }: { employeeId: string; onDelete?: () => void }) {
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLeaves = async () => {
    setLoading(true)
    try {
      const today = format(new Date(), 'yyyy-MM-dd')
      const future = format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
      const res = await fetch(`/api/employees/${employeeId}/leaves?startDate=${today}&endDate=${future}`)
      const data = res.ok ? (await res.json()).leaves ?? [] : []
      setLeaves(data)
    } catch {
      setLeaves([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaves()
  }, [employeeId])

  useEffect(() => {
    const handler = () => fetchLeaves()
    window.addEventListener('leave-updated', handler)
    return () => window.removeEventListener('leave-updated', handler)
  }, [employeeId])

  const handleDelete = async (leaveId: string) => {
    try {
      const res = await fetch(`/api/employees/${employeeId}/leaves/${leaveId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Leave removed')
        setLeaves((prev) => prev.filter((l) => l.id !== leaveId))
        onDelete?.()
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('leave-updated'))
        }
      } else {
        toast.error('Failed to remove leave')
      }
    } catch {
      toast.error('An error occurred')
    }
  }

  if (loading) return <div className="text-sm text-stone-500 animate-pulse">Loading leaves...</div>
  if (leaves.length === 0) return <p className="text-sm text-stone-500">No upcoming leaves</p>

  return (
    <ul className="space-y-2">
      {leaves.map((leave) => (
        <li
          key={leave.id}
          className="flex items-center justify-between p-3 border border-stone-200 rounded-lg bg-rose-50/50"
        >
          <div>
            <p className="font-medium text-stone-900">
              {format(new Date(leave.startDate), 'MMM d')} – {format(new Date(leave.endDate), 'MMM d, yyyy')}
            </p>
            <p className="text-sm text-stone-600">
              {LEAVE_TYPE_LABELS[leave.type] || leave.type}
              {leave.notes && ` · ${leave.notes}`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(leave.id)}
            className="text-stone-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </li>
      ))}
    </ul>
  )
}
