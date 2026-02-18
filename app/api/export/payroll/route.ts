import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { SchedulerService } from '@/server/services/scheduler/scheduler.service'
import { startOfWeek, endOfWeek } from 'date-fns'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    const weekStartDate = searchParams.get('weekStartDate')

    const weekStart = weekStartDate
      ? new Date(weekStartDate)
      : startOfWeek(new Date(), { weekStartsOn: 1 })
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })

    const employees = await prisma.employee.findMany({
      where: { organizationId: user.organizationId },
      include: {
        user: true,
        shifts: {
          where: {
            startTime: {
              gte: weekStart,
              lte: weekEnd,
            },
            status: {
              in: ['SCHEDULED', 'CONFIRMED', 'COMPLETED'],
            },
          },
        },
      },
    })

    // Calculate hours and overtime for each employee
    const payrollData = await Promise.all(
      employees.map(async (employee) => {
        const weeklyHours = await SchedulerService.calculateWeeklyHours(employee.id, weekStart)
        const overtime = await SchedulerService.checkOvertime(employee.id, weekStart)
        const regularHours = Math.min(weeklyHours, 40)
        const overtimeHours = Math.max(0, weeklyHours - 40)

        return {
          employeeId: employee.id,
          employeeName: employee.user.name || employee.user.email,
          email: employee.user.email,
          hourlyRate: employee.hourlyRate?.toString() || '0',
          regularHours: regularHours.toFixed(2),
          overtimeHours: overtimeHours.toFixed(2),
          totalHours: weeklyHours.toFixed(2),
          regularPay: (regularHours * parseFloat(employee.hourlyRate?.toString() || '0')).toFixed(2),
          overtimePay: (overtimeHours * parseFloat(employee.hourlyRate?.toString() || '0') * 1.5).toFixed(2),
          totalPay: (
            regularHours * parseFloat(employee.hourlyRate?.toString() || '0') +
            overtimeHours * parseFloat(employee.hourlyRate?.toString() || '0') * 1.5
          ).toFixed(2),
        }
      })
    )

    // Generate CSV
    const csvHeaders = [
      'Employee ID',
      'Employee Name',
      'Email',
      'Hourly Rate',
      'Regular Hours',
      'Overtime Hours',
      'Total Hours',
      'Regular Pay',
      'Overtime Pay',
      'Total Pay',
    ]

    const csvRows = payrollData.map((row) => [
      row.employeeId,
      row.employeeName,
      row.email,
      row.hourlyRate,
      row.regularHours,
      row.overtimeHours,
      row.totalHours,
      row.regularPay,
      row.overtimePay,
      row.totalPay,
    ])

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="payroll-${weekStart.toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error exporting payroll:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
