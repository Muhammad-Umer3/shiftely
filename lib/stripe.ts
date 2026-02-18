import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-01-28.clover',
})

// Optional: Pre-created Stripe Price IDs
// Set these in your .env file after creating products/prices in Stripe Dashboard
// Format: price_xxxxx (for test mode) or price_xxxxx (for live mode)
export const STRIPE_PRICE_IDS = {
  GROWTH: process.env.STRIPE_PRICE_ID_GROWTH || null,
  PRO: process.env.STRIPE_PRICE_ID_PRO || null,
} as const

export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: 'Free',
    price: 0,
    employeeLimit: 5,
    scheduleLimit: 1, // Only 1 active schedule at a time
    features: [
      'Core scheduling',
      'Basic notifications',
      'Up to 5 employees',
      '1 active schedule',
    ],
  },
  GROWTH: {
    name: 'Growth',
    price: 29,
    priceId: STRIPE_PRICE_IDS.GROWTH,
    employeeLimit: 15,
    scheduleLimit: null, // Unlimited
    features: [
      'All Free features',
      'Up to 15 employees',
      'Unlimited schedules',
      'AI schedule suggestions',
      'Shift swap requests',
      'Overtime alerts',
      'Basic analytics',
    ],
  },
  PRO: {
    name: 'Pro',
    price: 79,
    priceId: STRIPE_PRICE_IDS.PRO,
    employeeLimit: 100,
    scheduleLimit: null, // Unlimited
    features: [
      'All Growth features',
      'Up to 100 employees',
      'Advanced AI recommendations',
      'CSV payroll export',
      'Advanced analytics',
      'Custom roles & permissions',
      'Priority support',
    ],
  },
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
  if ('priceId' in tierInfo && tierInfo.priceId) {
    return {
      price: tierInfo.priceId,
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
