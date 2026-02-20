import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { notFound } from 'next/navigation'
import { EmployeeProfile } from '@/components/employees/employee-profile'

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  const { id } = await params

  const employee = await prisma.employee.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
    include: {
      user: true,
      slotAssignments: {
        take: 10,
        orderBy: { slot: { startTime: 'desc' } },
        include: { slot: true },
      },
    },
  })

  if (!employee) {
    notFound()
  }

  // Convert Decimal to number and slotAssignments to shifts for the component
  const shifts = employee.slotAssignments.map((a) => ({
    id: a.slot.id,
    startTime: a.slot.startTime,
    endTime: a.slot.endTime,
    position: a.slot.position,
  }))
  const employeeForComponent = {
    ...employee,
    hourlyRate: employee.hourlyRate ? Number(employee.hourlyRate) : null,
    shifts,
  }

  return (
    <div className="space-y-6 text-stone-900">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">{employee.user.name || 'Employee'}</h1>
        <p className="text-stone-600 mt-1">{employee.user.email}</p>
      </div>

      <EmployeeProfile employee={employeeForComponent} />
    </div>
  )
}
