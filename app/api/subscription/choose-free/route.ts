import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'

/**
 * Set organization to Free plan and clear trial.
 * Used when user explicitly chooses Free from the upgrade flow.
 */
export async function POST() {
  try {
    const user = await requireAuth()

    await prisma.organization.update({
      where: { id: user.organizationId },
      data: {
        subscriptionTier: 'FREE',
        trialEndsAt: null,
      },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Choose free error:', error)
    return NextResponse.json(
      { message: 'Failed to update plan' },
      { status: 500 }
    )
  }
}
