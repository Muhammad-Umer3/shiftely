'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SUBSCRIPTION_TIERS } from '@/lib/subscription-tiers'
import { useState } from 'react'
import { Check } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { BillingHistory } from './billing-history'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function SubscriptionSettings({
  currentTier,
  subscriptionTier,
  trialEndsAt,
  isTrialing,
  organizationId,
}: {
  currentTier: string
  subscriptionTier?: string
  trialEndsAt?: Date | null
  isTrialing?: boolean
  organizationId: string
}) {
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [billingPortalLoading, setBillingPortalLoading] = useState(false)

  const hasPaidPlan = (subscriptionTier ?? currentTier) !== 'FREE'
  const showUpgradeCta = isTrialing || currentTier === 'FREE'

  const handleManageBilling = async () => {
    setBillingPortalLoading(true)
    try {
      const response = await fetch('/api/stripe/billing-portal', { method: 'POST' })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.message || 'Failed to open billing portal')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setBillingPortalLoading(false)
    }
  }

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Subscription cancelled successfully')
        setShowCancelDialog(false)
        window.location.reload()
      } else {
        toast.error(data.message || 'Failed to cancel subscription')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setCancelling(false)
    }
  }

  const currentPlanName = SUBSCRIPTION_TIERS[currentTier as keyof typeof SUBSCRIPTION_TIERS]?.name || currentTier

  return (
    <div className="space-y-4">
      {isTrialing && trialEndsAt && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You&apos;re on a Pro trial with full access until{' '}
          {new Date(trialEndsAt).toLocaleDateString()}. Choose a plan before then to keep your features.
        </div>
      )}

      <div>
        <p className="text-sm font-medium mb-2">
          Current Plan: {currentPlanName}
          {isTrialing && ' (Trial)'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 max-w-5xl">
        {(Object.keys(SUBSCRIPTION_TIERS) as Array<keyof typeof SUBSCRIPTION_TIERS>).map((tier) => {
          const tierInfo = SUBSCRIPTION_TIERS[tier]
          const isCurrent = currentTier === tier

          return (
            <Card key={tier} className={isCurrent ? 'border-blue-500' : ''}>
              <CardHeader>
                <CardTitle>{tierInfo.name}</CardTitle>
                <CardDescription>
                  <span className="text-2xl font-bold">${tierInfo.price}</span>/month
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Up to {tierInfo.employeeLimit} employees</p>
                  <ul className="space-y-1 text-sm">
                    {tierInfo.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                {isCurrent && (
                  <p className="text-sm font-medium text-muted-foreground">Current plan</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {showUpgradeCta && (
        <div>
          <Button asChild>
            <Link href="/settings/plan">Choose your plan</Link>
          </Button>
        </div>
      )}

      {hasPaidPlan && (
        <div className="mt-6 flex gap-2">
          <Button
            variant="outline"
            onClick={handleManageBilling}
            disabled={billingPortalLoading}
          >
            {billingPortalLoading ? 'Opening...' : 'Manage billing'}
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowCancelDialog(true)}
          >
            Cancel Subscription
          </Button>
        </div>
      )}

      <div className="mt-6">
        <BillingHistory />
      </div>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription? You'll be downgraded to the Free plan and lose access to premium features.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={cancelling}
            >
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
