import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { requireAuth, requirePermission } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { SchedulerService } from '@/server/services/scheduler/scheduler.service'
import { startOfWeek } from 'date-fns'
import { ComplianceDashboard } from '@/components/compliance/compliance-dashboard'
import { PERMISSIONS } from '@/lib/permissions/permissions'

export default async function CompliancePage() {
  const user = await requirePermission(PERMISSIONS.COMPLIANCE_VIEW)
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })

  const employees = await prisma.employee.findMany({
    where: { organizationId: user.organizationId },
    include: {
      user: true,
      shifts: {
        where: {
          startTime: {
            gte: weekStart,
          },
        },
      },
    },
  })

  const complianceData = await Promise.all(
    employees.map(async (employee) => {
      const weeklyHours = await SchedulerService.calculateWeeklyHours(employee.id, weekStart)
      const overtime = await SchedulerService.checkOvertime(employee.id, weekStart)

      return {
        employee: {
          id: employee.id,
          name: employee.user.name || employee.user.email,
        },
        weeklyHours,
        overtime,
      }
    })
  )

  return (
    <div className="space-y-6 text-stone-900">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Compliance & Hours Tracking</h1>
        <p className="text-stone-600 mt-1">Monitor employee hours and overtime</p>
      </div>

      <ComplianceDashboard data={complianceData} />
    </div>
  )
}
