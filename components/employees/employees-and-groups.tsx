'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GroupEditDialog } from './group-edit-dialog'
import { Users, UsersRound, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

type Employee = {
  id: string
  roleType: string | null
  hourlyRate: { toString: () => string } | null
  user: { name: string | null; email: string; phone: string | null }
}

type Group = {
  id: string
  name: string
  members: { employee: { id: string; user: { name: string | null; email: string } } }[]
}

export function EmployeesAndGroups({
  employees: initialEmployees,
  groups: initialGroups,
  canEdit,
}: {
  employees: Employee[]
  groups: Group[]
  canEdit: boolean
}) {
  const [groups, setGroups] = useState(initialGroups)
  const [editGroup, setEditGroup] = useState<Group | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const handleSaved = async () => {
    const res = await fetch('/api/groups')
    const data = await res.json()
    if (data.groups) setGroups(data.groups)
  }

  const handleDelete = async (groupId: string) => {
    if (!confirm('Delete this group?')) return
    try {
      const res = await fetch(`/api/groups/${groupId}`, { method: 'DELETE' })
      if (res.ok) {
        setGroups((prev) => prev.filter((g) => g.id !== groupId))
        toast.success('Group deleted')
      } else {
        toast.error('Failed to delete group')
      }
    } catch {
      toast.error('An error occurred')
    }
  }

  return (
    <div className="space-y-6">
      {/* Groups table */}
      <Card className="border-stone-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-stone-900">
              <UsersRound className="h-5 w-5" />
              Groups
            </CardTitle>
            <CardDescription className="text-stone-600">
              Create groups to assign multiple employees to shifts at once
            </CardDescription>
          </div>
          {canEdit && (
            <Button
              size="sm"
              onClick={() => {
                setEditGroup(null)
                setCreateOpen(true)
              }}
              className="bg-amber-500 hover:bg-amber-600 text-stone-950"
            >
              Add group
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-stone-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-stone-700">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-stone-700">Members</th>
                  {canEdit && (
                    <th className="text-right py-3 px-4 font-medium text-stone-700 w-24">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {groups.length === 0 ? (
                  <tr>
                    <td colSpan={canEdit ? 3 : 2} className="py-8 text-center text-stone-500">
                      No groups yet. {canEdit && 'Click "Add group" to create one.'}
                    </td>
                  </tr>
                ) : (
                  groups.map((group) => (
                    <tr
                      key={group.id}
                      className="border-b border-stone-100 last:border-0 hover:bg-stone-50/50"
                    >
                      <td className="py-3 px-4 font-medium text-stone-900">{group.name}</td>
                      <td className="py-3 px-4 text-stone-600">{group.members.length} members</td>
                      {canEdit && (
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setEditGroup(group)
                                setCreateOpen(false)
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-stone-500 hover:text-red-600"
                              onClick={() => handleDelete(group.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Employees table */}
      <Card className="border-stone-200 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-stone-900">
            <Users className="h-5 w-5" />
            Team members
          </CardTitle>
          <CardDescription className="text-stone-600">
            Your organization&apos;s employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-stone-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-stone-700">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-stone-700">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-stone-700">Role</th>
                  <th className="text-right py-3 px-4 font-medium text-stone-700 w-28">Actions</th>
                </tr>
              </thead>
              <tbody>
                {initialEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-b border-stone-100 last:border-0 hover:bg-stone-50/50"
                  >
                    <td className="py-3 px-4 font-medium text-stone-900">
                      {employee.user.name || 'Unnamed'}
                    </td>
                    <td className="py-3 px-4 text-stone-600">{employee.user.email}</td>
                    <td className="py-3 px-4 text-stone-600">{employee.roleType || '—'}</td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/employees/${employee.id}`}>
                        <Button variant="outline" size="sm" className="border-stone-300">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <GroupEditDialog
        open={createOpen || !!editGroup}
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false)
            setEditGroup(null)
          }
        }}
        group={editGroup}
        employees={initialEmployees.map((e) => ({
          id: e.id,
          user: { name: e.user.name, email: e.user.email },
        }))}
        onSaved={handleSaved}
      />
    </div>
  )
}
