import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { requirePermission } from '@/lib/utils/auth'
import { PERMISSIONS } from '@/lib/permissions/permissions'
import { AddEmployeeForm } from '@/components/employees/add-employee-form'
import Link from 'next/link'
import { ArrowLeft, UserPlus } from 'lucide-react'

export default async function NewEmployeePage() {
  await requirePermission(PERMISSIONS.EMPLOYEE_CREATE)

  return (
    <div className="space-y-6">
      <Link
        href="/employees"
        className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-amber-400 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to team
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-stone-900">Add Employee</h1>
        <p className="text-stone-600 mt-1">
          Create an employee account with name, phone, and email. They can log in immediately.
        </p>
      </div>

      <Card className="border-stone-200 bg-white max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <CardTitle className="text-stone-900">New team member</CardTitle>
              <CardDescription className="text-stone-600">
                Enter their details. Leave and availability can be set on their profile.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AddEmployeeForm redirectTo="/employees" />
        </CardContent>
      </Card>
    </div>
  )
}
