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
import { Users, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { getEmployeeDisplayName } from '@/lib/employees'

type Employee = {
  id: string
  name?: string | null
  phone?: string | null
  user?: { name: string | null; email: string } | null
}

type Group = {
  id: string
  name: string
  members: { employee: Employee }[]
}

export function ManageGroupsDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}) {
  const [groups, setGroups] = useState<Group[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (open) {
      setLoading(true)
      Promise.all([
        fetch('/api/groups').then((r) => r.json()),
        fetch('/api/employees').then((r) => r.json()),
      ])
        .then(([groupsRes, employeesRes]) => {
          setGroups(groupsRes.groups ?? [])
          setEmployees(employeesRes.employees ?? [])
        })
        .catch(() => {
          setGroups([])
          setEmployees([])
        })
        .finally(() => setLoading(false))
    }
  }, [open])

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast.error('Group name is required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          employeeIds: Array.from(selectedIds),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setGroups((prev) => [...prev, data.group])
        setNewName('')
        setSelectedIds(new Set())
        setShowForm(false)
        toast.success('Group created')
        onSaved?.()
      } else {
        toast.error(data.message ?? 'Failed to create group')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (groupId: string) => {
    if (!confirm('Delete this group?')) return
    try {
      const res = await fetch(`/api/groups/${groupId}`, { method: 'DELETE' })
      if (res.ok) {
        setGroups((prev) => prev.filter((g) => g.id !== groupId))
        toast.success('Group deleted')
        onSaved?.()
      } else {
        toast.error('Failed to delete group')
      }
    } catch {
      toast.error('An error occurred')
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
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Groups
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-stone-500 py-4">Loading...</p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-stone-600">
                Create groups to assign multiple employees to a slot at once.
              </p>
              {!showForm && (
                <Button size="sm" onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add group
                </Button>
              )}
            </div>

            {showForm && (
              <div className="border rounded-lg p-4 space-y-4 bg-stone-50">
                <div>
                  <Label htmlFor="group-name">Group name</Label>
                  <input
                    id="group-name"
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Morning Team"
                    className="mt-1 w-full border border-stone-200 rounded-lg px-3 py-2 text-stone-900"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Members</Label>
                  <div className="max-h-40 overflow-y-auto border rounded-lg p-2 bg-white space-y-1">
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
                          {getEmployeeDisplayName(emp)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreate} disabled={saving || !newName.trim()}>
                    {saving ? 'Creating...' : 'Create group'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div>
              <Label className="mb-2 block">Your groups</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {groups.length === 0 ? (
                  <p className="text-sm text-stone-500 py-2">No groups yet. Create one above.</p>
                ) : (
                  groups.map((group) => (
                    <div
                      key={group.id}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-stone-50 border border-stone-200"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Users className="h-4 w-4 text-amber-600 shrink-0" />
                        <span className="font-medium truncate">{group.name}</span>
                        <span className="text-xs text-stone-500 shrink-0">
                          ({group.members.length} members)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-stone-500 hover:text-red-600"
                        onClick={() => handleDelete(group.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
