import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/middleware/error-handler'

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()

    // Get organization with Stripe subscription ID
    const organization = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: { stripeSubscriptionId: true },
    })

    if (organization?.stripeSubscriptionId) {
      // Cancel the Stripe subscription
      await stripe.subscriptions.cancel(organization.stripeSubscriptionId)
    }

    // Update organization to FREE tier and clear subscription ID
    await prisma.organization.update({
      where: { id: user.organizationId },
      data: {
        subscriptionTier: 'FREE',
        stripeSubscriptionId: null,
      },
    })

    return NextResponse.json(
      { message: 'Subscription cancelled successfully' },
      { status: 200 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
