import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db/prisma'
import { startOfWeek, endOfWeek, eachDayOfInterval, addDays } from 'date-fns'
import { generateScheduleSlug } from '@/lib/schedule-slug'

export class SchedulerService {
  /**
   * Create a new schedule for a week
   */
  static async createSchedule(
    organizationId: string,
    weekStartDate: Date,
    createdById: string,
    options?: { name?: string; displaySettings?: { startHour: number; endHour: number; workingDays: number[] } }
  ) {
    const schedule = await prisma.schedule.create({
      data: {
        organizationId,
        type: 'WEEK',
        weekStartDate,
        status: 'DRAFT',
        createdById,
        name: options?.name ?? null,
        displaySettings: options?.displaySettings ? (options.displaySettings as object) : undefined,
      },
    })
    const slug = generateScheduleSlug(schedule.name, weekStartDate, schedule.id)
    await prisma.schedule.update({
      where: { id: schedule.id },
      data: { slug },
    })
    return { ...schedule, slug }
  }

  /**
   * Update schedule name and/or display settings; regenerates slug when name changes
   */
  static async updateSchedule(
    scheduleId: string,
    organizationId: string,
    data: {
      name?: string
      displaySettings?: { startHour: number; endHour: number; workingDays: number[] } | null
    }
  ) {
    const existing = await prisma.schedule.findFirst({
      where: { id: scheduleId, organizationId },
      select: { name: true, weekStartDate: true },
    })
    const updateData: Prisma.ScheduleUpdateInput = {
      ...(data.name !== undefined && { name: data.name || null }),
      ...(data.displaySettings !== undefined && {
        displaySettings: data.displaySettings === null ? Prisma.DbNull : (data.displaySettings as Prisma.InputJsonValue),
      }),
    }
    if (data.name !== undefined && existing?.weekStartDate) {
      const newName = data.name ?? existing.name
      updateData.slug = generateScheduleSlug(newName, existing.weekStartDate, scheduleId)
    }
    return prisma.schedule.update({
      where: { id: scheduleId, organizationId },
      data: updateData,
      include: {
        slots: {
          include: {
            assignments: {
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
   * Creates a version snapshot and notifies employees with changed shifts
   */
  static async publishSchedule(scheduleId: string, organizationId: string, publishedById: string) {
    const schedule = await prisma.schedule.findFirst({
      where: { id: scheduleId, organizationId },
      include: {
        slots: {
          include: {
            assignments: {
              include: {
                employee: { include: { user: true } },
              },
            },
          },
        },
      },
    })

    if (!schedule) throw new Error('Schedule not found')

    const lastVersion = await prisma.scheduleVersion.findFirst({
      where: { scheduleId },
      orderBy: { version: 'desc' },
    })
    const nextVersion = (lastVersion?.version ?? 0) + 1

    const slotSnapshot: Record<string, { assignments: { employeeId: string | null }[]; startTime: string; endTime: string; position: string | null }> = {}
    schedule.slots.forEach((slot) => {
      slotSnapshot[slot.id] = {
        assignments: slot.assignments.map((a) => ({ employeeId: a.employeeId })),
        startTime: slot.startTime.toISOString(),
        endTime: slot.endTime.toISOString(),
        position: slot.position,
      }
    })

    await prisma.$transaction([
      prisma.schedule.update({
        where: { id: scheduleId, organizationId },
        data: { status: 'PUBLISHED' },
      }),
      prisma.scheduleVersion.create({
        data: {
          scheduleId,
          version: nextVersion,
          slotSnapshot: slotSnapshot as object,
          publishedById,
        },
      }),
    ])

    const { NotificationService } = await import('@/server/services/notifications/notification.service')
    await NotificationService.notifySchedulePublishWithChanges(
      scheduleId,
      organizationId,
      lastVersion?.slotSnapshot as Record<string, { assignments: { employeeId: string | null }[] }> | undefined,
      slotSnapshot
    )

    return prisma.schedule.findFirst({
      where: { id: scheduleId, organizationId },
      include: {
        slots: {
          include: {
            assignments: {
              include: {
                employee: { include: { user: true } },
              },
            },
          },
        },
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
        slots: {
          include: {
            assignments: {
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
        type: 'WEEK',
        weekStartDate,
      },
      include: {
        slots: {
          include: {
            assignments: {
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
   * Auto-fill slots based on employee availability
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

    const creator = await prisma.user.findFirst({ where: { organizationId } })
    if (!creator) {
      throw new Error('No users found in organization')
    }

    const schedule = await prisma.schedule.findFirst({
      where: { id: scheduleId, organizationId },
      select: { displaySettings: true },
    })
    const displaySettings = schedule?.displaySettings as { shiftDefaults?: { minPeople?: number; maxPeople?: number } } | null
    const shiftDef = displaySettings?.shiftDefaults
    const slotMinCount = shiftDef?.minPeople != null ? Math.max(1, shiftDef.minPeople) : undefined
    const slotMaxCount = shiftDef?.maxPeople != null ? Math.max(1, shiftDef.maxPeople) : undefined

    const createdSlots: { id: string }[] = []

    // Simple auto-fill: create one slot per employee per day (requiredCount=1)
    for (const employee of employees) {
      for (const day of weekDays) {
        if (day.getDay() === 0 || day.getDay() === 6) continue

        const startTime = new Date(day)
        startTime.setHours(9, 0, 0, 0)
        const endTime = new Date(day)
        endTime.setHours(17, 0, 0, 0)

        const slot = await prisma.slot.create({
          data: {
            organizationId,
            scheduleId,
            startTime,
            endTime,
            position: employee.roleType || null,
            requiredCount: 1,
            minCount: slotMinCount,
            maxCount: slotMaxCount,
            createdById: creator.id,
          },
        })
        await prisma.slotAssignment.create({
          data: {
            slotId: slot.id,
            employeeId: employee.id,
            slotIndex: 1,
          },
        })
        createdSlots.push(slot)
      }
    }

    return createdSlots
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
    if (!sourceSchedule || sourceSchedule.slots.length === 0) {
      return { schedule: null, copiedCount: 0 }
    }

    const sourceStart = startOfWeek(sourceWeekStart, { weekStartsOn: 1 })
    const targetStart = startOfWeek(targetWeekStart, { weekStartsOn: 1 })
    const dayOffset =
      (targetStart.getTime() - sourceStart.getTime()) / (1000 * 60 * 60 * 24)

    let targetSchedule = await this.getScheduleForWeek(organizationId, targetWeekStart)
    if (!targetSchedule) {
      const created = await prisma.schedule.create({
        data: {
          organizationId,
          type: 'WEEK',
          weekStartDate: targetStart,
          status: 'DRAFT',
          createdById,
          name: sourceSchedule.name,
          displaySettings: sourceSchedule.displaySettings as object | undefined,
        },
        include: {
          slots: {
            include: {
              assignments: {
                include: {
                  employee: { include: { user: true } },
                },
              },
            },
          },
        },
      })
      const slug = generateScheduleSlug(created.name, targetStart, created.id)
      await prisma.schedule.update({
        where: { id: created.id },
        data: { slug },
      })
      targetSchedule = { ...created, slug } as NonNullable<Awaited<ReturnType<typeof this.getScheduleForWeek>>>
    } else {
      // Clear existing slots when replacing
      for (const slot of targetSchedule.slots) {
        await prisma.slotAssignment.deleteMany({ where: { slotId: slot.id } })
        await prisma.slot.delete({ where: { id: slot.id } })
      }
    }

    const targetScheduleId = targetSchedule.id
    let copiedCount = 0
    for (const sourceSlot of sourceSchedule.slots) {
      const oldStart = new Date(sourceSlot.startTime)
      const oldEnd = new Date(sourceSlot.endTime)
      const newStart = addDays(oldStart, dayOffset)
      const newEnd = addDays(oldEnd, dayOffset)

      const newSlot = await prisma.slot.create({
        data: {
          organizationId,
          scheduleId: targetScheduleId,
          startTime: newStart,
          endTime: newEnd,
          position: sourceSlot.position,
          requiredCount: sourceSlot.requiredCount,
          minCount: sourceSlot.minCount ?? undefined,
          maxCount: sourceSlot.maxCount ?? undefined,
          createdById,
        },
      })
      for (let i = 0; i < sourceSlot.assignments.length; i++) {
        const a = sourceSlot.assignments[i]
        if (a.employeeId) {
          await prisma.slotAssignment.create({
            data: {
              slotId: newSlot.id,
              employeeId: a.employeeId,
              slotIndex: i + 1,
            },
          })
        }
      }
      copiedCount++
    }

    return {
      schedule: await this.getScheduleForWeek(organizationId, targetWeekStart),
      copiedCount,
    }
  }
}
