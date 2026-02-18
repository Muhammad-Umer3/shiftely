import { requirePermission } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { PERMISSIONS } from '@/lib/permissions/permissions'
import { SchedulesList } from '@/components/schedules/schedules-list'
import { checkPermission } from '@/lib/utils/auth'

const DAY_LABELS: Record<number, string> = {
  0: 'Sun',
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
}

type PageProps = {
  searchParams?: Promise<{ create?: string }> | { create?: string }
}

export default async function SchedulesPage({ searchParams }: PageProps) {
  const user = await requirePermission(PERMISSIONS.SCHEDULE_VIEW)

  const params = searchParams ?? {}
  const resolved = typeof (params as Promise<unknown>).then === 'function'
    ? await (params as Promise<{ create?: string }>)
    : (params as { create?: string })

  const schedules = await prisma.schedule.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { weekStartDate: 'desc' },
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

  const employees = await prisma.employee.findMany({
    where: { organizationId: user.organizationId },
    include: { user: true },
  })

  const org = await prisma.organization.findUnique({
    where: { id: user.organizationId },
  })
  const orgSettings = (org?.settings as Record<string, unknown>) ?? {}
  const scheduleSettings = (orgSettings.scheduleSettings as { startHour?: number; endHour?: number; workingDays?: number[] }) ?? {}
  const displayStartHour = scheduleSettings.startHour ?? 6
  const displayEndHour = scheduleSettings.endHour ?? 22
  const workingDays = Array.isArray(scheduleSettings.workingDays) ? scheduleSettings.workingDays : [1, 2, 3, 4, 5]
  const workingDaysLabel = workingDays
    .sort((a, b) => a - b)
    .map((d) => DAY_LABELS[d])
    .filter(Boolean)
    .join(', ') || 'Mon–Fri'

  const canCreate = await checkPermission(PERMISSIONS.SCHEDULE_CREATE)
  const canEdit = await checkPermission(PERMISSIONS.SCHEDULE_EDIT)

  const schedulesForList = schedules.map((s) => ({
    ...s,
    displaySettings:
      s.displaySettings &&
      typeof s.displaySettings === 'object' &&
      !Array.isArray(s.displaySettings) &&
      'startHour' in s.displaySettings &&
      'endHour' in s.displaySettings &&
      'workingDays' in s.displaySettings
        ? (s.displaySettings as { startHour: number; endHour: number; workingDays: number[] })
        : null,
  }))

  return (
    <div className="space-y-6 text-stone-900">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Schedules</h1>
        <p className="text-stone-600 mt-1">
          Manage your schedules, assign teammates, and edit display settings per schedule
        </p>
      </div>

      <SchedulesList
        schedules={schedulesForList}
        employees={employees}
        defaultDisplaySettings={{
          startHour: displayStartHour,
          endHour: displayEndHour,
          workingDaysLabel,
          workingDays,
        }}
        canCreate={canCreate}
        canEdit={canEdit}
        openCreateOnMount={resolved.create === 'true'}
      />
    </div>
  )
}
