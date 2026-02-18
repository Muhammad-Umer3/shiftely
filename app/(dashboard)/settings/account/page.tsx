import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { requireAuth } from '@/lib/utils/auth'
import { DataExport } from '@/components/settings/data-export'
import { DeleteAccount } from '@/components/settings/delete-account'

export default async function AccountSettingsPage() {
  const user = await requireAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account data and preferences</p>
      </div>

      <DataExport />
      <DeleteAccount />
    </div>
  )
}
