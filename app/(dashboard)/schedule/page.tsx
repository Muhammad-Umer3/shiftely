import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { requireAuth, requirePermission } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { ScheduleCalendar } from '@/components/schedule/schedule-calendar'
import { Plus, Calendar } from 'lucide-react'
import { startOfWeek, format } from 'date-fns'
import { PERMISSIONS } from '@/lib/permissions/permissions'
import { PermissionGuard } from '@/components/guards/permission-guard'
import { EmptyState } from '@/components/ui/empty-state'

export default async function SchedulePage() {
  const user = await requirePermission(PERMISSIONS.SCHEDULE_VIEW)

  // Get current week's schedule
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekStartStr = format(weekStart, 'yyyy-MM-dd')

  const schedule = await prisma.schedule.findFirst({
    where: {
      organizationId: user.organizationId,
      weekStartDate: new Date(weekStartStr),
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

  const employees = await prisma.employee.findMany({
    where: { organizationId: user.organizationId },
    include: { user: true },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Schedule</h1>
          <p className="text-muted-foreground">
            Week of {format(weekStart, 'MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Change Week
          </Button>
          <PermissionGuard permission={PERMISSIONS.SCHEDULE_CREATE}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Schedule
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {schedule ? (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Schedule</CardTitle>
            <CardDescription>Drag and drop to assign shifts</CardDescription>
          </CardHeader>
          <CardContent>
            <ScheduleCalendar
              schedule={schedule}
              employees={employees}
              weekStart={weekStart}
              organizationId={user.organizationId}
            />
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
          title="No schedule for this week"
          description="Create a schedule to start assigning shifts to your team members."
          action={{
            label: 'Create Schedule',
            onClick: () => window.location.href = '/dashboard/schedule?create=true',
          }}
        />
      )}
    </div>
  )
}
