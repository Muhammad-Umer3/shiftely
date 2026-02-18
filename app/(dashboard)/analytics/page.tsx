import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { requireAuth, requirePermission } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard'
import { startOfMonth, endOfMonth } from 'date-fns'
import { PERMISSIONS } from '@/lib/permissions/permissions'

export default async function AnalyticsPage() {
  const user = await requirePermission(PERMISSIONS.ANALYTICS_VIEW)
  const monthStart = startOfMonth(new Date())
  const monthEnd = endOfMonth(new Date())

  // Get metrics
  const [schedulesCount, employeesCount, shiftsCount, totalHours] = await Promise.all([
    prisma.schedule.count({
      where: {
        organizationId: user.organizationId,
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    }),
    prisma.employee.count({
      where: { organizationId: user.organizationId },
    }),
    prisma.shift.count({
      where: {
        organizationId: user.organizationId,
        startTime: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    }),
    prisma.shift.findMany({
      where: {
        organizationId: user.organizationId,
        startTime: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    }).then((shifts) => {
      return shifts.reduce((total, shift) => {
        const hours = (shift.endTime.getTime() - shift.startTime.getTime()) / (1000 * 60 * 60)
        return total + hours
      }, 0)
    }),
  ])

  // Calculate time saved (estimate: 2 hours per schedule creation)
  const estimatedTimeSaved = schedulesCount * 2

  const metrics = {
    schedulesCreated: schedulesCount,
    employeesScheduled: employeesCount,
    shiftsScheduled: shiftsCount,
    totalHours,
    timeSaved: estimatedTimeSaved,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your scheduling performance</p>
      </div>

      <AnalyticsDashboard metrics={metrics} />
    </div>
  )
}
