/**
 * Helpers for displaying employee info when user may be null (employee without login).
 */

export type EmployeeWithOptionalUser = {
  id?: string
  name?: string | null
  phone?: string | null
  user?: {
    name: string | null
    email: string
    phone?: string | null
  } | null
  [key: string]: unknown
}

export function getEmployeeDisplayName(employee: EmployeeWithOptionalUser | null | undefined): string {
  if (!employee) return 'Unnamed'
  return employee.user?.name ?? employee.name ?? 'Unnamed'
}

export function getEmployeeDisplayContact(employee: EmployeeWithOptionalUser | null | undefined): string {
  if (!employee) return '—'
  return employee.user?.email ?? employee.phone ?? '—'
}
