import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { requirePermission } from '@/lib/utils/auth'
import { SubscriptionSettings } from '@/components/settings/subscription-settings'
import { PERMISSIONS } from '@/lib/permissions/permissions'
import { SubscriptionService } from '@/server/services/subscription/subscription.service'

export default async function SettingsPage() {
  const user = await requirePermission(PERMISSIONS.SETTINGS_VIEW)

  const subscriptionInfo = await SubscriptionService.getSubscriptionInfo(
    user.organizationId
  )

  return (
    <div className="space-y-6 text-stone-900">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Settings</h1>
        <p className="text-stone-600 mt-1">Manage your organization settings</p>
      </div>

      <Card className="border-stone-200 bg-white">
        <CardHeader>
          <CardTitle className="text-stone-900">Subscription</CardTitle>
          <CardDescription className="text-stone-600">Manage your subscription plan</CardDescription>
        </CardHeader>
        <CardContent>
          <SubscriptionSettings
            currentTier={subscriptionInfo.tier}
            subscriptionTier={subscriptionInfo.subscriptionTier}
            trialEndsAt={subscriptionInfo.trialEndsAt}
            isTrialing={subscriptionInfo.isTrialing}
            organizationId={user.organizationId}
          />
        </CardContent>
      </Card>
    </div>
  )
}
