import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const user = await requireAuth()

    const employees = await prisma.employee.findMany({
      where: { organizationId: user.organizationId },
      select: { roleType: true },
    })

    const roleTypes = [...new Set(employees.map((e) => e.roleType).filter((r): r is string => !!r))].sort()

    return NextResponse.json({ roleTypes }, { status: 200 })
  } catch (error) {
    console.error('Error fetching role types:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
