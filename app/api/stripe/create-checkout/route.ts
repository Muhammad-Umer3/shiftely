import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { stripe, SUBSCRIPTION_TIERS, getLineItemForTier } from '@/lib/stripe'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { tier } = body

    if (!tier || !SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS]) {
      return NextResponse.json({ message: 'Invalid tier' }, { status: 400 })
    }

    if (tier === 'FREE') {
      return NextResponse.json({ message: 'Cannot create checkout for FREE tier' }, { status: 400 })
    }

    // Get or create Stripe customer
    let organization = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: { stripeCustomerId: true },
    })

    let customerId = organization?.stripeCustomerId

    if (!customerId) {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        metadata: {
          organizationId: user.organizationId,
        },
      })

      customerId = customer.id

      // Store customer ID in database
      await prisma.organization.update({
        where: { id: user.organizationId },
        data: { stripeCustomerId: customerId },
      })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [getLineItemForTier(tier as keyof typeof SUBSCRIPTION_TIERS)],
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
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
