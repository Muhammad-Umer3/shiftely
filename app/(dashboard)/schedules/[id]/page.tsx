import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { requirePermission } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { ScheduleCalendar } from '@/components/schedule/schedule-calendar'
import { ScheduleRosterView } from '@/components/schedule/schedule-roster-view'
import { ScheduleViewToggle } from '@/components/schedule/schedule-view-toggle'
import { EditScheduleButton } from '@/components/schedule/edit-schedule-button'
import { CopyScheduleButton } from '@/components/schedule/copy-schedule-button'
import { PublishScheduleButton } from '@/components/schedule/publish-schedule-button'
import { ExportScheduleButton } from '@/components/schedule/export-schedule-button'
import { ShareScheduleButton } from '@/components/schedule/share-schedule-button'
import { format, subWeeks } from 'date-fns'
import { PERMISSIONS } from '@/lib/permissions/permissions'
import { PermissionGuard } from '@/components/guards/permission-guard'
import { checkPermission } from '@/lib/utils/auth'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

type PageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ view?: string }> | { view?: string }
}

type ViewMode = 'grid' | 'roster'

export default async function ScheduleDetailPage({ params, searchParams }: PageProps) {
  const user = await requirePermission(PERMISSIONS.SCHEDULE_VIEW)
  const { id } = await params

  const rawParams = searchParams ?? {}
  const paramsResolved = typeof (rawParams as Promise<unknown>).then === 'function'
    ? await (rawParams as Promise<{ view?: string }>)
    : (rawParams as { view?: string })
  const viewMode: ViewMode = paramsResolved.view === 'roster' ? 'roster' : 'grid'

  const schedule = await prisma.schedule.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
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

  if (!schedule) {
    notFound()
  }

  // Transform slots to shift-like format for calendar (one shift per slot, first assignment)
  const scheduleWithShifts = {
    ...schedule,
    scheduleShifts: schedule.slots.map((slot) => ({
      shift: {
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        position: slot.position,
        employee: slot.assignments[0]?.employee ?? null,
      },
    })),
  }

  type ScheduleRow = (typeof scheduleWithShifts) & {
    assignedEmployeeIds?: string[]
    displaySettings?: unknown
    name?: string | null
    status?: string
  }
  const scheduleRow = scheduleWithShifts as ScheduleRow

  const weekStart = new Date(schedule.weekStartDate!)
  const weekStartStr = format(weekStart, 'yyyy-MM-dd')

  const allEmployees = await prisma.employee.findMany({
    where: { organizationId: user.organizationId },
    include: { user: true },
  })

  const scheduleDisplay = scheduleRow.displaySettings as { startHour?: number; endHour?: number; workingDays?: number[]; displayGroupIds?: string[] } | null
  const displayGroupIds = Array.isArray(scheduleDisplay?.displayGroupIds) ? scheduleDisplay.displayGroupIds : []

  const groups = displayGroupIds.length > 0
    ? await prisma.employeeGroup.findMany({
        where: { organizationId: user.organizationId, id: { in: displayGroupIds } },
        include: { members: { include: { employee: { include: { user: true } } } } },
      })
    : await prisma.employeeGroup.findMany({
        where: { organizationId: user.organizationId },
        include: { members: { include: { employee: { include: { user: true } } } } },
      })

  type GroupWithMembers = { members: { employeeId: string }[] }
  const employeeIdsFromGroups = new Set(
    (groups as GroupWithMembers[]).flatMap((g) => g.members.map((m) => m.employeeId))
  )
  const employees =
    displayGroupIds.length > 0
      ? allEmployees.filter((e) => employeeIdsFromGroups.has(e.id))
      : allEmployees

  const canEdit = await checkPermission(PERMISSIONS.SCHEDULE_EDIT)
  const canPublish = await checkPermission(PERMISSIONS.SCHEDULE_PUBLISH)

  const org = await prisma.organization.findUnique({
    where: { id: user.organizationId },
  })
  const orgSettings = (org?.settings as Record<string, unknown>) ?? {}
  const orgScheduleSettings = (orgSettings.scheduleSettings as { startHour?: number; endHour?: number; workingDays?: number[] }) ?? {}
  const displayStartHour = scheduleDisplay?.startHour ?? orgScheduleSettings.startHour ?? 6
  const displayEndHour = scheduleDisplay?.endHour ?? orgScheduleSettings.endHour ?? 22
  const workingDays = Array.isArray(scheduleDisplay?.workingDays)
    ? scheduleDisplay.workingDays
    : Array.isArray(orgScheduleSettings.workingDays)
      ? orgScheduleSettings.workingDays
      : [1, 2, 3, 4, 5]

  const displayName = scheduleRow.name?.trim() || `Week of ${format(weekStart, 'MMMM d, yyyy')}`

  const currentUserEmployee = await prisma.employee.findUnique({
    where: { userId: user.id },
    select: { id: true },
  })

  return (
    <div className="space-y-6 text-stone-900">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            href="/schedules"
            className="inline-flex items-center gap-1 text-sm text-stone-600 hover:text-amber-600 mb-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to schedules
          </Link>
          <h1 className="text-3xl font-bold text-stone-900">{displayName}</h1>
          <p className="text-stone-600 mt-1">
            Week of {format(weekStart, 'MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ScheduleViewToggle view={viewMode} basePath={`/schedules/${id}`} showMonthView={false} />
          {canPublish && scheduleRow.status === 'DRAFT' && (
            <PublishScheduleButton scheduleId={schedule.id} />
          )}
          {scheduleRow.status === 'PUBLISHED' && (
            <>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                Published
              </span>
              <ShareScheduleButton
                scheduleId={schedule.id}
                employeeId={currentUserEmployee?.id}
              />
            </>
          )}
          <ExportScheduleButton scheduleId={schedule.id} />
          <PermissionGuard permission={PERMISSIONS.SCHEDULE_EDIT}>
            <CopyScheduleButton
              targetWeekStart={weekStartStr}
              sourceWeekStart={format(subWeeks(weekStart, 1), 'yyyy-MM-dd')}
            />
            <EditScheduleButton
              scheduleId={schedule.id}
              name={scheduleRow.name}
              displayGroupIds={displayGroupIds}
              displaySettings={{ startHour: displayStartHour, endHour: displayEndHour, workingDays, displayGroupIds }}
            />
          </PermissionGuard>
        </div>
      </div>

      <Card className="border-stone-200 bg-white">
        <CardHeader>
          <CardTitle className="text-stone-900">
            {viewMode === 'roster' ? 'Roster View' : 'Weekly Schedule'}
          </CardTitle>
          <CardDescription className="text-stone-600">
            {viewMode === 'roster'
              ? 'Employees as rows, days as columns'
              : 'Drag and drop to assign shifts'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {viewMode === 'roster' ? (
            <ScheduleRosterView
              schedule={scheduleWithShifts}
              employees={employees}
              weekStart={weekStart}
              organizationId={user.organizationId}
              canEdit={canEdit}
              workingDays={workingDays}
            />
          ) : (
            <ScheduleCalendar
              schedule={scheduleWithShifts}
              employees={employees}
              displayGroupIds={displayGroupIds}
              weekStart={weekStart}
              organizationId={user.organizationId}
              scheduleId={schedule.id}
              startHour={displayStartHour}
              endHour={displayEndHour}
              workingDays={workingDays}
              canEdit={canEdit}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
