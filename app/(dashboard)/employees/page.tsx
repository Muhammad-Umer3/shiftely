import { Button } from '@/components/ui/button'
import { requirePermission } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import { UserPlus, Users } from 'lucide-react'
import { PERMISSIONS } from '@/lib/permissions/permissions'
import { PermissionGuard } from '@/components/guards/permission-guard'
import { EmptyState } from '@/components/ui/empty-state'
import { EmployeesAndGroups } from '@/components/employees/employees-and-groups'
import { checkPermission } from '@/lib/utils/auth'

export default async function EmployeesPage() {
  const user = await requirePermission(PERMISSIONS.EMPLOYEE_VIEW)

  const employeesRaw = await prisma.employee.findMany({
    where: { organizationId: user.organizationId },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  })

  const employees = employeesRaw.map((e) => ({
    ...e,
    hourlyRate: e.hourlyRate != null ? Number(e.hourlyRate) : null,
  }))

  let groups: Array<{
    id: string
    name: string
    members: Array<{
      employee: { id: string; user: { name: string | null; email: string } }
    }>
  }> = []
  try {
    const groupsRaw = await prisma.employeeGroup.findMany({
      where: { organizationId: user.organizationId },
      include: {
        members: {
          include: {
            employee: {
              include: { user: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    })
    groups = groupsRaw.map((g) => ({
      id: g.id,
      name: g.name,
      members: g.members.map((m) => ({
        employee: {
          id: m.employee.id,
          user: m.employee.user,
        },
      })),
    }))
  } catch {
    groups = []
  }

  const canEdit = await checkPermission(PERMISSIONS.EMPLOYEE_CREATE)

  return (
    <div className="space-y-6 text-stone-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Team</h1>
          <p className="text-stone-600 mt-1">Manage your team members and groups</p>
        </div>
        <PermissionGuard permission={PERMISSIONS.EMPLOYEE_CREATE}>
          <div className="flex gap-2">
            <Link href="/employees/new">
              <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold shadow-lg shadow-amber-500/25">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            </Link>
            <Link href="/employees/invite">
              <Button variant="outline" className="border-stone-300 text-stone-600 hover:bg-amber-500/10 hover:border-amber-500/30">
                Invite by email
              </Button>
            </Link>
          </div>
        </PermissionGuard>
      </div>

      {employees.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12 text-amber-500/60" />}
          title="No team members yet"
          description="Invite people to join your organization. They'll receive an email to create their account."
          action={{
            label: 'Add Your First Employee',
            href: '/employees/new',
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
    </div>
  )
}
