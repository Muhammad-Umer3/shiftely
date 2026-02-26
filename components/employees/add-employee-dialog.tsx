'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { AddEmployeeForm } from '@/components/employees/add-employee-form'

export function AddEmployeeDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}) {
  const handleSuccess = () => {
    onOpenChange(false)
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden flex flex-col max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-stone-900">Add team member</DialogTitle>
          <DialogDescription className="text-stone-600">
            We need at least name and phone for WhatsApp shift updates. Optionally add login so they can access
            the app.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto pr-1 -mr-1">
          <AddEmployeeForm
            onSuccess={handleSuccess}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
