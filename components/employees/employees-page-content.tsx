'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UserPlus, Users } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { EmployeesAndGroups } from '@/components/employees/employees-and-groups'
import { AddEmployeeDialog } from '@/components/employees/add-employee-dialog'

type Employee = {
  id: string
  name?: string | null
  phone?: string | null
  roleType: string | null
  hourlyRate: number | null
  user: { name: string | null; email: string; phone: string | null } | null
}

type Group = {
  id: string
  name: string
  members: Array<{
    employee: { id: string; name?: string | null; phone?: string | null; user: { name: string | null; email: string } | null }
  }>
}

export function EmployeesPageContent({
  employees,
  groups,
  canEdit,
  openAddFromQuery,
}: {
  employees: Employee[]
  groups: Group[]
  canEdit: boolean
  openAddFromQuery?: boolean
}) {
  const router = useRouter()
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  useEffect(() => {
    if (openAddFromQuery) {
      setAddDialogOpen(true)
      router.replace('/employees')
    }
  }, [openAddFromQuery, router])

  return (
    <div className="space-y-6 text-stone-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Team</h1>
          <p className="text-stone-600 mt-1">Manage your team members and groups</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Button
              onClick={() => setAddDialogOpen(true)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold shadow-lg shadow-amber-500/25"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
            <Link href="/employees/invite">
              <Button variant="outline" className="border-stone-300 text-stone-600 hover:bg-amber-500/10 hover:border-amber-500/30">
                Invite by email
              </Button>
            </Link>
          </div>
        )}
      </div>

      {employees.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12 text-amber-500/60" />}
          title="No team members yet"
          description="Invite people to join your organization. They'll receive an email to create their account."
          action={{
            label: 'Add Your First Employee',
            onClick: () => setAddDialogOpen(true),
          }}
          className="text-stone-900"
        />
      ) : (
        <EmployeesAndGroups
          employees={employees}
          groups={groups}
          canEdit={canEdit}
        />
      )}

      <AddEmployeeDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}
