import { redirect } from 'next/navigation'
import { requirePermission } from '@/lib/utils/auth'
import { PERMISSIONS } from '@/lib/permissions/permissions'

export default async function NewEmployeePage() {
  await requirePermission(PERMISSIONS.EMPLOYEE_CREATE)
  redirect('/employees?add=1')
}
