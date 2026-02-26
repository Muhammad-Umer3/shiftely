import { requirePermission } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { PERMISSIONS } from '@/lib/permissions/permissions'
import { checkPermission } from '@/lib/utils/auth'
import { EmployeesPageContent } from '@/components/employees/employees-page-content'

type PageProps = {
  searchParams?: Promise<{ add?: string }> | { add?: string }
}

export default async function EmployeesPage({ searchParams }: PageProps) {
  const user = await requirePermission(PERMISSIONS.EMPLOYEE_VIEW)

  const employeesRaw = await prisma.employee.findMany({
    where: { organizationId: user.organizationId },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  })

  const employees = employeesRaw.map((e) => ({
    ...e,
    hourlyRate: e.hourlyRate != null ? Number(e.hourlyRate) : null,
  }))

  let groups: Array<{
    id: string
    name: string
    members: Array<{
      employee: { id: string; name?: string | null; phone?: string | null; user: { name: string | null; email: string } | null }
    }>
  }> = []
  try {
    const groupsRaw = await prisma.employeeGroup.findMany({
      where: { organizationId: user.organizationId },
      include: {
        members: {
          include: {
            employee: {
              include: { user: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    })
    groups = groupsRaw.map((g) => ({
      id: g.id,
      name: g.name,
      members: g.members.map((m) => ({
        employee: {
          id: m.employee.id,
          name: m.employee.name,
          phone: m.employee.phone,
          user: m.employee.user,
        },
      })),
    }))
  } catch {
    groups = []
  }

  const canEdit = await checkPermission(PERMISSIONS.EMPLOYEE_CREATE)

  const params = searchParams ?? {}
  const resolved =
    typeof (params as Promise<unknown>).then === 'function'
      ? await (params as Promise<{ add?: string }>)
      : (params as { add?: string })

  return (
    <EmployeesPageContent
      employees={employees}
      groups={groups}
      canEdit={canEdit}
      openAddFromQuery={resolved?.add === '1'}
    />
  )
}
