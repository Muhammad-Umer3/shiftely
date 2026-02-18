import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { notFound } from 'next/navigation'
import { EmployeeProfile } from '@/components/employees/employee-profile'

export default async function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const user = await requireAuth()

  const employee = await prisma.employee.findFirst({
    where: {
      id: params.id,
      organizationId: user.organizationId,
    },
    include: {
      user: true,
      shifts: {
        take: 10,
        orderBy: { startTime: 'desc' },
      },
    },
  })

  if (!employee) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{employee.user.name || 'Employee'}</h1>
        <p className="text-muted-foreground">{employee.user.email}</p>
      </div>

      <EmployeeProfile employee={employee} />
    </div>
  )
}
