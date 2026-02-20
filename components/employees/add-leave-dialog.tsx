'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const leaveSchema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  type: z.enum(['vacation', 'sick', 'personal', 'unpaid', 'other']),
  notes: z.string().optional(),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'End date must be on or after start date',
  path: ['endDate'],
})

type LeaveFormData = z.infer<typeof leaveSchema>

const LEAVE_TYPE_LABELS: Record<string, string> = {
  vacation: 'Vacation',
  sick: 'Sick',
  personal: 'Personal',
  unpaid: 'Unpaid',
  other: 'Other',
}

export function AddLeaveDialog({
  employeeId,
  open,
  onOpenChange,
  onSuccess,
  defaultStartDate,
  defaultEndDate,
}: {
  employeeId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  defaultStartDate?: string
  defaultEndDate?: string
}) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeaveFormData>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      startDate: defaultStartDate || '',
      endDate: defaultEndDate || '',
      type: 'vacation',
    },
  })

  useEffect(() => {
    if (open && defaultStartDate && defaultEndDate) {
      reset({
        startDate: defaultStartDate,
        endDate: defaultEndDate,
        type: 'vacation',
        notes: '',
      })
    }
  }, [open, defaultStartDate, defaultEndDate, reset])

  const onSubmit = async (data: LeaveFormData) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/employees/${employeeId}/leaves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: data.startDate,
          endDate: data.endDate,
          type: data.type,
          notes: data.notes || undefined,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Leave added successfully')
        reset()
        onOpenChange(false)
        onSuccess?.()
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('leave-updated'))
        }
      } else {
        toast.error(result.message || 'Failed to add leave')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Leave</DialogTitle>
          <DialogDescription>
            Record time off. This will be used when generating schedules.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-stone-700">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                className="border-stone-300 focus:border-amber-500 focus:ring-amber-500/20"
                {...register('startDate')}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500">{errors.startDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-stone-700">End Date</Label>
              <Input
                id="endDate"
                type="date"
                className="border-stone-300 focus:border-amber-500 focus:ring-amber-500/20"
                {...register('endDate')}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500">{errors.endDate.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="type" className="text-stone-700">Type</Label>
            <select
              id="type"
              className="flex h-10 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              {...register('type')}
            >
              {Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-stone-700">Notes (optional)</Label>
            <Input
              id="notes"
              type="text"
              placeholder="e.g. Family trip"
              className="border-stone-300 focus:border-amber-500 focus:ring-amber-500/20"
              {...register('notes')}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-stone-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold"
            >
              {loading ? 'Adding...' : 'Add Leave'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
