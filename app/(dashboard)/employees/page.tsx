import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { requireAuth, requirePermission } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import { Plus, Users } from 'lucide-react'
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground">Manage your team members</p>
        </div>
        <PermissionGuard permission={PERMISSIONS.EMPLOYEE_CREATE}>
          <Link href="/dashboard/employees/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </Link>
        </PermissionGuard>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {employees.map((employee) => (
          <Card key={employee.id}>
            <CardHeader>
              <CardTitle>{employee.user.name || 'Unnamed Employee'}</CardTitle>
              <CardDescription>{employee.user.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Role:</span> {employee.roleType || 'N/A'}
                </p>
                {employee.hourlyRate && (
                  <p className="text-sm">
                    <span className="font-medium">Rate:</span> ${employee.hourlyRate.toString()}/hr
                  </p>
                )}
                <Link href={`/dashboard/employees/${employee.id}`}>
                  <Button variant="outline" className="w-full mt-4">
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
          icon={<Users className="h-12 w-12 text-muted-foreground" />}
          title="No employees yet"
          description="Get started by adding your first team member to your organization."
          action={{
            label: 'Add Your First Employee',
            onClick: () => window.location.href = '/dashboard/employees/new',
          }}
        />
      )}
    </div>
  )
}
