import { format, startOfWeek } from 'date-fns'
import { requirePermission } from '@/lib/utils/auth'
import { PERMISSIONS } from '@/lib/permissions/permissions'
import { SchedulesList } from '@/components/schedules/schedules-list'
import { checkPermission } from '@/lib/utils/auth'
import { SubscriptionService } from '@/server/services/subscription/subscription.service'
import { SchedulerService } from '@/server/services/scheduler/scheduler.service'

type PageProps = {
  searchParams?: Promise<{ create?: string; weekStart?: string; seriesId?: string }> | { create?: string; weekStart?: string; seriesId?: string }
}

export default async function SchedulesPage({ searchParams }: PageProps) {
  const user = await requirePermission(PERMISSIONS.SCHEDULE_VIEW)

  const params = searchParams ?? {}
  const resolved = typeof (params as Promise<unknown>).then === 'function'
    ? await (params as Promise<{ create?: string; weekStart?: string; seriesId?: string }>)
    : (params as { create?: string; weekStart?: string; seriesId?: string })

  const series = await SchedulerService.listScheduleSeries(user.organizationId)

  const canCreate = await checkPermission(PERMISSIONS.SCHEDULE_CREATE)
  const canEdit = await checkPermission(PERMISSIONS.SCHEDULE_EDIT)
  const subscriptionInfo = await SubscriptionService.getSubscriptionInfo(user.organizationId)
  const isFreeUser = subscriptionInfo.tier === 'FREE'
  const currentWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')

  return (
    <div className="space-y-6 text-stone-900">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Schedules</h1>
        <p className="text-stone-600 mt-1">
          Generate schedules with AI from employee availability, or create and edit manually
        </p>
      </div>

      <SchedulesList
        series={series}
        canCreate={canCreate}
        canEdit={canEdit}
        openCreateOnMount={resolved.create === 'true'}
        createWeekStart={resolved.create === 'true' && resolved.weekStart ? resolved.weekStart : undefined}
        createSeriesId={resolved.create === 'true' && resolved.seriesId ? resolved.seriesId : undefined}
        isFreeUser={isFreeUser}
        currentWeekStart={currentWeekStart}
      />
    </div>
  )
}
