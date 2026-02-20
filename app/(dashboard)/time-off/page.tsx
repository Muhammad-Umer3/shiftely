import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { requireAuth } from '@/lib/utils/auth'
import { RequestTimeOffDialog } from '@/components/time-off/request-time-off-dialog'
import { TimeOffRequestList } from '@/components/time-off/time-off-request-list'

export default async function TimeOffPage() {
  const user = await requireAuth()
  const canApprove = user.role === 'MANAGER' || user.role === 'ADMIN'

  return (
    <div className="space-y-6 text-stone-900">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Time off</h1>
          <p className="text-stone-600 mt-1">
            Request time off or approve requests
          </p>
        </div>
        <RequestTimeOffDialog />
      </div>

      <Card className="border-stone-200 bg-white">
        <CardHeader>
          <CardTitle className="text-stone-900">
            {canApprove ? 'All requests' : 'Your requests'}
          </CardTitle>
          <CardDescription className="text-stone-600">
            {canApprove
              ? 'Approve or reject time-off requests from your team'
              : 'View the status of your time-off requests'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TimeOffRequestList canApprove={canApprove} currentUserId={user.id} />
        </CardContent>
      </Card>
    </div>
  )
}
