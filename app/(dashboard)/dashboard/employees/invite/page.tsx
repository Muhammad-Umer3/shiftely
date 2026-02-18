import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { requirePermission } from '@/lib/utils/auth'
import { PERMISSIONS } from '@/lib/permissions/permissions'
import { InviteEmployeeForm } from '@/components/employees/invite-employee-form'
import Link from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'

export default async function InviteEmployeePage() {
  await requirePermission(PERMISSIONS.EMPLOYEE_CREATE)

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/employees"
        className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-amber-400 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to team
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-stone-900">Invite Team Member</h1>
        <p className="text-stone-600 mt-1">
          Send an invitation email. They&apos;ll create their account and join your organization.
        </p>
      </div>

      <Card className="border-stone-200 bg-white max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Mail className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <CardTitle className="text-stone-900">Send invitation</CardTitle>
              <CardDescription className="text-stone-600">
                Enter their email address. The invitation expires in 7 days.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <InviteEmployeeForm redirectTo="/dashboard/employees" />
        </CardContent>
      </Card>
    </div>
  )
}
