import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/middleware/error-handler'
import { signOut } from '@/server/auth'

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth()

    // Delete user and all related data (cascade deletes will handle related records)
    await prisma.user.delete({
      where: { id: user.id },
    })

    // If this was the last user in the organization, delete the organization too
    const orgUsers = await prisma.user.count({
      where: { organizationId: user.organizationId },
    })

    if (orgUsers === 0) {
      await prisma.organization.delete({
        where: { id: user.organizationId },
      })
    }

    return NextResponse.json(
      { message: 'Account deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
