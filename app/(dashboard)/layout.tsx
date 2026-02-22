import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { TrialEndedBanner } from '@/components/settings/trial-ended-banner'
import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { SubscriptionService } from '@/server/services/subscription/subscription.service'

export default async function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  let showTrialEndedBanner = false
  if (session.user?.organizationId) {
    try {
      const info = await SubscriptionService.getSubscriptionInfo(
        session.user.organizationId
      )
      showTrialEndedBanner =
        !!info.trialEndsAt &&
        new Date() > new Date(info.trialEndsAt) &&
        info.subscriptionTier === 'FREE'
    } catch {
      // Ignore; banner stays hidden
    }
  }

  return (
    <>
      {showTrialEndedBanner && <TrialEndedBanner />}
      <DashboardLayout>{children}</DashboardLayout>
    </>
  )
}
