import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db/prisma'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ message: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ message: 'Invalid signature' }, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const organizationId = session.metadata?.organizationId
      const tier = session.metadata?.tier
      const customerId = session.customer as string
      const subscriptionId = session.subscription as string

      if (organizationId && tier && customerId && subscriptionId) {
        await prisma.organization.update({
          where: { id: organizationId },
          data: {
            subscriptionTier: tier as any,
            trialEndsAt: null,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
          },
        })
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      // Find organization by Stripe customer ID
      const organization = await prisma.organization.findUnique({
        where: { stripeCustomerId: customerId },
      })

      if (organization) {
        // Downgrade to FREE tier and clear subscription ID
        await prisma.organization.update({
          where: { id: organization.id },
          data: {
            subscriptionTier: 'FREE',
            stripeSubscriptionId: null,
          },
        })
      }
    }

    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      // Find organization by Stripe customer ID
      const organization = await prisma.organization.findUnique({
        where: { stripeCustomerId: customerId },
      })

      if (organization) {
        // Update subscription ID if it changed
        await prisma.organization.update({
          where: { id: organization.id },
          data: {
            stripeSubscriptionId: subscription.id,
          },
        })

        // Optionally update tier based on subscription items
        // This would require mapping Stripe price IDs to tiers
        // For now, we'll keep the tier from metadata
      }
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string

      // Find organization by Stripe customer ID
      const organization = await prisma.organization.findUnique({
        where: { stripeCustomerId: customerId },
      })

      if (organization) {
        // You might want to send a notification or update status
        // For now, we'll just log it
        console.error(`Payment failed for organization ${organization.id}`)
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ message: 'Webhook processing failed' }, { status: 500 })
  }
}
