import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { requireAuth, requirePermission } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import { UserPlus, Users } from 'lucide-react'
import { PERMISSIONS } from '@/lib/permissions/permissions'
import { PermissionGuard } from '@/components/guards/permission-guard'
import { EmptyState } from '@/components/ui/empty-state'

export default async function EmployeesPage() {
  const user = await requirePermission(PERMISSIONS.EMPLOYEE_VIEW)

  const employees = await prisma.employee.findMany({
    where: { organizationId: user.organizationId },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6 text-stone-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Team</h1>
          <p className="text-stone-600 mt-1">Manage your team members</p>
        </div>
        <PermissionGuard permission={PERMISSIONS.EMPLOYEE_CREATE}>
          <Link href="/dashboard/employees/invite">
            <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold shadow-lg shadow-amber-500/25">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </Link>
        </PermissionGuard>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {employees.map((employee) => (
          <Card key={employee.id} className="border-stone-200 bg-white hover:border-amber-500/30 transition-colors">
            <CardHeader>
              <CardTitle className="text-stone-900">{employee.user.name || 'Unnamed'}</CardTitle>
              <CardDescription className="text-stone-600">{employee.user.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-stone-600">
                <p><span className="font-medium text-stone-700">Role:</span> {employee.roleType || '—'}</p>
                {employee.hourlyRate && (
                  <p><span className="font-medium text-stone-700">Rate:</span> ${employee.hourlyRate.toString()}/hr</p>
                )}
                <Link href={`/dashboard/employees/${employee.id}`}>
                  <Button variant="outline" className="w-full mt-4 border-stone-300 text-stone-700 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-700">
                    View Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {employees.length === 0 && (
        <EmptyState
          icon={<Users className="h-12 w-12 text-amber-500/60" />}
          title="No team members yet"
          description="Invite people to join your organization. They'll receive an email to create their account."
          action={{
            label: 'Invite Your First Member',
            href: '/dashboard/employees/invite',
          }}
          className="text-stone-900"
        />
      )}
    </div>
  )
}
