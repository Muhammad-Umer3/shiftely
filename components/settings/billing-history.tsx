'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { toast } from 'sonner'

export function BillingHistory() {
  const [loading, setLoading] = useState(false)

  const handleBillingPortal = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/billing-portal', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error('Failed to open billing portal')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
        <CardDescription>View and manage your invoices and payment methods</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleBillingPortal} disabled={loading} variant="outline">
          {loading ? 'Loading...' : 'Open Billing Portal'}
        </Button>
        <p className="text-sm text-muted-foreground mt-4">
          Manage your payment methods, view invoices, and update billing information through the Stripe billing portal.
        </p>
      </CardContent>
    </Card>
  )
}
