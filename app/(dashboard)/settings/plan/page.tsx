import { requirePermission } from '@/lib/utils/auth'
import { PERMISSIONS } from '@/lib/permissions/permissions'
import { SubscriptionService } from '@/server/services/subscription/subscription.service'
import { PlanSelector } from '@/components/settings/plan-selector'

export default async function PlanPage() {
  const user = await requirePermission(PERMISSIONS.SETTINGS_VIEW)

  const subscriptionInfo = await SubscriptionService.getSubscriptionInfo(
    user.organizationId
  )

  return (
    <div className="space-y-6 text-stone-900">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Choose your plan</h1>
        <p className="text-stone-600 mt-1">
          Select a plan to continue. You can change or cancel later.
        </p>
      </div>

      <PlanSelector
        currentTier={subscriptionInfo.tier}
        subscriptionTier={subscriptionInfo.subscriptionTier}
      />
    </div>
  )
}
