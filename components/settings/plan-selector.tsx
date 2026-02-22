'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SUBSCRIPTION_TIERS } from '@/lib/subscription-tiers'
import { useState } from 'react'
import { Check } from 'lucide-react'
import { toast } from 'sonner'

type TierKey = keyof typeof SUBSCRIPTION_TIERS

export function PlanSelector({
  currentTier,
  subscriptionTier,
}: {
  currentTier: string
  subscriptionTier: string
}) {
  const [loading, setLoading] = useState<TierKey | null>(null)

  const handleSelectFree = async () => {
    setLoading('FREE')
    try {
      const response = await fetch('/api/subscription/choose-free', {
        method: 'POST',
      })
      if (response.ok) {
        window.location.href = '/settings'
      } else {
        const data = await response.json()
        toast.error(data.message || 'Failed to update plan')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setLoading(null)
    }
  }

  const handleSelectPaid = async (tier: 'GROWTH' | 'PRO') => {
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
        toast.error('Failed to start checkout')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-3 max-w-5xl">
      {(Object.keys(SUBSCRIPTION_TIERS) as TierKey[]).map((tier) => {
        const tierInfo = SUBSCRIPTION_TIERS[tier]
        const isCurrent = currentTier === tier
        const isFree = tier === 'FREE'

        return (
          <Card
            key={tier}
            className={isCurrent ? 'border-blue-500 ring-2 ring-blue-500/20' : ''}
          >
            <CardHeader>
              <CardTitle>{tierInfo.name}</CardTitle>
              <CardDescription>
                <span className="text-2xl font-bold">${tierInfo.price}</span>/month
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm font-medium">Up to {tierInfo.employeeLimit} employees</p>
              <ul className="space-y-1 text-sm">
                {tierInfo.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              {isFree ? (
                <Button
                  className="w-full"
                  variant={isCurrent ? 'outline' : 'secondary'}
                  onClick={handleSelectFree}
                  disabled={isCurrent || loading !== null}
                >
                  {loading === 'FREE'
                    ? 'Updating...'
                    : isCurrent
                      ? 'Current plan'
                      : 'Select Free'}
                </Button>
              ) : (
                <Button
                  className="w-full"
                  variant={isCurrent ? 'outline' : 'default'}
                  onClick={() => handleSelectPaid(tier)}
                  disabled={isCurrent || loading !== null}
                >
                  {loading === tier
                    ? 'Redirecting...'
                    : isCurrent
                      ? 'Current plan'
                      : `Select ${tierInfo.name}`}
                </Button>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
