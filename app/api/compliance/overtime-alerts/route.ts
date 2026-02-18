import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { SchedulerService } from '@/server/services/scheduler/scheduler.service'
import { startOfWeek } from 'date-fns'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    const weekStartDate = searchParams.get('weekStartDate')

    const weekStart = weekStartDate
      ? new Date(weekStartDate)
      : startOfWeek(new Date(), { weekStartsOn: 1 })

    const employees = await prisma.employee.findMany({
      where: { organizationId: user.organizationId },
      include: { user: true },
    })

    const alerts = await Promise.all(
      employees.map(async (employee) => {
        const overtime = await SchedulerService.checkOvertime(employee.id, weekStart)
        if (overtime.hasOvertime) {
          return {
            employee: {
              id: employee.id,
              name: employee.user.name || employee.user.email,
            },
            weeklyHours: overtime.weeklyHours,
            overtimeHours: overtime.overtimeHours,
          }
        }
        return null
      })
    )

    const filteredAlerts = alerts.filter((alert) => alert !== null)

    return NextResponse.json({ alerts: filteredAlerts }, { status: 200 })
  } catch (error) {
    console.error('Error fetching overtime alerts:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
