import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { stripe, SUBSCRIPTION_TIERS, STRIPE_PRICE_IDS, getLineItemForTier } from '@/lib/stripe'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/middleware/error-handler'
import { z } from 'zod'
import Stripe from 'stripe'

const upgradeSchema = z.object({
  tier: z.enum(['GROWTH', 'PRO']),
})

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { tier } = upgradeSchema.parse(body)

    if (!SUBSCRIPTION_TIERS[tier]) {
      return NextResponse.json({ message: 'Invalid tier' }, { status: 400 })
    }

    // Get organization with Stripe customer ID
    const organization = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: { stripeCustomerId: true, stripeSubscriptionId: true },
    })

    if (!organization?.stripeCustomerId) {
      return NextResponse.json(
        { message: 'No customer found. Please create a subscription first.' },
        { status: 400 }
      )
    }

    // If there's an existing subscription, update it instead of creating a new checkout
    if (organization.stripeSubscriptionId) {
      const priceId = STRIPE_PRICE_IDS[tier]
      const subscription = await stripe.subscriptions.retrieve(
        organization.stripeSubscriptionId
      )

      // Price ID is required for subscription updates (use price_data fallback not supported for updates)
      if (!priceId) {
        return NextResponse.json(
          { message: 'Price ID not configured for this tier. Please set STRIPE_PRICE_ID_GROWTH and STRIPE_PRICE_ID_PRO in your environment.' },
          { status: 400 }
        )
      }

      // Prepare update data
      const updateData: Stripe.SubscriptionUpdateParams = {
        metadata: {
          organizationId: user.organizationId,
          tier,
        },
        proration_behavior: 'always_invoice', // Prorate the difference
        items: [
          {
            id: subscription.items.data[0].id,
            price: priceId,
          },
        ],
      }

      await stripe.subscriptions.update(
        organization.stripeSubscriptionId,
        updateData
      )

      return NextResponse.json(
        { message: 'Subscription upgraded successfully' },
        { status: 200 }
      )
    }

    // If no existing subscription, create a checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: organization.stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [getLineItemForTier(tier)],
      success_url: `${process.env.NEXTAUTH_URL}/settings?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/settings?canceled=true`,
      client_reference_id: user.organizationId,
      metadata: {
        organizationId: user.organizationId,
        tier,
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url }, { status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}
