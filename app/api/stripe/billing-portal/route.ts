import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/middleware/error-handler'

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()

    // Get organization with Stripe customer ID
    const organization = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: { stripeCustomerId: true },
    })

    if (!organization?.stripeCustomerId) {
      return NextResponse.json(
        { message: 'No active subscription found' },
        { status: 400 }
      )
    }

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: organization.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/settings`,
    })

    return NextResponse.json({ url: session.url }, { status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}
