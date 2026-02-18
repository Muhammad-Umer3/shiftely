import { requirePermission } from '@/lib/utils/auth'
import { PERMISSIONS } from '@/lib/permissions/permissions'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ScheduleDetailPage({ params }: PageProps) {
  await requirePermission(PERMISSIONS.SCHEDULE_VIEW)
  await params

  // TODO: Re-enable schedule detail page after landing page deploy
  // Full implementation commented out - see git history to restore

  return (
    <div className="space-y-6 text-stone-900">
      <Link
        href="/dashboard/schedules"
        className="inline-flex items-center gap-1 text-sm text-stone-600 hover:text-amber-600 mb-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to schedules
      </Link>
      <p className="text-stone-600">Schedule detail coming soon.</p>
    </div>
  )
}
