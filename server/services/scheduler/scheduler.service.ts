import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db/prisma'
import { startOfWeek, endOfWeek, eachDayOfInterval, addDays } from 'date-fns'

export class SchedulerService {
  /**
   * Create a new schedule for a week
   */
  static async createSchedule(
    organizationId: string,
    weekStartDate: Date,
    createdById: string,
    options?: { name?: string; assignedEmployeeIds?: string[]; displaySettings?: { startHour: number; endHour: number; workingDays: number[] } }
  ) {
    const schedule = await prisma.schedule.create({
      data: {
        organizationId,
        weekStartDate,
        status: 'DRAFT',
        createdById,
        name: options?.name ?? null,
        assignedEmployeeIds: options?.assignedEmployeeIds ?? [],
        displaySettings: options?.displaySettings ? (options.displaySettings as object) : undefined,
      },
    })

    return schedule
  }

  /**
   * Update schedule name and/or assigned employees
   */
  static async updateSchedule(
    scheduleId: string,
    organizationId: string,
    data: {
      name?: string
      assignedEmployeeIds?: string[]
      displaySettings?: { startHour: number; endHour: number; workingDays: number[] } | null
    }
  ) {
    return prisma.schedule.update({
      where: { id: scheduleId, organizationId },
      data: {
        ...(data.name !== undefined && { name: data.name || null }),
        ...(data.assignedEmployeeIds !== undefined && { assignedEmployeeIds: data.assignedEmployeeIds }),
        ...(data.displaySettings !== undefined && {
          displaySettings: data.displaySettings === null ? Prisma.DbNull : (data.displaySettings as Prisma.InputJsonValue),
        }),
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
   * List all schedules for an organization (most recent first)
   */
  static async listSchedules(organizationId: string, limit = 20) {
    const schedules = await prisma.schedule.findMany({
      where: { organizationId },
      orderBy: { weekStartDate: 'desc' },
      take: limit,
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
    return schedules
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
   * If assignedEmployeeIds is provided and non-empty, only those employees are used
   */
  static async autoFillShifts(
    scheduleId: string,
    organizationId: string,
    weekStartDate: Date,
    assignedEmployeeIds?: string[]
  ) {
    const where: { organizationId: string; id?: { in: string[] } } = { organizationId }
    if (assignedEmployeeIds && assignedEmployeeIds.length > 0) {
      where.id = { in: assignedEmployeeIds }
    }
    const employees = await prisma.employee.findMany({
      where,
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
   * Copy shifts from a source week to a target week (same employee assignments and times)
   */
  static async copyFromPreviousWeek(
    organizationId: string,
    sourceWeekStart: Date,
    targetWeekStart: Date,
    createdById: string
  ) {
    const sourceSchedule = await this.getScheduleForWeek(organizationId, sourceWeekStart)
    if (!sourceSchedule || sourceSchedule.scheduleShifts.length === 0) {
      return { schedule: null, copiedCount: 0 }
    }

    const sourceStart = startOfWeek(sourceWeekStart, { weekStartsOn: 1 })
    const targetStart = startOfWeek(targetWeekStart, { weekStartsOn: 1 })
    const dayOffset =
      (targetStart.getTime() - sourceStart.getTime()) / (1000 * 60 * 60 * 24)

    let targetSchedule = await this.getScheduleForWeek(organizationId, targetWeekStart)
    if (!targetSchedule) {
      targetSchedule = await prisma.schedule.create({
        data: {
          organizationId,
          weekStartDate: targetStart,
          status: 'DRAFT',
          createdById,
          name: sourceSchedule.name,
          assignedEmployeeIds: sourceSchedule.assignedEmployeeIds ?? [],
          displaySettings: sourceSchedule.displaySettings as object | undefined,
        },
        include: {
          scheduleShifts: true,
        },
      }) as NonNullable<Awaited<ReturnType<typeof this.getScheduleForWeek>>>
    } else {
      // Clear existing shifts when replacing
      const scheduleId = targetSchedule.id
      for (const ss of targetSchedule.scheduleShifts) {
        await prisma.scheduleShift.delete({
          where: {
            scheduleId_shiftId: {
              scheduleId,
              shiftId: ss.shiftId,
            },
          },
        })
        await prisma.shift.delete({ where: { id: ss.shiftId } })
      }
    }

    const targetScheduleId = targetSchedule.id
    const createdShifts: any[] = []
    for (const { shift } of sourceSchedule.scheduleShifts) {
      const oldStart = new Date(shift.startTime)
      const oldEnd = new Date(shift.endTime)
      const newStart = addDays(oldStart, dayOffset)
      const newEnd = addDays(oldEnd, dayOffset)

      const newShift = await prisma.shift.create({
        data: {
          organizationId,
          employeeId: shift.employeeId,
          startTime: newStart,
          endTime: newEnd,
          position: shift.position,
          createdById,
        },
      })
      await prisma.scheduleShift.create({
        data: {
          scheduleId: targetScheduleId,
          shiftId: newShift.id,
        },
      })
      createdShifts.push(newShift)
    }

    return {
      schedule: await this.getScheduleForWeek(organizationId, targetWeekStart),
      copiedCount: createdShifts.length,
    }
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
