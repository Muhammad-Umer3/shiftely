import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { requireAuth, requirePermission } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { SUBSCRIPTION_TIERS } from '@/lib/stripe'
import { SubscriptionSettings } from '@/components/settings/subscription-settings'
import { PERMISSIONS } from '@/lib/permissions/permissions'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Shield } from 'lucide-react'

export default async function SettingsPage() {
  const user = await requirePermission(PERMISSIONS.SETTINGS_VIEW)

  const organization = await prisma.organization.findUnique({
    where: { id: user.organizationId },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your organization settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Manage your subscription plan</CardDescription>
        </CardHeader>
        <CardContent>
          <SubscriptionSettings
            currentTier={organization?.subscriptionTier || 'FREE'}
            organizationId={user.organizationId}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Roles & Permissions</CardTitle>
          <CardDescription>Manage user roles and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/settings/roles">
            <Button variant="outline" className="w-full">
              <Shield className="mr-2 h-4 w-4" />
              Manage Roles & Permissions
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
