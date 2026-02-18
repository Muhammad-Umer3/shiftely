'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SUBSCRIPTION_TIERS } from '@/lib/subscription-tiers'
import { useState } from 'react'
import { Check } from 'lucide-react'
import { toast } from 'sonner'
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
  organizationId,
}: {
  currentTier: string
  organizationId: string
}) {
  const [loading, setLoading] = useState<string | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const handleSubscribe = async (tier: keyof typeof SUBSCRIPTION_TIERS) => {
    setLoading(tier)
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error('Failed to create checkout session')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(null)
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

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-2">Current Plan: {SUBSCRIPTION_TIERS[currentTier as keyof typeof SUBSCRIPTION_TIERS]?.name || currentTier}</p>
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
                <Button
                  className="w-full"
                  variant={isCurrent ? 'outline' : 'default'}
                  onClick={() => handleSubscribe(tier)}
                  disabled={isCurrent || loading !== null}
                >
                  {isCurrent ? 'Current Plan' : loading === tier ? 'Processing...' : 'Subscribe'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {currentTier !== 'FREE' && (
        <div className="mt-6">
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
