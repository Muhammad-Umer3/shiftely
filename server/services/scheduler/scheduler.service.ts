import { prisma } from '@/lib/db/prisma'
import { startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'

export class SchedulerService {
  /**
   * Create a new schedule for a week
   */
  static async createSchedule(
    organizationId: string,
    weekStartDate: Date,
    createdById: string
  ) {
    const schedule = await prisma.schedule.create({
      data: {
        organizationId,
        weekStartDate,
        status: 'DRAFT',
        createdById,
      },
    })

    return schedule
  }

  /**
   * Publish a schedule (move from DRAFT to PUBLISHED)
   */
  static async publishSchedule(scheduleId: string, organizationId: string) {
    const schedule = await prisma.schedule.update({
      where: {
        id: scheduleId,
        organizationId,
      },
      data: {
        status: 'PUBLISHED',
      },
      include: {
        scheduleShifts: {
          include: {
            shift: {
              include: {
                employee: {
                  include: { user: true },
                },
              },
            },
          },
        },
      },
    })

    return schedule
  }

  /**
   * Add a shift to a schedule
   */
  static async addShiftToSchedule(scheduleId: string, shiftId: string) {
    await prisma.scheduleShift.create({
      data: {
        scheduleId,
        shiftId,
      },
    })
  }

  /**
   * Get schedule for a specific week
   */
  static async getScheduleForWeek(organizationId: string, weekStartDate: Date) {
    const schedule = await prisma.schedule.findFirst({
      where: {
        organizationId,
        weekStartDate,
      },
      include: {
        scheduleShifts: {
          include: {
            shift: {
              include: {
                employee: {
                  include: { user: true },
                },
              },
            },
          },
        },
      },
    })

    return schedule
  }

  /**
   * Auto-fill shifts based on employee availability
   */
  static async autoFillShifts(
    scheduleId: string,
    organizationId: string,
    weekStartDate: Date
  ) {
    const employees = await prisma.employee.findMany({
      where: { organizationId },
      include: { user: true },
    })

    const weekStart = startOfWeek(weekStartDate, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(weekStartDate, { weekStartsOn: 1 })
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

    const shifts: Array<{
      employeeId: string
      startTime: Date
      endTime: Date
      position: string | null
    }> = []

    // Simple auto-fill: assign 8-hour shifts to employees
    // In production, this would use availability templates
    employees.forEach((employee: any) => {
      weekDays.forEach((day) => {
        // Skip weekends for now (can be customized)
        if (day.getDay() === 0 || day.getDay() === 6) return

        const startTime = new Date(day)
        startTime.setHours(9, 0, 0, 0) // 9 AM

        const endTime = new Date(day)
        endTime.setHours(17, 0, 0, 0) // 5 PM

        shifts.push({
          employeeId: employee.id,
          startTime,
          endTime,
          position: employee.roleType || null,
        })
      })
    })

    // Get a user to use as creator
    const creator = await prisma.user.findFirst({ where: { organizationId } })
    if (!creator) {
      throw new Error('No users found in organization')
    }

    // Create shifts
    const createdShifts = await Promise.all(
      shifts.map((shiftData: any) =>
        prisma.shift.create({
          data: {
            organizationId,
            employeeId: shiftData.employeeId,
            startTime: shiftData.startTime,
            endTime: shiftData.endTime,
            position: shiftData.position,
            createdById: creator.id,
          },
        })
      )
    )

    // Add shifts to schedule
    await Promise.all(
      createdShifts.map((shift: any) =>
        prisma.scheduleShift.create({
          data: {
            scheduleId,
            shiftId: shift.id,
          },
        })
      )
    )

    return createdShifts
  }

  /**
   * Calculate weekly hours for an employee
   */
  static async calculateWeeklyHours(employeeId: string, weekStartDate: Date) {
    const weekStart = startOfWeek(weekStartDate, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(weekStartDate, { weekStartsOn: 1 })

    const shifts = await prisma.shift.findMany({
      where: {
        employeeId,
        startTime: {
          gte: weekStart,
          lte: weekEnd,
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED'],
        },
      },
    })

    const totalHours = shifts.reduce((total: number, shift: any) => {
      const hours = (shift.endTime.getTime() - shift.startTime.getTime()) / (1000 * 60 * 60)
      return total + hours
    }, 0)

    return totalHours
  }

  /**
   * Check for overtime (over 40 hours per week)
   */
  static async checkOvertime(employeeId: string, weekStartDate: Date) {
    const weeklyHours = await this.calculateWeeklyHours(employeeId, weekStartDate)
    const overtimeThreshold = 40
    const overtimeHours = Math.max(0, weeklyHours - overtimeThreshold)

    return {
      weeklyHours,
      overtimeHours,
      hasOvertime: overtimeHours > 0,
    }
  }
}
