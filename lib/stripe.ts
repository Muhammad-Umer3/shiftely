import Stripe from 'stripe'
import { SUBSCRIPTION_TIERS } from './subscription-tiers'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-01-28.clover',
})

// Re-export for convenience in server components
export { SUBSCRIPTION_TIERS }

// Optional: Pre-created Stripe Price IDs
// Set these in your .env file after creating products/prices in Stripe Dashboard
// Format: price_xxxxx (for test mode) or price_xxxxx (for live mode)
export const STRIPE_PRICE_IDS = {
  GROWTH: process.env.STRIPE_PRICE_ID_GROWTH || null,
  PRO: process.env.STRIPE_PRICE_ID_PRO || null,
} as const

/**
 * Helper function to get line item for checkout session
 * Uses pre-created price ID if available, otherwise falls back to price_data
 */
export function getLineItemForTier(tier: keyof typeof SUBSCRIPTION_TIERS) {
  const tierInfo = SUBSCRIPTION_TIERS[tier]
  
  if (tier === 'FREE') {
    throw new Error('Cannot create checkout for FREE tier')
  }

  // If price ID is configured, use it (recommended for production)
  const priceId = STRIPE_PRICE_IDS[tier as 'GROWTH' | 'PRO']
  if (priceId) {
    return {
      price: priceId,
      quantity: 1,
    }
  }

  // Otherwise, use price_data (creates product/price on-the-fly)
  return {
    price_data: {
      currency: 'usd',
      product_data: {
        name: `${tierInfo.name} Plan`,
        description: tierInfo.features.join(', '),
      },
      recurring: {
        interval: 'month' as const,
      },
      unit_amount: tierInfo.price * 100, // Convert to cents
    },
    quantity: 1,
  }
}
