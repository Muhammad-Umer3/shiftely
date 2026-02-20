'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'

type Employee = {
  id: string
  user: { name: string | null; email: string }
}

type Group = {
  id: string
  name: string
  members: { employee: Employee }[]
}

export function GroupEditDialog({
  open,
  onOpenChange,
  group,
  employees,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: Group | null
  employees: Employee[]
  onSaved?: () => void
}) {
  const isEdit = !!group
  const [name, setName] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setName(group?.name ?? '')
      setSelectedIds(new Set(group?.members.map((m) => m.employee.id) ?? []))
    }
  }, [open, group])

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Group name is required')
      return
    }
    setSaving(true)
    try {
      const body = { name: name.trim(), employeeIds: Array.from(selectedIds) }
      const url = isEdit ? `/api/groups/${group.id}` : '/api/groups'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        toast.success(isEdit ? 'Group updated' : 'Group created')
        onOpenChange(false)
        onSaved?.()
      } else {
        toast.error(data.message ?? `Failed to ${isEdit ? 'update' : 'create'} group`)
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const toggleEmployee = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit group' : 'Create group'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="group-name">Group name</Label>
            <input
              id="group-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning Team"
              className="mt-1 w-full border border-stone-200 rounded-lg px-3 py-2 text-stone-900"
            />
          </div>
          <div>
            <Label className="mb-2 block">Members</Label>
            <div className="max-h-48 overflow-y-auto border rounded-lg p-2 bg-stone-50 space-y-1">
              {employees.map((emp) => (
                <label
                  key={emp.id}
                  className={cn(
                    'flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer hover:bg-stone-100',
                    selectedIds.has(emp.id) && 'bg-amber-50'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(emp.id)}
                    onChange={() => toggleEmployee(emp.id)}
                    className="rounded border-stone-300"
                  />
                  <span className="text-sm truncate">
                    {emp.user.name || emp.user.email}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? 'Saving...' : isEdit ? 'Save' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
