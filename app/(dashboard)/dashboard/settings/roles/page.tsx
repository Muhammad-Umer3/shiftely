import { requireAuth } from '@/lib/utils/auth'
import { PermissionService } from '@/server/services/permissions/permission.service'
import { PERMISSIONS } from '@/lib/permissions/permissions'
import { RoleManager } from '@/components/permissions/role-manager'
import { UserRoleAssignment } from '@/components/permissions/user-role-assignment'
import { PermissionGuard } from '@/components/guards/permission-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function RolesPage() {
  const user = await requireAuth()

  // Check if user can manage roles
  const canManage = await PermissionService.hasPermission(
    user.id,
    user.organizationId,
    PERMISSIONS.SETTINGS_MANAGE_ROLES
  )

  if (!canManage) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">You don't have permission to manage roles.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Roles & Permissions</h1>
        <p className="text-muted-foreground">Manage roles and assign them to users</p>
      </div>

      <PermissionGuard permission={PERMISSIONS.SETTINGS_MANAGE_ROLES}>
        <RoleManager organizationId={user.organizationId} />
      </PermissionGuard>

      <PermissionGuard permission={PERMISSIONS.SETTINGS_MANAGE_ROLES}>
        <UserRoleAssignment organizationId={user.organizationId} />
      </PermissionGuard>
    </div>
  )
}
